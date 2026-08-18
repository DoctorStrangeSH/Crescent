import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { gameService } from '../../core/services/gameService';
import type { Game, GameStats } from '../../core/types/game';
import EmptyState from '../ui/EmptyState';
import Button from '../ui/Button';
import { Plus, Library, Package, Trash2, Star, Shield, Edit3, Check, ShoppingCart } from 'lucide-react';

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
        <EmptyState icon={<Library className="w-12 h-12 text-surface-muted" />} title="Коллекция пуста" description="Добавьте хранилище или игру" actionLabel="Добавить" onAction={() => openAddGameModal()} />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Коллекция</h1><p className="text-sm text-surface-muted mt-0.5">{rootGames.length} элементов</p></div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => openAddGameModal()}>Добавить</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <AnimatePresence mode="popLayout">
          {rootGames.map(game => {
            const stats = statsMap[game.id];
            const hasContent = game.kind === 'collection' && stats && stats.total > 0;
            return (
              <motion.div key={game.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/collection/${game.id}`)}
                className="group cursor-pointer bg-white dark:bg-surface-card-dark rounded-2xl border border-surface-border dark:border-surface-border-dark shadow-card dark:shadow-card-dark hover:shadow-card-hover dark:hover:shadow-card-hover-dark transition-all duration-300 overflow-hidden">
                <div className="relative h-52 bg-gradient-to-br from-crescent-accent/10 to-crescent-gold/10 flex items-center justify-center">
                  {game.photos?.length > 0 ? (
                    <img src={game.photos[0]} alt="" className="w-full h-full object-contain p-4" />
                  ) : (
                    <Package className="w-16 h-16 text-surface-muted/30" />
                  )}
                  {/* Кнопки на карточке */}
                  <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {game.kind !== 'collection' && (
                      <button onClick={(e) => handleToggle(e, game)} className="w-9 h-9 rounded-xl bg-white/90 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center text-base hover:scale-110 transition-transform shadow-sm">
                        {game.status === 'owned' ? <Check className="w-4 h-4 text-emerald-500" /> : <ShoppingCart className="w-4 h-4 text-amber-500" />}
                      </button>
                    )}
                    <button onClick={(e) => handleEdit(e, game)} className="w-9 h-9 rounded-xl bg-white/90 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
                      <Edit3 className="w-4 h-4 text-gray-700 dark:text-white" />
                    </button>
                    <button onClick={(e) => handleDelete(e, game)} className="w-9 h-9 rounded-xl bg-white/90 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors shadow-sm">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Прогресс-бар */}
                  {hasContent && (
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-surface-border dark:bg-surface-border-dark">
                      <div className="h-full bg-gradient-to-r from-crescent-accent to-crescent-gold transition-all duration-700" style={{ width: `${stats.completionPercent}%` }} />
                    </div>
                  )}
                  {/* Бейдж хранилища */}
                  {game.kind === 'collection' && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 text-[10px] font-bold rounded-lg bg-crescent-accent/20 text-crescent-accent">📚 ХРАНИЛИЩЕ</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-base text-gray-900 dark:text-white line-clamp-2 leading-snug bg-white/90 dark:bg-black/70 backdrop-blur-sm px-3 py-2 rounded-xl -mt-1">{game.title}</h3>
                  <div className="flex items-center justify-between mt-3">
                    {hasContent ? (
                      <>
                        <span className="text-sm text-surface-muted">{stats.owned}/{stats.total} предметов</span>
                        <span className="text-sm font-bold text-crescent-accent">{stats.completionPercent}%</span>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        {game.isFavorite && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                        {game.hasProtectors && <Shield className="w-4 h-4 text-purple-400" />}
                        <span className="text-sm text-surface-muted">{game.kind === 'collection' ? 'Хранилище' : game.kind === 'base' ? 'Базовая игра' : 'Игра'}</span>
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