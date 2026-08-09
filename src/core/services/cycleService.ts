import { db } from '../db/database';
import type { Cycle, CreateCycleData } from '../types/game';

function generateId(): string { return crypto.randomUUID(); }

export const cycleService = {
  async getByCollectionId(collectionId: string): Promise<Cycle[]> {
    return db.cycles.where('collectionId').equals(collectionId).sortBy('sortOrder');
  },
  async getAll(): Promise<Cycle[]> { return db.cycles.toArray(); },

  async add(data: CreateCycleData): Promise<Cycle> {
    const now = new Date();
    const maxOrder = await db.cycles.where('collectionId').equals(data.collectionId).count();
    const cycle: Cycle = { id: generateId(), collectionId: data.collectionId, title: data.title, sortOrder: data.sortOrder ?? maxOrder, createdAt: now, updatedAt: now };
    await db.cycles.add(cycle); return cycle;
  },

  async update(id: string, data: Partial<Cycle>): Promise<void> {
    await db.cycles.update(id, { ...data, updatedAt: new Date() });
  },

  async delete(id: string): Promise<void> {
    const games = await db.games.where('cycleId').equals(id).toArray();
    for (const g of games) await db.games.update(g.id, { cycleId: null });
    await db.cycles.delete(id);
  },
};