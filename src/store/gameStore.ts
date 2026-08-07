import { create } from 'zustand';
import type { Game, CreateGameData, UpdateGameData, Cycle, CreateCycleData } from '../core/types/game';
import type { GameFilters, SortConfig } from '../core/types/filters';
import { DEFAULT_FILTERS, DEFAULT_SORT } from '../core/types/filters';
import { gameService } from '../core/services/gameService';
import { cycleService } from '../core/services/cycleService';

interface GameState {
  games: Game[];
  cycles: Cycle[];
  isLoading: boolean;
  filters: GameFilters;
  sort: SortConfig;

  loadAll: () => Promise<void>;
  addGame: (data: CreateGameData) => Promise<Game>;
  updateGame: (id: string, data: UpdateGameData) => Promise<Game | undefined>;
  deleteGame: (id: string) => Promise<boolean>;
  addCycle: (data: CreateCycleData) => Promise<Cycle>;
  updateCycle: (id: string, data: Partial<Cycle>) => Promise<void>;
  deleteCycle: (id: string) => Promise<void>;
  setFilters: (f: Partial<GameFilters>) => void;
  resetFilters: () => void;
  setSort: (s: SortConfig) => void;
  setSearch: (search: string) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  games: [],
  cycles: [],
  isLoading: false,
  filters: { ...DEFAULT_FILTERS },
  sort: { ...DEFAULT_SORT },

  loadAll: async () => {
    set({ isLoading: true });
    const [games, cycles] = await Promise.all([gameService.getAll(), cycleService.getAll()]);
    set({ games, cycles, isLoading: false });
  },

  addGame: async (data) => { const g = await gameService.add(data); await get().loadAll(); return g; },
  updateGame: async (id, data) => { const u = await gameService.update(id, data); if (u) set(s => ({ games: s.games.map(g => g.id === id ? u : g) })); return u; },
  deleteGame: async (id) => { const ok = await gameService.delete(id); if (ok) set(s => ({ games: s.games.filter(g => g.id !== id && g.parentId !== id) })); return ok; },

  addCycle: async (data) => { const c = await cycleService.add(data); await get().loadAll(); return c; },
  updateCycle: async (id, data) => { await cycleService.update(id, data); await get().loadAll(); },
  deleteCycle: async (id) => { await cycleService.delete(id); await get().loadAll(); },

  setFilters: (f) => set(s => ({ filters: { ...s.filters, ...f } })),
  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),
  setSort: (s) => set({ sort: s }),
  setSearch: (search) => set(s => ({ filters: { ...s.filters, search } })),
}));