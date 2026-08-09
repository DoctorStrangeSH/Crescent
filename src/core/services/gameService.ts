import { db } from '../db/database';
import type { Game, CreateGameData, UpdateGameData, GameStats } from '../types/game';

function id(): string { return crypto.randomUUID(); }

export const gameService = {
  async getAll(): Promise<Game[]> { return db.games.toArray(); },
  async getById(id: string): Promise<Game | undefined> { return db.games.get(id); },
  async getByCollectionId(cid: string): Promise<Game[]> { return db.games.where('collectionId').equals(cid).toArray(); },
  async getRoots(): Promise<Game[]> { const all = await db.games.toArray(); return all.filter(g => !g.collectionId); },

  async add(data: CreateGameData): Promise<Game> {
    const now = new Date();
    const g: Game = {
      id: id(), collectionId: data.collectionId ?? null, cycleId: data.cycleId ?? null, kind: data.kind ?? 'standalone',
      title: data.title, titleOriginal: data.titleOriginal ?? '', year: data.year ?? null,
      publisher: data.publisher ?? '', designers: data.designers ?? [], artists: data.artists ?? [],
      playerCountMin: data.playerCountMin ?? 1, playerCountMax: data.playerCountMax ?? 4,
      bestPlayerCount: '', playTimeMin: data.playTimeMin ?? 30, playTimeMax: data.playTimeMax ?? 60,
      age: null, complexity: data.complexity ?? 2, bggRating: null,
      bggLink: '', teseraLink: '', hobbygameLink: '',
      genres: data.genres ?? [], mechanics: data.mechanics ?? [], status: data.status ?? 'owned',
      purchaseDate: data.purchaseDate ?? null, purchasePrice: data.purchasePrice ?? null,
      language: data.language ?? 'russian', hasProtectors: data.hasProtectors ?? false, protectorDetails: '',
      notes: data.notes ?? '', photos: data.photos ?? [], isFavorite: data.isFavorite ?? false,
      tags: data.tags ?? [], missingComponents: '', acquisitionSource: '',
      sortOrder: data.sortOrder ?? 0, createdAt: now, updatedAt: now,
    };
    await db.games.add(g); return g;
  },

  async update(id: string, data: UpdateGameData): Promise<Game | undefined> {
    const ex = await db.games.get(id); if (!ex) return;
    const up: Game = { ...ex, ...data, id: ex.id, createdAt: ex.createdAt, updatedAt: new Date() };
    await db.games.put(up); return up;
  },

  async delete(id: string): Promise<boolean> {
    const ex = await db.games.get(id); if (!ex) return false;
    const children = await db.games.where('collectionId').equals(id).toArray();
    for (const c of children) await db.games.delete(c.id);
    const cycles = await db.cycles.where('collectionId').equals(id).toArray();
    for (const c of cycles) await db.cycles.delete(c.id);
    await db.games.delete(id); return true;
  },

  async getStats(cid: string): Promise<GameStats> {
    const items = await db.games.where('collectionId').equals(cid).toArray();
    const total = items.length, owned = items.filter(g => g.status === 'owned').length;
    const wishlist = items.filter(g => g.status === 'wishlist').length;
    const value = items.filter(g => g.status === 'owned').reduce((s, g) => s + (g.purchasePrice || 0), 0);
    return { total, owned, wishlist, totalValue: value, completionPercent: total > 0 ? Math.round((owned / total) * 100) : 0 };
  },
};