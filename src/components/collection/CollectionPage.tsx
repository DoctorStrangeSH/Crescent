// Файл: src/components/collection/CollectionPage.tsx
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { seriesService } from '../../core/services/seriesService';
import type { SeriesStats, BoardGame } from '../../core/types/game';
import AddSeriesModal from '../forms/AddSeriesModal';
import EmptyState from '../ui/EmptyState';
import Button from '../ui/Button';
import { Plus, Library, Layers, GripVertical, Trash2 } from 'lucide-react';

type FilterMode = 'all' | 'owned' | 'wishlist';

function CollectionPage() {
  const navigate = useNavigate();
  const { series, games, loadAll, updateGame, deleteGame } = useGameStore();
  const openAddGameModal = useUIStore(s => s.openAddGameModal);

  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);
  const [seriesStats, setSeriesStats] = useState<Record<string, SeriesStats>>({});
  const [dragOverSeriesId, setDragOverSeriesId] = useState<string | null>(null);
  const [draggedGameId, setDraggedGameId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterMode>('all');

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    const loadStats = async () => {
      const stats: Record<string, SeriesStats> = {};
      for (const s of series) { stats[s.id] = await seriesService.getStats(s.id); }
      setSeriesStats(stats);
    };
    loadStats();
  }, [series, games]);

  const standaloneGames = useMemo(() => {
    let filtered = games.filter(g => g.seriesId === null);
    if (filter === 'owned') filtered = filtered.filter(g => g.status === 'owned');
    if (filter === 'wishlist') filtered = filtered.filter(g => g.status === 'wishlist');
    return filtered;
  }, [games, filter]);

  const hasContent = series.length > 0 || games.filter(g => g.seriesId === null).length > 0;

  // Drag-and-drop
  const handleGameDragStart = (e: React.DragEvent, gameId: string) => {
    e.dataTransfer.setData('text/plain', gameId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedGameId(gameId);
  };

  const handleGameDragEnd = () => {
    setDraggedGameId(null);
    setDragOverSeriesId(null);
  };

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
    const target = e.currentTarget as HTMLElement;
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!target.contains(relatedTarget)) {
      setDragOverSeriesId(null);
    }
  };

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

  // 🆕 Переключение статуса
  const handleToggleStatus = async (e: React.MouseEvent, game: BoardGame) => {
    e.stopPropagation();
    const newStatus = game.status === 'owned' ? 'wishlist' : 'owned';
    await updateGame(game.id, { status: newStatus });
  };

  // 🆕 Удаление игры
  const handleDeleteGame = async (e: React.MouseEvent, gameId: string, title: string) => {
    e.stopPropagation();
    if (window.confirm(`Удалить «${title}»?`)) {
      await deleteGame(gameId);
    }
  };

  // 🆕 Статистика по фильтру
  const allStandalone = games.filter(g => g.seriesId === null);
  const filterCounts = {
    all: allStandalone.length,
    owned: allStandalone.filter(g => g.status === 'owned').length,
    wishlist: allStandalone.filter(g => g.status === 'wishlist').length,
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
            {allStandalone.length > 0 && ` · ${allStandalone.length} игр`}
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

      {/* 🆕 Фильтры одиночных игр */}
      {allStandalone.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-crescent-muted uppercase tracking-widest">
              Одиночные игры
              <span className="ml-2 font-normal text-crescent-muted/50">— перетащите на серию выше</span>
            </h2>
            {/* 🆕 Кнопки фильтров */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-0.5">
              {(['all', 'owned', 'wishlist'] as FilterMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setFilter(mode)}
                  className={`px-3 py-1 text-[11px] font-medium rounded-lg transition-all ${
                    filter === mode
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-crescent-muted hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {mode === 'all' && `Все (${filterCounts.all})`}
                  {mode === 'owned' && `✅ Есть (${filterCounts.owned})`}
                  {mode === 'wishlist' && `🎯 Хочу (${filterCounts.wishlist})`}
                </button>
              ))}
            </div>
          </div>
          <div
            className="border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl p-3 min-h-[80px] transition-all hover:border-gray-200 dark:hover:border-gray-700"
            onDrop={handleStandaloneDrop}
            onDragOver={handleStandaloneDragOver}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              <AnimatePresence mode="popLayout">
                {standaloneGames.map(game => (
                  <motion.div
                    key={game.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`rounded-2xl border transition-all duration-200 shadow-card dark:shadow-card-dark hover:shadow-card-hover dark:hover:shadow-card-hover-dark group ${
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
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-0.5 pointer-events-none" />
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => useUIStore.getState().openEditGameModal(game.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2">{game.title}</h3>
                          </div>
                          {game.myRating && (
                            <div className="flex items-center gap-1 mt-1.5 text-[11px] text-crescent-muted">
                              ⭐ {game.myRating}/10
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                          {/* 🆕 Кнопка переключения статуса */}
                          <button
                            onClick={(e) => handleToggleStatus(e, game)}
                            className="text-base hover:scale-110 transition-transform"
                            title={game.status === 'owned' ? 'Есть в коллекции' : 'Хочу купить'}
                          >
                            {game.status === 'owned' ? '✅' : '🎯'}
                          </button>
                          {/* 🆕 Кнопка удаления */}
                          <button
                            onClick={(e) => handleDeleteGame(e, game.id, game.title)}
                            className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            title="Удалить"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {standaloneGames.length === 0 && (
              <p className="text-xs text-crescent-muted text-center py-4">
                {filter !== 'all' ? 'Нет игр по выбранному фильтру' : 'Все игры распределены по сериям 🎉'}
              </p>
            )}
          </div>
        </div>
      )}

      <AddSeriesModal isOpen={isSeriesModalOpen} onClose={() => setIsSeriesModalOpen(false)} />
    </div>
  );
}

export default CollectionPage;