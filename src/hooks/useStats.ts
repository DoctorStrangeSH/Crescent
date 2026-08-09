import { useMemo } from 'react';
import { useGameStore } from '../store/gameStore';

export interface DashboardStats {
  totalGames: number;
  ownedGames: number;
  wishlistGames: number;
  totalValue: number;
  withoutProtectors: number;
  favorites: number;
  collections: number;
  totalExpansions: number;
}

export function useStats(): DashboardStats {
  const games = useGameStore(s => s.games);
  return useMemo(() => {
    const collections = new Set(games.filter(g => g.collectionId).map(g => g.collectionId)).size;
    const expansions = games.filter(g => g.collectionId);
    const owned = games.filter(g => g.status === 'owned');
    const wishlist = games.filter(g => g.status === 'wishlist');
    const totalValue = owned.reduce((sum, g) => sum + (g.purchasePrice || 0), 0);
    const withoutProtectors = owned.filter(g => !g.hasProtectors).length;
    const favorites = games.filter(g => g.isFavorite).length;
    return { totalGames: games.length, ownedGames: owned.length, wishlistGames: wishlist.length, totalValue, withoutProtectors, favorites, collections, totalExpansions: expansions.length };
  }, [games]);
}