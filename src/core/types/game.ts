export type GameStatus = 'owned' | 'wishlist';
export type GameLanguage = 'russian' | 'english' | 'languageIndependent' | 'other';
export type Complexity = 1 | 2 | 3 | 4 | 5;
export type GameKind = 'collection' | 'base' | 'expansion' | 'standalone';

export interface Game {
  id: string;
  title: string;
  titleOriginal: string;
  collectionId: string | null;
  cycleId: string | null;
  kind: GameKind;
  year: number | null;
  publisher: string;
  designers: string[];
  artists: string[];
  playerCountMin: number;
  playerCountMax: number;
  bestPlayerCount: string;
  playTimeMin: number;
  playTimeMax: number;
  age: number | null;
  complexity: Complexity;
  bggRating: number | null;
  bggLink: string;
  teseraLink: string;
  hobbygameLink: string;
  genres: string[];
  mechanics: string[];
  status: GameStatus;
  purchaseDate: Date | null;
  purchasePrice: number | null;
  language: GameLanguage;
  hasProtectors: boolean;
  protectorDetails: string;
  notes: string;
  photos: string[];
  isFavorite: boolean;
  tags: string[];
  missingComponents: string;
  acquisitionSource: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cycle {
  id: string;
  collectionId: string;
  title: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameStats {
  total: number;
  owned: number;
  wishlist: number;
  totalValue: number;
  completionPercent: number;
}

export type CreateGameData = Pick<Game, 'title'> & Partial<Omit<Game, 'id' | 'createdAt' | 'updatedAt'>>;
export type UpdateGameData = Partial<Omit<Game, 'id' | 'createdAt' | 'updatedAt'>>;
export type CreateCycleData = Pick<Cycle, 'title' | 'collectionId'> & Partial<Omit<Cycle, 'id' | 'createdAt' | 'updatedAt'>>;