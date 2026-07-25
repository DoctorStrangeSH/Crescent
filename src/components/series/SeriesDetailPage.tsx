// Файл: src/components/series/SeriesDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { seriesService } from '../../core/services/seriesService';
import type { BoardGame, GameSeries, SeriesStats } from '../../core/types/game';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { ArrowLeft, Plus, Check, ShoppingCart, Star, Shield, Edit3, Trash2, GripVertical, FolderPlus, Layers, Package } from 'lucide-react';

function SeriesDetailPage() {
  const { seriesId } = useParams<{ seriesId: string }>();
  const navigate = useNavigate();
  const games = useGameStore((s) => s.games);
  const cycles = useGameStore((s) => s.cycles);
  const addCycle = useGameStore((s) => s.addCycle);
  const deleteCycle = useGameStore((s) => s.deleteCycle);
  const updateGame = useGameStore((s) => s.updateGame);
  const deleteGame = useGameStore((s) => s.deleteGame);
  const loadAll = useGameStore((s) => s.loadAll);
  const openAddGameModal = useUIStore((s) => s.openAddGameModal);

  const [series, setSeries] = useState<GameSeries | null>(null);
  const [stats, setStats] = useState<SeriesStats | null>(null);
  const [showAddCycle, setShowAddCycle] = useState(false);
  const [newCycleTitle, setNewCycleTitle] = useState('');

  useEffect(() => {
    if (seriesId) {
      loadAll();
      seriesService.getById(seriesId).then((s) => { if (s) setSeries(s); });
      seriesService.getStats(seriesId).then(setStats);
    }
  }, [seriesId, games.length]);

  if (!seriesId || !series) return null;

  const seriesGames = games.filter(g => g.seriesId === seriesId);
  const seriesCycles = cycles
    .filter(c => c.seriesId === seriesId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const uncycledGames = seriesGames.filter(g => !g.cycleId);

  const handleToggleStatus = async (game: BoardGame) => {
    await updateGame(game.id, { status: game.status === 'owned' ? 'wishlist' : 'owned' });
  };

  const handleAddCycle = async () => {
    if (!newCycleTitle.trim()) return;
    await addCycle({ title: newCycleTitle.trim(), seriesId });
    setNewCycleTitle('');
    setShowAddCycle(false);
  };

  const handleDeleteCycle = async (cycleId: string) => {
    if (window.confirm('Удалить цикл? Игры останутся в серии.')) {
      await deleteCycle(cycleId);
    }
  };

  const handleAddGameToSeries = () => {
    openAddGameModal(seriesId);
  };

  // Drag and drop
  const handleDragStart = (e: React.DragEvent, gameId: string) => {
    e.dataTransfer.setData('text/plain', gameId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDropOnCycle = async (e: React.DragEvent, cycleId: string | null) => {
    e.preventDefault();
    const gameId = e.dataTransfer.getData('text/plain');
    if (gameId) {
      await updateGame(gameId, { cycleId });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Шапка */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate('/collection')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mt-1">
          <ArrowLeft className="w-4 h-4 text-crescent-muted" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-title font-bold text-gray-900 dark:text-gray-100">{series.title}</h1>
          {series.titleOriginal && <p className="text-sm text-crescent-muted mt-0.5">{series.titleOriginal}</p>}
        </div>
      </div>

      {/* Статистика */}
      {stats && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <StatBadge label="Всего" value={stats.totalGames.toString()} />
            <StatBadge label="Есть" value={stats.ownedGames.toString()} color="green" />
            <StatBadge label="Хочу" value={stats.wishlistGames.toString()} color="amber" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-crescent-muted">Прогресс коллекции</span>
              <span className="font-semibold text-crescent-accent">{stats.completionPercent}%</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-crescent-accent to-crescent-gold rounded-full transition-all duration-700 ease-out"
                style={{ width: `${stats.completionPercent}%` }}
              />
            </div>
          </div>
        </>
      )}

      {/* Кнопки */}
      <div className="flex flex-wrap gap-2">
        <Button icon={<Plus className="w-4 h-4" />} onClick={handleAddGameToSeries}>
          Добавить игру в серию
        </Button>
        <Button icon={<FolderPlus className="w-4 h-4" />} variant="secondary" onClick={() => setShowAddCycle(!showAddCycle)}>
          Создать цикл
        </Button>
      </div>

      {/* Форма добавления цикла */}
      {showAddCycle && (
        <div className="flex gap-2 items-center bg-gray-50 dark:bg-gray-800/30 p-3 rounded-2xl animate-slide-up">
          <input
            value={newCycleTitle}
            onChange={e => setNewCycleTitle(e.target.value)}
            placeholder="Название цикла (например: Наследие Данвича)"
            className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-crescent-accent/20"
            onKeyDown={e => e.key === 'Enter' && handleAddCycle()}
            autoFocus
          />
          <Button onClick={handleAddCycle} size="sm">Создать</Button>
        </div>
      )}

      {/* Циклы с играми */}
      {seriesCycles.map(cycle => {
        const cycleGames = seriesGames
          .filter(g => g.cycleId === cycle.id)
          .sort((a, b) => a.sortOrder - b.sortOrder);
        const owned = cycleGames.filter(g => g.status === 'owned').length;

        return (
          <div key={cycle.id}>
            <div className="flex items-center gap-2 mb-2 px-1">
              <Layers className="w-4 h-4 text-crescent-accent/70" />
              <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">{cycle.title}</h3>
              <Badge variant="ghost" size="sm">{owned}/{cycleGames.length}</Badge>
              <div className="flex-1" />
              <button onClick={() => handleDeleteCycle(cycle.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            <div
              className="border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl p-2 min-h-[60px] transition-all hover:border-gray-200 dark:hover:border-gray-700"
              onDrop={(e) => handleDropOnCycle(e, cycle.id)}
              onDragOver={handleDragOver}
            >
              {cycleGames.length === 0 ? (
                <p className="text-xs text-crescent-muted text-center py-3">Перетащите игры сюда</p>
              ) : (
                <div className="space-y-1">
                  {cycleGames.map(game => (
                    <DraggableGameRow
                      key={game.id}
                      game={game}
                      onToggle={() => handleToggleStatus(game)}
                      onEdit={() => useUIStore.getState().openEditGameModal(game.id)}
                      onDelete={() => { if (window.confirm('Удалить игру?')) deleteGame(game.id); }}
                      onDragStart={(e) => handleDragStart(e, game.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Разделитель */}
      {uncycledGames.length > 0 && seriesCycles.length > 0 && (
        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
          <span className="text-[11px] text-crescent-muted font-medium whitespace-nowrap">Одиночные</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
        </div>
      )}

      {/* Одиночные игры внутри серии */}
      <div
        className="border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl p-2 min-h-[60px] transition-all hover:border-gray-200 dark:hover:border-gray-700"
        onDrop={(e) => handleDropOnCycle(e, null)}
        onDragOver={handleDragOver}
      >
        {uncycledGames.length === 0 && seriesCycles.length > 0 ? (
          <p className="text-xs text-crescent-muted text-center py-3">Все игры распределены по циклам</p>
        ) : uncycledGames.length > 0 ? (
          <div className="space-y-1">
            {uncycledGames.map(game => (
              <DraggableGameRow
                key={game.id}
                game={game}
                onToggle={() => handleToggleStatus(game)}
                onEdit={() => useUIStore.getState().openEditGameModal(game.id)}
                onDelete={() => { if (window.confirm('Удалить игру?')) deleteGame(game.id); }}
                onDragStart={(e) => handleDragStart(e, game.id)}
              />
            ))}
          </div>
        ) : null}
      </div>

      {seriesGames.length === 0 && seriesCycles.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-10 h-10 text-crescent-muted mx-auto mb-3 opacity-50" />
          <p className="text-sm text-crescent-muted">В этой серии пока пусто</p>
          <p className="text-xs text-crescent-muted mt-1">Добавьте первую игру или создайте цикл</p>
        </div>
      )}
    </div>
  );
}

function StatBadge({ label, value, color = 'default' }: { label: string; value: string; color?: string }) {
  const colors: Record<string, string> = {
    default: 'bg-gray-50 dark:bg-gray-800/30 text-gray-600 dark:text-gray-400',
    green: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
  };
  return (
    <div className={`${colors[color] || colors.default} rounded-2xl p-3 text-center`}>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-[11px]">{label}</p>
    </div>
  );
}

function DraggableGameRow({ game, onToggle, onEdit, onDelete, onDragStart }: {
  game: BoardGame;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
}) {
  const isOwned = game.status === 'owned';
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`flex items-center gap-2 p-2 rounded-xl border transition-all cursor-grab active:cursor-grabbing active:opacity-70 ${
        isOwned
          ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30'
          : 'bg-white dark:bg-crescent-card-dark border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
      }`}
    >
      <GripVertical className="w-3 h-3 text-gray-300 dark:text-gray-700 flex-shrink-0 pointer-events-none" />
      <button
        type="button"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-all ${
          isOwned ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-amber-100 dark:hover:bg-amber-900/30'
        }`}
        title={isOwned ? 'Есть' : 'Хочу купить'}
      >
        {isOwned ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{game.title}</p>
      </div>
      {game.isFavorite && <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />}
      {game.hasProtectors && <Shield className="w-3 h-3 text-purple-400 flex-shrink-0" />}
      {game.myRating && <span className="text-[11px] text-crescent-muted flex-shrink-0">⭐{game.myRating}</span>}
      <button
        type="button"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onEdit(); }}
        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <Edit3 className="w-3 h-3" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="p-1 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}

export default SeriesDetailPage;