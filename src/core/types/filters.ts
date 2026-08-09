import type { GameStatus, GameLanguage, Complexity } from './game';

export type SortField = 'title' | 'createdAt' | 'updatedAt' | 'purchasePrice' | 'year' | 'bggRating';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig { field: SortField; direction: SortDirection; }

export interface GameFilters {
  search: string;
  status: GameStatus | 'all';
  hasProtectors: boolean | null;
  language: GameLanguage | 'all';
  complexity: Complexity | 'all';
  isFavorite: boolean | null;
  minYear: number | null;
  maxPrice: number | null;
}

export const DEFAULT_FILTERS: GameFilters = {
  search: '', status: 'all', hasProtectors: null, language: 'all', complexity: 'all', isFavorite: null, minYear: null, maxPrice: null,
};

export const DEFAULT_SORT: SortConfig = { field: 'createdAt', direction: 'desc' };