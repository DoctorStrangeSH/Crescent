import { db } from '../db/database';
import type { Game, CreateGameData, UpdateGameData, GameStats } from '../types/game';

function generateId(): string {
  return crypto.randomUUID();
}

export const gameService = {
  async getAll(): Promise<Game[]> {
    return db.games.toArray();
  },

  async getById(id: string): Promise<Game | undefined> {
    return db.games.get(id);
  },

  async getRootGames(): Promise<Game[]> {
    const all = await db.games.toArray();
    return all.filter(g => !g.parentId);
  },

  async getExpansions(parentId: string): Promise<Game[]> {
    return db.games.where('parentId').equals(parentId).toArray();
  },

  async getByCycleId(cycleId: string): Promise<Game[]> {
    return db.games.where('cycleId').equals(cycleId).toArray();
  },

  async add(data: CreateGameData): Promise<Game> {
    const now = new Date();
    const game: Game = {
      id: generateId(),
      parentId: data.parentId ?? null,
      cycleId: data.cycleId ?? null,
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
      sortOrder: data.sortOrder ?? 0,
      createdAt: now,
      updatedAt: now,
    };
    await db.games.add(game);
    return game;
  },

  async update(id: string, data: UpdateGameData): Promise<Game | undefined> {
    const existing = await db.games.get(id);
    if (!existing) return undefined;
    const updated: Game = { ...existing, ...data, id: existing.id, createdAt: existing.createdAt, updatedAt: new Date() };
    await db.games.put(updated);
    return updated;
  },

  async delete(id: string): Promise<boolean> {
    const existing = await db.games.get(id);
    if (!existing) return false;
    // Удаляем все дополнения
    const expansions = await db.games.where('parentId').equals(id).toArray();
    for (const exp of expansions) await db.games.delete(exp.id);
    // Удаляем циклы
    const cycles = await db.cycles.where('parentGameId').equals(id).toArray();
    for (const c of cycles) await db.cycles.delete(c.id);
    await db.games.delete(id);
    return true;
  },

  async getStats(gameId: string): Promise<GameStats> {
    const expansions = await db.games.where('parentId').equals(gameId).toArray();
    const total = expansions.length;
    const owned = expansions.filter(g => g.status === 'owned').length;
    const wishlist = expansions.filter(g => g.status === 'wishlist').length;
    const value = expansions.filter(g => g.status === 'owned').reduce((s, g) => s + (g.purchasePrice || 0), 0);
    const pct = total > 0 ? Math.round((owned / total) * 100) : 0;
    return { totalExpansions: total, ownedExpansions: owned, wishlistExpansions: wishlist, totalValue: value, completionPercent: pct };
  },

  async count(): Promise<number> {
    return db.games.count();
  },
};