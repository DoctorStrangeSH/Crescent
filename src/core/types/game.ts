// Файл: src/core/types/game.ts

export type GameStatus = 'owned' | 'wishlist';
export type GameLanguage = 'russian' | 'english' | 'languageIndependent' | 'other';
export type Complexity = 1 | 2 | 3 | 4 | 5;

/** Одна игра */
export interface BoardGame {
  id: string;
  seriesId: string | null;
  cycleId: string | null;        // 🆕 Привязка к циклу (null = без цикла/одиночный сценарий)
  title: string;
  titleOriginal: string;
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
  myRating: number | null;
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
  isBaseGame: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

/** Серия игр */
export interface GameSeries {
  id: string;
  title: string;
  titleOriginal: string;
  description: string;
  photoUrl: string | null;
  bggLink: string;
  teseraLink: string;
  hobbygameLink: string;
  genres: string[];
  mechanics: string[];
  playerCountMin: number;
  playerCountMax: number;
  playTimeMin: number;
  playTimeMax: number;
  complexity: Complexity;
  tags: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

/** 🆕 Цикл внутри серии (например, "Наследие Данвича") */
export interface GameCycle {
  id: string;
  seriesId: string;
  title: string;                 // "Наследие Данвича"
  sortOrder: number;             // Порядок цикла в серии
  createdAt: Date;
  updatedAt: Date;
}

export type CreateBoardGameData = Pick<BoardGame, 'title'> & Partial<Omit<BoardGame, 'id' | 'createdAt' | 'updatedAt'>>;
export type UpdateBoardGameData = Partial<Omit<BoardGame, 'id' | 'createdAt' | 'updatedAt'>>;
export type CreateSeriesData = Pick<GameSeries, 'title'> & Partial<Omit<GameSeries, 'id' | 'createdAt' | 'updatedAt'>>;
export type UpdateSeriesData = Partial<Omit<GameSeries, 'id' | 'createdAt' | 'updatedAt'>>;
export type CreateCycleData = Pick<GameCycle, 'title' | 'seriesId'> & Partial<Omit<GameCycle, 'id' | 'createdAt' | 'updatedAt'>>;

export interface SeriesStats {
  totalGames: number;
  ownedGames: number;
  wishlistGames: number;
  ownedBaseGame: boolean;
  totalValue: number;
  completionPercent: number;
}