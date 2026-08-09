import { useMemo } from 'react';
import { useGameStore } from '../store/gameStore';

export interface DashboardStats {
  total: number; owned: number; wishlist: number; totalValue: number;
  withoutProtectors: number; favorites: number; collections: number;
}

export function useStats(): DashboardStats {
  const games = useGameStore(s => s.games);
  return useMemo(() => {
    const owned = games.filter(g => g.status === 'owned');
    const collections = new Set(games.filter(g => g.collectionId).map(g => g.collectionId)).size;
    return {
      total: games.length, owned: owned.length, wishlist: games.filter(g => g.status === 'wishlist').length,
      totalValue: owned.reduce((s, g) => s + (g.purchasePrice || 0), 0),
      withoutProtectors: owned.filter(g => !g.hasProtectors).length,
      favorites: games.filter(g => g.isFavorite).length, collections,
    };
  }, [games]);
}