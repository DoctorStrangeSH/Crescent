// Файл: src/core/services/gameService.ts
import { db } from '../db/database';
import type { BoardGame, CreateBoardGameData, UpdateBoardGameData } from '../types/game';

function generateId(): string {
  return crypto.randomUUID();
}

export const gameService = {
  async getAll(): Promise<BoardGame[]> {
    return db.games.toArray();
  },

  async getById(id: string): Promise<BoardGame | undefined> {
    return db.games.get(id);
  },

  async getBySeriesId(seriesId: string): Promise<BoardGame[]> {
    return db.games.where('seriesId').equals(seriesId).toArray();
  },

  async getStandalone(): Promise<BoardGame[]> {
    return db.games.filter(g => g.seriesId === null || g.seriesId === undefined).toArray();
  },

  async add(data: CreateBoardGameData): Promise<BoardGame> {
    const now = new Date();
    const newGame: BoardGame = {
      id: generateId(),
      seriesId: data.seriesId ?? null,
      title: data.title,
      titleOriginal: data.titleOriginal ?? '',
      year: data.year ?? null,
      publisher: data.publisher ?? '',
      designers: data.designers ?? [],
      artists: data.artists ?? [],
      playerCountMin: data.playerCountMin ?? 1,
      playerCountMax: data.playerCountMax ?? 4,
      bestPlayerCount: data.bestPlayerCount ?? '',
      playTimeMin: data.playTimeMin ?? 30,
      playTimeMax: data.playTimeMax ?? 60,
      age: data.age ?? null,
      complexity: data.complexity ?? 2,
      bggRating: data.bggRating ?? null,
      bggLink: data.bggLink ?? '',
      teseraLink: data.teseraLink ?? '',
      hobbygameLink: data.hobbygameLink ?? '',
      genres: data.genres ?? [],
      mechanics: data.mechanics ?? [],
      status: data.status ?? 'owned',
      myRating: data.myRating ?? null,
      purchaseDate: data.purchaseDate ?? null,
      purchasePrice: data.purchasePrice ?? null,
      language: data.language ?? 'russian',
      hasProtectors: data.hasProtectors ?? false,
      protectorDetails: data.protectorDetails ?? '',
      notes: data.notes ?? '',
      photos: data.photos ?? [],
      isFavorite: data.isFavorite ?? false,
      tags: data.tags ?? [],
      missingComponents: data.missingComponents ?? '',
      acquisitionSource: data.acquisitionSource ?? '',
      isBaseGame: data.isBaseGame ?? true,
      sortOrder: data.sortOrder ?? 0,
      createdAt: now,
      updatedAt: now,
    };
    await db.games.add(newGame);
    return newGame;
  },

  async update(id: string, data: UpdateBoardGameData): Promise<BoardGame | undefined> {
    const existing = await db.games.get(id);
    if (!existing) return undefined;
    const updated: BoardGame = {
      ...existing,
      ...data,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    };
    await db.games.put(updated);
    return updated;
  },

  async delete(id: string): Promise<boolean> {
    const existing = await db.games.get(id);
    if (!existing) return false;
    await db.games.delete(id);
    return true;
  },

  async count(): Promise<number> {
    return db.games.count();
  },
};