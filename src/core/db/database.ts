import Dexie, { type Table } from 'dexie';
import type { Game, Cycle } from '../types/game';

class CrescentDB extends Dexie {
  games!: Table<Game, string>;
  cycles!: Table<Cycle, string>;

  constructor() {
    super('CrescentDBv4');
    this.version(1).stores({
      games: `id, collectionId, cycleId, kind, title, status, language, complexity, purchasePrice, hasProtectors, isFavorite, sortOrder, createdAt, updatedAt, *genres, *mechanics, *tags`,
      cycles: `id, collectionId, title, sortOrder, createdAt, updatedAt`
    });
  }
}

export const db = new CrescentDB();