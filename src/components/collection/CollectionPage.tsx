import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { gameService } from '../../core/services/gameService';
import type { Game, GameStats } from '../../core/types/game';
import EmptyState from '../ui/EmptyState';
import Button from '../ui/Button';
import { Plus, Library, Package, Trash2, Star, Shield, Edit3 } from 'lucide-react';

function CollectionPage() {
  const navigate = useNavigate();
  const games = useGameStore(s => s.games);
  const loadAll = useGameStore(s => s.loadAll);
  const updateGame = useGameStore(s => s.updateGame);
  const deleteGame = useGameStore(s => s.deleteGame);
  const openAddGameModal = useUIStore(s => s.openAddGameModal);
  const openEditGameModal = useUIStore(s => s.openEditGameModal);
  const [statsMap, setStatsMap] = useState<Record<string, GameStats>>({});

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    const load = async () => {
      const map: Record<string, GameStats> = {};
      for (const g of games.filter(x => x.kind === 'collection')) {
        map[g.id] = await gameService.getStats(g.id);
      }
      setStatsMap(map);
    };
    load();
  }, [games]);

  // ВСЕ корневые игры (без collectionId) — и хранилища, и одиночные, и без категории
  const rootGames = games.filter(g => !g.collectionId);

  const handleDelete = async (e: React.MouseEvent, game: Game) => {
    e.stopPropagation();
    if (window.confirm(`Удалить «${game.title}»?`)) await deleteGame(game.id);
  };

  const handleToggle = async (e: React.MouseEvent, game: Game) => {
    e.stopPropagation();
    await updateGame(game.id, { status: game.status === 'owned' ? 'wishlist' : 'owned' });
  };

  const handleEdit = (e: React.MouseEvent, game: Game) => {
    e.stopPropagation();
    openEditGameModal(game.id);
  };

  if (rootGames.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <EmptyState icon={<Library className="w-12 h-12 text-surface-muted" />} title="Коллекция пуста" description="Добавьте своё первое хранилище" actionLabel="Создать хранилище" onAction={() => openAddGameModal()} />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Коллекция</h1><p className="text-sm text-surface-muted mt-0.5">{rootGames.length} элементов</p></div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => openAddGameModal()}>Создать хранилище</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <AnimatePresence mode="popLayout">
          {rootGames.map(game => {
            const stats = statsMap[game.id];
            const hasContent = stats && stats.total > 0;
            return (
              <motion.div key={game.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/collection/${game.id}`)}
                className="group cursor-pointer bg-white dark:bg-surface-card-dark rounded-2xl border border-surface-border dark:border-surface-border-dark shadow-card dark:shadow-card-dark hover:shadow-card-hover dark:hover:shadow-card-hover-dark transition-all duration-300 overflow-hidden flex flex-col">
                {/* Картинка */}
                <div className="relative h-40 bg-gradient-to-br from-crescent-accent/10 to-crescent-gold/10 flex items-center justify-center overflow-hidden">
                  {game.photos?.length > 0 ? (
                    <img src={game.photos[0]} alt="" className="w-full h-full object-contain p-3" />
                  ) : (
                    <Package className="w-14 h-14 text-surface-muted/30" />
                  )}
                  {/* Кнопки */}
                  <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {game.kind !== 'collection' && (
                      <button onClick={(e) => handleToggle(e, game)} className="w-8 h-8 rounded-lg bg-white/90 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center text-sm hover:scale-110 transition-transform">
                        {game.status === 'owned' ? '✅' : '🎯'}
                      </button>
                    )}
                    <button onClick={(e) => handleEdit(e, game)} className="w-8 h-8 rounded-lg bg-white/90 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => handleDelete(e, game)} className="w-8 h-8 rounded-lg bg-white/90 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  {/* Прогресс */}
                  {hasContent && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-border dark:bg-surface-border-dark">
                      <div className="h-full bg-gradient-to-r from-crescent-accent to-crescent-gold" style={{ width: `${stats.completionPercent}%` }} />
                    </div>
                  )}
                </div>
                {/* Информация */}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-1.5">
                    {game.kind === 'collection' ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300">📚 ХРАНИЛИЩЕ</span>
                    ) : game.kind === 'base' ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">🎯 БАЗА</span>
                    ) : game.kind === 'expansion' ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300">📦 ДОП</span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">🎲 ИГРА</span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 leading-snug">{game.title}</h3>
                  <div className="flex items-center justify-between mt-auto pt-2">
                    {hasContent ? (
                      <>
                        <span className="text-xs text-surface-muted">{stats.owned}/{stats.total} предметов</span>
                        <span className="text-xs font-bold text-crescent-accent">{stats.completionPercent}%</span>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        {game.isFavorite && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                        {game.hasProtectors && <Shield className="w-3.5 h-3.5 text-purple-400" />}
                        <span className="text-xs text-surface-muted">{game.kind === 'collection' ? 'Пустое хранилище' : game.status === 'owned' ? 'Есть' : 'Хочу'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default CollectionPage;