import { useMemo } from 'react';
import { useGameStore } from '../store/gameStore';

export interface DashboardStats {
  totalGames: number;
  ownedGames: number;
  wishlistGames: number;
  totalValue: number;
  averageRating: number | null;
  withoutProtectors: number;
  favorites: number;
  rootGames: number;
  totalExpansions: number;
}

export function useStats(): DashboardStats {
  const games = useGameStore(s => s.games);

  return useMemo(() => {
    const root = games.filter(g => !g.parentId);
    const expansions = games.filter(g => g.parentId);
    const owned = games.filter(g => g.status === 'owned');
    const wishlist = games.filter(g => g.status === 'wishlist');
    const totalValue = owned.reduce((sum, g) => sum + (g.purchasePrice || 0), 0);
    const rated = owned.filter(g => g.myRating !== null);
    const avg = rated.length > 0 ? rated.reduce((sum, g) => sum + (g.myRating || 0), 0) / rated.length : null;
    const withoutProtectors = owned.filter(g => !g.hasProtectors).length;
    const favorites = games.filter(g => g.isFavorite).length;

    return {
      totalGames: games.length,
      ownedGames: owned.length,
      wishlistGames: wishlist.length,
      totalValue,
      averageRating: avg,
      withoutProtectors,
      favorites,
      rootGames: root.length,
      totalExpansions: expansions.length,
    };
  }, [games]);
}