// Файл: src/core/services/seriesService.ts
import { db } from '../db/database';
import type { GameSeries, GameCycle, CreateSeriesData, UpdateSeriesData, CreateCycleData, SeriesStats } from '../types/game';
import { gameService } from './gameService';

function generateId(): string {
  return crypto.randomUUID();
}

export const seriesService = {
  async getAll(): Promise<GameSeries[]> {
    return db.series.toArray();
  },

  async getById(id: string): Promise<GameSeries | undefined> {
    return db.series.get(id);
  },

  async add(data: CreateSeriesData): Promise<GameSeries> {
    const now = new Date();
    const s: GameSeries = {
      id: generateId(),
      title: data.title,
      titleOriginal: data.titleOriginal ?? '',
      description: data.description ?? '',
      photoUrl: data.photoUrl ?? null,
      bggLink: data.bggLink ?? '',
      teseraLink: data.teseraLink ?? '',
      hobbygameLink: data.hobbygameLink ?? '',
      genres: data.genres ?? [],
      mechanics: data.mechanics ?? [],
      playerCountMin: data.playerCountMin ?? 1,
      playerCountMax: data.playerCountMax ?? 4,
      playTimeMin: data.playTimeMin ?? 30,
      playTimeMax: data.playTimeMax ?? 60,
      complexity: data.complexity ?? 2,
      tags: data.tags ?? [],
      notes: data.notes ?? '',
      createdAt: now,
      updatedAt: now,
    };
    await db.series.add(s);
    return s;
  },

  async update(id: string, data: UpdateSeriesData): Promise<GameSeries | undefined> {
    const existing = await db.series.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, id: existing.id, createdAt: existing.createdAt, updatedAt: new Date() };
    await db.series.put(updated);
    return updated;
  },

  async delete(id: string): Promise<boolean> {
    const existing = await db.series.get(id);
    if (!existing) return false;
    const games = await gameService.getBySeriesId(id);
    for (const g of games) await gameService.delete(g.id);
    const cycles = await db.cycles.where('seriesId').equals(id).toArray();
    for (const c of cycles) await db.cycles.delete(c.id);
    await db.series.delete(id);
    return true;
  },

  // 🆕 Циклы
  async getCycles(seriesId: string): Promise<GameCycle[]> {
    return db.cycles.where('seriesId').equals(seriesId).sortBy('sortOrder');
  },

  async addCycle(data: CreateCycleData): Promise<GameCycle> {
    const now = new Date();
    const maxOrder = await db.cycles.where('seriesId').equals(data.seriesId).count();
    const c: GameCycle = {
      id: generateId(),
      seriesId: data.seriesId,
      title: data.title,
      sortOrder: data.sortOrder ?? maxOrder,
      createdAt: now,
      updatedAt: now,
    };
    await db.cycles.add(c);
    return c;
  },

  async updateCycleOrder(id: string, newOrder: number): Promise<void> {
    await db.cycles.update(id, { sortOrder: newOrder, updatedAt: new Date() });
  },

  async deleteCycle(id: string): Promise<void> {
    // Игры цикла становятся одиночными сценариями (cycleId = null)
    const games = await db.games.where('cycleId').equals(id).toArray();
    for (const g of games) {
      await db.games.update(g.id, { cycleId: null });
    }
    await db.cycles.delete(id);
  },

  async getStats(seriesId: string): Promise<SeriesStats> {
    const games = await gameService.getBySeriesId(seriesId);
    const total = games.length;
    const owned = games.filter(g => g.status === 'owned').length;
    const wishlist = games.filter(g => g.status === 'wishlist').length;
    const ownedBase = games.some(g => g.isBaseGame && g.status === 'owned');
    const value = games.filter(g => g.status === 'owned').reduce((s, g) => s + (g.purchasePrice || 0), 0);
    const pct = total > 0 ? Math.round((owned / total) * 100) : 0;
    return { totalGames: total, ownedGames: owned, wishlistGames: wishlist, ownedBaseGame: ownedBase, totalValue: value, completionPercent: pct };
  },
};