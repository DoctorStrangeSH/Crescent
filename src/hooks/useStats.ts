import { useMemo } from 'react';
import { useGameStore } from '../store/gameStore';

export interface DashboardStats {
  total: number;
  owned: number;
  wishlist: number;
  totalValue: number;
  withoutProtectors: number;
  favorites: number;
  collections: number;
}

export function useStats(): DashboardStats {
  const games = useGameStore(s => s.games);

  return useMemo(() => {
    // Не считаем хранилища играми
    const playableGames = games.filter(g => g.kind !== 'collection');
    const owned = playableGames.filter(g => g.status === 'owned');
    const collections = games.filter(g => g.kind === 'collection').length;

    return {
      total: playableGames.length,
      owned: owned.length,
      wishlist: playableGames.filter(g => g.status === 'wishlist').length,
      totalValue: owned.reduce((s, g) => s + (g.purchasePrice || 0), 0),
      withoutProtectors: owned.filter(g => !g.hasProtectors).length,
      favorites: playableGames.filter(g => g.isFavorite).length,
      collections,
    };
  }, [games]);
}