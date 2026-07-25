// Файл: src/components/collection/CollectionPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { seriesService } from '../../core/services/seriesService';
import type { SeriesStats } from '../../core/types/game';
import AddSeriesModal from '../forms/AddSeriesModal';
import EmptyState from '../ui/EmptyState';
import Button from '../ui/Button';
import { Plus, Library, Layers, GripVertical } from 'lucide-react';

function CollectionPage() {
  const navigate = useNavigate();
  const { series, games, loadAll, updateGame } = useGameStore();
  const openAddGameModal = useUIStore(s => s.openAddGameModal);

  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);
  const [seriesStats, setSeriesStats] = useState<Record<string, SeriesStats>>({});
  const [dragOverSeriesId, setDragOverSeriesId] = useState<string | null>(null);
  const [draggedGameId, setDraggedGameId] = useState<string | null>(null);

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    const loadStats = async () => {
      const stats: Record<string, SeriesStats> = {};
      for (const s of series) { stats[s.id] = await seriesService.getStats(s.id); }
      setSeriesStats(stats);
    };
    loadStats();
  }, [series, games]);

  const standaloneGames = games.filter(g => g.seriesId === null);
  const hasContent = series.length > 0 || standaloneGames.length > 0;

  // 🟢 Drag: начали тащить игру
  const handleGameDragStart = (e: React.DragEvent, gameId: string) => {
    e.dataTransfer.setData('text/plain', gameId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedGameId(gameId);
  };

  const handleGameDragEnd = () => {
    setDraggedGameId(null);
    setDragOverSeriesId(null);
  };

  // 🟢 Drag over: навели на серию
  const handleSeriesDragOver = (e: React.DragEvent, seriesId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSeriesId(seriesId);
  };

  const handleSeriesDragEnter = (e: React.DragEvent, seriesId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSeriesId(seriesId);
  };

  const handleSeriesDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Проверяем, что действительно покинули зону (не перешли на дочерний элемент)
    const target = e.currentTarget as HTMLElement;
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!target.contains(relatedTarget)) {
      setDragOverSeriesId(null);
    }
  };

  // 🟢 Drop: бросили на серию
  const handleSeriesDrop = async (e: React.DragEvent, seriesId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSeriesId(null);
    const gameId = e.dataTransfer.getData('text/plain');
    if (gameId) {
      await updateGame(gameId, { seriesId });
    }
    setDraggedGameId(null);
  };

  // 🟢 Drag over / drop: зона одиночных игр (отвязать от серии)
  const handleStandaloneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleStandaloneDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const gameId = e.dataTransfer.getData('text/plain');
    if (gameId) {
      await updateGame(gameId, { seriesId: null, cycleId: null });
    }
    setDraggedGameId(null);
  };

  if (!hasContent) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[80vh]">
          <EmptyState
            icon={<Library className="w-12 h-12 text-crescent-muted" />}
            title="Коллекция пуста"
            description="Создайте серию или добавьте первую игру, чтобы начать"
            actionLabel="Создать серию"
            onAction={() => setIsSeriesModalOpen(true)}
          />
        </div>
        <div className="flex justify-center pb-8 -mt-4 gap-2">
          <Button variant="secondary" icon={<Plus className="w-4 h-4" />} onClick={() => openAddGameModal()}>
            Добавить игру
          </Button>
        </div>
        <AddSeriesModal isOpen={isSeriesModalOpen} onClose={() => setIsSeriesModalOpen(false)} />
      </>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Заголовок */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-title font-bold text-gray-900 dark:text-gray-100">Коллекция</h1>
          <p className="text-sm text-crescent-muted mt-0.5">
            {series.length} {series.length === 1 ? 'серия' : series.length >= 2 && series.length <= 4 ? 'серии' : 'серий'}
            {standaloneGames.length > 0 && ` · ${standaloneGames.length} игр`}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="secondary" icon={<Layers className="w-4 h-4" />} onClick={() => setIsSeriesModalOpen(true)} className="flex-1 sm:flex-initial">
            Серия
          </Button>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => openAddGameModal()} className="flex-1 sm:flex-initial">
            Игра
          </Button>
        </div>
      </div>

      {/* Серии */}
      {series.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-crescent-muted uppercase tracking-widest mb-4">
            Серии
            <span className="ml-2 font-normal text-crescent-muted/50">— перетащите игру на серию</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            <AnimatePresence mode="popLayout">
              {series.map(s => {
                const st = seriesStats[s.id] || { totalGames: 0, ownedGames: 0, wishlistGames: 0, ownedBaseGame: false, totalValue: 0, completionPercent: 0 };
                const isDragOver = dragOverSeriesId === s.id;
                return (
                  <div
                    key={s.id}
                    className={`relative rounded-2xl border-2 transition-all duration-200 overflow-hidden cursor-pointer ${
                      isDragOver
                        ? 'border-crescent-accent bg-crescent-accent/5 shadow-lg scale-[1.02] z-10'
                        : 'border-transparent bg-white dark:bg-crescent-card-dark shadow-card dark:shadow-card-dark hover:shadow-card-hover dark:hover:shadow-card-hover-dark'
                    }`}
                    onClick={() => navigate(`/series/${s.id}`)}
                    onDragOver={(e) => handleSeriesDragOver(e, s.id)}
                    onDragEnter={(e) => handleSeriesDragEnter(e, s.id)}
                    onDragLeave={handleSeriesDragLeave}
                    onDrop={(e) => handleSeriesDrop(e, s.id)}
                  >
                    <div className="relative h-32 bg-gradient-to-br from-crescent-accent/5 to-crescent-gold/5 dark:from-crescent-accent/10 dark:to-crescent-gold/10 flex items-center justify-center">
                      {s.photoUrl ? (
                        <img src={s.photoUrl} alt={s.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className={`text-4xl transition-all ${isDragOver ? 'scale-125' : 'opacity-60'}`}>
                          {isDragOver ? '📥' : '📚'}
                        </span>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-800">
                        <div className="h-full bg-crescent-accent transition-all duration-700 rounded-r-full" style={{ width: `${st.completionPercent}%` }} />
                      </div>
                      {/* Оверлей при наведении с игрой */}
                      {isDragOver && (
                        <div className="absolute inset-0 bg-crescent-accent/20 flex items-center justify-center backdrop-blur-[1px]">
                          <span className="text-sm font-bold text-white bg-crescent-accent px-3 py-1.5 rounded-xl shadow-lg">
                            📥 Отпустите сюда
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug">{s.title}</h3>
                      <div className="flex items-center justify-between mt-2.5">
                        <span className="text-xs text-crescent-muted">{st.ownedGames}/{st.totalGames} игр</span>
                        <span className="text-xs font-semibold text-crescent-accent">{st.completionPercent}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Одиночные игры */}
      {standaloneGames.length > 0 && (
        <div
          onDragOver={handleStandaloneDragOver}
          onDrop={handleStandaloneDrop}
        >
          <h2 className="text-xs font-semibold text-crescent-muted uppercase tracking-widest mb-4">
            Одиночные игры
            <span className="ml-2 font-normal text-crescent-muted/50">— перетащите на серию выше</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            <AnimatePresence mode="popLayout">
              {standaloneGames.map(game => (
                <motion.div
                  key={game.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`rounded-2xl border transition-all duration-200 shadow-card dark:shadow-card-dark hover:shadow-card-hover dark:hover:shadow-card-hover-dark ${
                    draggedGameId === game.id ? 'opacity-40 scale-95 ring-2 ring-crescent-accent' : ''
                  } ${
                    game.status === 'owned'
                      ? 'bg-white dark:bg-crescent-card-dark border-gray-100/50 dark:border-gray-800/50'
                      : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30'
                  }`}
                >
                  <div
                    draggable
                    onDragStart={(e) => handleGameDragStart(e, game.id)}
                    onDragEnd={handleGameDragEnd}
                    className="cursor-grab active:cursor-grabbing p-4"
                    onClick={(e) => {
                      // Не открываем редактирование если был drag
                      if (draggedGameId) {
                        e.preventDefault();
                        return;
                      }
                      useUIStore.getState().openEditGameModal(game.id);
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-0.5 pointer-events-none" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2">{game.title}</h3>
                          <span className="text-base flex-shrink-0">{game.status === 'owned' ? '✅' : '🎯'}</span>
                        </div>
                        {game.myRating && (
                          <div className="flex items-center gap-1 mt-1.5 text-[11px] text-crescent-muted">
                            ⭐ {game.myRating}/10
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      <AddSeriesModal isOpen={isSeriesModalOpen} onClose={() => setIsSeriesModalOpen(false)} />
    </div>
  );
}

export default CollectionPage;