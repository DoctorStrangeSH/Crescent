import { create } from 'zustand';
import type { Game, CreateGameData, UpdateGameData, Cycle, CreateCycleData } from '../core/types/game';
import { gameService } from '../core/services/gameService';
import { cycleService } from '../core/services/cycleService';

interface GameState {
  games: Game[]; cycles: Cycle[]; isLoading: boolean;
  loadAll: () => Promise<void>;
  addGame: (d: CreateGameData) => Promise<Game>;
  updateGame: (id: string, d: UpdateGameData) => Promise<void>;
  deleteGame: (id: string) => Promise<boolean>;
  addCycle: (d: CreateCycleData) => Promise<Cycle>;
  updateCycle: (id: string, d: Partial<Cycle>) => Promise<void>;
  deleteCycle: (id: string) => Promise<void>;
}

export const useGameStore = create<GameState>((set) => ({
  games: [], cycles: [], isLoading: false,

  loadAll: async () => {
    set({ isLoading: true });
    const [games, cycles] = await Promise.all([gameService.getAll(), cycleService.getAll()]);
    set({ games, cycles, isLoading: false });
  },

  addGame: async (d) => { const g = await gameService.add(d); set(s => ({ games: [...s.games, g] })); return g; },
  updateGame: async (id, d) => { const u = await gameService.update(id, d); if (u) set(s => ({ games: s.games.map(g => g.id === id ? u : g) })); },
  deleteGame: async (id) => { const ok = await gameService.delete(id); if (ok) set(s => ({ games: s.games.filter(g => g.id !== id && g.collectionId !== id), cycles: s.cycles.filter(c => c.collectionId !== id) })); return ok; },

  addCycle: async (d) => { const c = await cycleService.add(d); set(s => ({ cycles: [...s.cycles, c] })); return c; },
  updateCycle: async (id, d) => { await cycleService.update(id, d); set(s => ({ cycles: s.cycles.map(c => c.id === id ? { ...c, ...d } : c) })); },
  deleteCycle: async (id) => { await cycleService.delete(id); set(s => ({ cycles: s.cycles.filter(c => c.id !== id), games: s.games.map(g => g.cycleId === id ? { ...g, cycleId: null } : g) })); },
}));