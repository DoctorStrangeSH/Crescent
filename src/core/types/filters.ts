// Файл: src/core/types/filters.ts
import type { GameStatus, GameLanguage, Complexity } from './game';

export type SortField = 'title' | 'createdAt' | 'updatedAt' | 'myRating' | 'purchasePrice' | 'year' | 'bggRating';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface GameFilters {
  search: string;
  status: GameStatus | 'all';
  genres: string[];
  mechanics: string[];
  hasProtectors: boolean | null;
  language: GameLanguage | 'all';
  complexity: Complexity | 'all';
  isFavorite: boolean | null;
  tags: string[];
  minMyRating: number | null;
  maxPrice: number | null;
}

export const DEFAULT_FILTERS: GameFilters = {
  search: '',
  status: 'all',
  genres: [],
  mechanics: [],
  hasProtectors: null,
  language: 'all',
  complexity: 'all',
  isFavorite: null,
  tags: [],
  minMyRating: null,
  maxPrice: null,
};

export const DEFAULT_SORT: SortConfig = {
  field: 'createdAt',
  direction: 'desc',
};