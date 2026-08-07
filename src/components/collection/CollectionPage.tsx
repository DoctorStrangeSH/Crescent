import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { gameService } from '../../core/services/gameService';
import type { Game, GameStats } from '../../core/types/game';
import EmptyState from '../ui/EmptyState';
import Button from '../ui/Button';
import { Plus, Library, Star, Shield, Trash2, Package } from 'lucide-react';

function CollectionPage() {
  const navigate = useNavigate();
  const { games, loadAll, deleteGame, updateGame } = useGameStore();
  const openAddGameModal = useUIStore(s => s.openAddGameModal);
  const [statsMap, setStatsMap] = useState<Record<string, GameStats>>({});

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    const load = async () => {
      const map: Record<string, GameStats> = {};
      for (const g of games.filter(x => !x.parentId)) {
        map[g.id] = await gameService.getStats(g.id);
      }
      setStatsMap(map);
    };
    load();
  }, [games]);

  const rootGames = games.filter(g => !g.parentId);
  const hasContent = rootGames.length > 0;

  const handleDelete = async (e: React.MouseEvent, game: Game) => {
    e.stopPropagation();
    if (window.confirm(`Удалить «${game.title}» и все дополнения?`)) await deleteGame(game.id);
  };

  const handleToggle = async (e: React.MouseEvent, game: Game) => {
    e.stopPropagation();
    await updateGame(game.id, { status: game.status === 'owned' ? 'wishlist' : 'owned' });
  };

  if (!hasContent) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <EmptyState icon={<Library className="w-12 h-12 text-white/30" />} title="Коллекция пуста" description="Добавьте свою первую игру" actionLabel="Добавить игру" onAction={() => openAddGameModal()} />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Коллекция</h1>
          <p className="text-sm text-white/40 mt-0.5">{rootGames.length} {rootGames.length === 1 ? 'игра' : rootGames.length >= 2 && rootGames.length <= 4 ? 'игры' : 'игр'}</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => openAddGameModal()}>Добавить игру</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {rootGames.map(game => {
            const stats = statsMap[game.id] || { totalExpansions: 0, ownedExpansions: 0, wishlistExpansions: 0, totalValue: 0, completionPercent: 0 };
            const hasExpansions = stats.totalExpansions > 0;
            return (
              <motion.div key={game.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -4, scale: 1.02 }}
                onClick={() => navigate(`/game/${game.id}`)}
                className="group cursor-pointer bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <div className="relative h-44 bg-gradient-to-br from-crescent-accent/20 to-crescent-gold/20 flex items-center justify-center">
                  {game.photos && game.photos.length > 0 ? (
                    <img src={game.photos[0]} alt={game.title} className="w-full h-full object-contain p-4" />
                  ) : (
                    <Package className="w-12 h-12 text-white/20" />
                  )}
                  <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => handleToggle(e, game)} className="w-8 h-8 rounded-xl bg-black/50 backdrop-blur-sm flex items-center justify-center text-sm hover:scale-110 transition-transform">{game.status === 'owned' ? '✅' : '🎯'}</button>
                    <button onClick={(e) => handleDelete(e, game)} className="w-8 h-8 rounded-xl bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-red-500/50 transition-colors"><Trash2 className="w-4 h-4 text-white" /></button>
                  </div>
                  {hasExpansions && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                      <div className="h-full bg-gradient-to-r from-crescent-accent to-crescent-gold transition-all duration-700" style={{ width: `${stats.completionPercent}%` }} />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white line-clamp-2 leading-snug">{game.title}</h3>
                  <div className="flex items-center justify-between mt-2.5">
                    {hasExpansions ? (
                      <>
                        <span className="text-xs text-white/40">{stats.ownedExpansions}/{stats.totalExpansions} допов</span>
                        <span className="text-xs font-semibold text-crescent-accent">{stats.completionPercent}%</span>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        {game.isFavorite && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                        {game.hasProtectors && <Shield className="w-3.5 h-3.5 text-purple-400" />}
                        <span className="text-xs text-white/30">Без дополнений</span>
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