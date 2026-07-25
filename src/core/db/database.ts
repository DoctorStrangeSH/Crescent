// Файл: src/core/db/database.ts
import Dexie, { type Table } from 'dexie';
import type { BoardGame, GameSeries, GameCycle } from '../types/game';

class CrescentDatabase extends Dexie {
  games!: Table<BoardGame, string>;
  series!: Table<GameSeries, string>;
  cycles!: Table<GameCycle, string>;

  constructor() {
    super('CrescentDB');

    this.version(3).stores({
      games: `
        id,
        seriesId,
        cycleId,
        title,
        status,
        language,
        complexity,
        myRating,
        purchasePrice,
        hasProtectors,
        isFavorite,
        isBaseGame,
        sortOrder,
        createdAt,
        updatedAt,
        *genres,
        *mechanics,
        *tags
      `,
      series: `
        id,
        title,
        complexity,
        createdAt,
        updatedAt,
        *genres,
        *mechanics,
        *tags
      `,
      cycles: `
        id,
        seriesId,
        title,
        sortOrder,
        createdAt,
        updatedAt
      `
    });
  }
}

export const db = new CrescentDatabase();