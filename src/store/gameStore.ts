// Файл: src/store/gameStore.ts
import { create } from 'zustand';
import type { BoardGame, CreateBoardGameData, UpdateBoardGameData, GameSeries, CreateSeriesData, UpdateSeriesData, GameCycle, CreateCycleData } from '../core/types/game';
import type { GameFilters, SortConfig } from '../core/types/filters';
import { DEFAULT_FILTERS, DEFAULT_SORT } from '../core/types/filters';
import { gameService } from '../core/services/gameService';
import { seriesService } from '../core/services/seriesService';

interface GameState {
  games: BoardGame[];
  series: GameSeries[];
  cycles: GameCycle[];
  isLoading: boolean;
  filters: GameFilters;
  sort: SortConfig;

  loadAll: () => Promise<void>;
  addGame: (data: CreateBoardGameData) => Promise<BoardGame>;
  updateGame: (id: string, data: UpdateBoardGameData) => Promise<BoardGame | undefined>;
  deleteGame: (id: string) => Promise<boolean>;
  addSeries: (data: CreateSeriesData) => Promise<GameSeries>;
  updateSeries: (id: string, data: UpdateSeriesData) => Promise<GameSeries | undefined>;
  deleteSeries: (id: string) => Promise<boolean>;
  addCycle: (data: CreateCycleData) => Promise<GameCycle>;
  deleteCycle: (id: string) => Promise<void>;
  setFilters: (filters: Partial<GameFilters>) => void;
  resetFilters: () => void;
  setSort: (sort: SortConfig) => void;
  setSearch: (search: string) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  games: [],
  series: [],
  cycles: [],
  isLoading: false,
  filters: { ...DEFAULT_FILTERS },
  sort: { ...DEFAULT_SORT },

  loadAll: async () => {
    set({ isLoading: true });
    const [games, series] = await Promise.all([gameService.getAll(), seriesService.getAll()]);
    const allCycles: GameCycle[] = [];
    for (const s of series) {
      const cycles = await seriesService.getCycles(s.id);
      allCycles.push(...cycles);
    }
    set({ games, series, cycles: allCycles, isLoading: false });
  },

  addGame: async (data) => { const g = await gameService.add(data); await get().loadAll(); return g; },
  updateGame: async (id, data) => { const u = await gameService.update(id, data); if (u) set(s => ({ games: s.games.map(g => g.id === id ? u : g) })); return u; },
  deleteGame: async (id) => { const ok = await gameService.delete(id); if (ok) set(s => ({ games: s.games.filter(g => g.id !== id) })); return ok; },

  addSeries: async (data) => { const s = await seriesService.add(data); await get().loadAll(); return s; },
  updateSeries: async (id, data) => { const u = await seriesService.update(id, data); if (u) set(s => ({ series: s.series.map(ser => ser.id === id ? u : ser) })); return u; },
  deleteSeries: async (id) => { const ok = await seriesService.delete(id); if (ok) set(s => ({ series: s.series.filter(ser => ser.id !== id), games: s.games.filter(g => g.seriesId !== id) })); return ok; },

  addCycle: async (data) => { const c = await seriesService.addCycle(data); await get().loadAll(); return c; },
  deleteCycle: async (id) => { await seriesService.deleteCycle(id); await get().loadAll(); },

  setFilters: (f) => set(s => ({ filters: { ...s.filters, ...f } })),
  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),
  setSort: (sort) => set({ sort }),
  setSearch: (search) => set(s => ({ filters: { ...s.filters, search } })),
}));