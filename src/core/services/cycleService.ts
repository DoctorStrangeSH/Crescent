import { db } from '../db/database';
import type { Cycle, CreateCycleData } from '../types/game';

export const cycleService = {
  async getByCollectionId(cid: string) { return db.cycles.where('collectionId').equals(cid).sortBy('sortOrder'); },
  async getAll() { return db.cycles.toArray(); },
  async add(data: CreateCycleData): Promise<Cycle> {
    const now = new Date();
    const max = await db.cycles.where('collectionId').equals(data.collectionId).count();
    const c: Cycle = { id: crypto.randomUUID(), collectionId: data.collectionId, title: data.title, sortOrder: data.sortOrder ?? max, createdAt: now, updatedAt: now };
    await db.cycles.add(c); return c;
  },
  async update(id: string, data: Partial<Cycle>) { await db.cycles.update(id, { ...data, updatedAt: new Date() }); },
  async delete(id: string) {
    const games = await db.games.where('cycleId').equals(id).toArray();
    for (const g of games) await db.games.update(g.id, { cycleId: null });
    await db.cycles.delete(id);
  },
};