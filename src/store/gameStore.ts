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
  updateGame: (id: string, data: UpdateGameData) => Promise<void>;
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

  addGame: async (data) => {
    const game = await gameService.add(data);
    set(s => ({ games: [...s.games, game] }));
    return game;
  },

  updateGame: async (id, data) => {
    const updated = await gameService.update(id, data);
    if (updated) {
      set(s => ({ games: s.games.map(g => g.id === id ? updated : g) }));
    }
  },

  deleteGame: async (id) => {
    // Удаляем саму игру и все её дополнения
    const expansions = get().games.filter(g => g.parentId === id);
    const ok = await gameService.delete(id);
    if (ok) {
      set(s => ({
        games: s.games.filter(g => g.id !== id && !expansions.map(e => e.id).includes(g.id)),
        cycles: s.cycles.filter(c => c.parentGameId !== id),
      }));
    }
    return ok;
  },

  addCycle: async (data) => {
    const cycle = await cycleService.add(data);
    set(s => ({ cycles: [...s.cycles, cycle] }));
    return cycle;
  },

  updateCycle: async (id, data) => {
    await cycleService.update(id, data);
    set(s => ({ cycles: s.cycles.map(c => c.id === id ? { ...c, ...data } : c) }));
  },

  deleteCycle: async (id) => {
    await cycleService.delete(id);
    set(s => ({
      cycles: s.cycles.filter(c => c.id !== id),
      games: s.games.map(g => g.cycleId === id ? { ...g, cycleId: null } : g),
    }));
  },

  setFilters: (f) => set(s => ({ filters: { ...s.filters, ...f } })),
  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),
  setSort: (s) => set({ sort: s }),
  setSearch: (search) => set(s => ({ filters: { ...s.filters, search } })),
}));