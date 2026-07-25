// Файл: src/store/uiStore.ts
import { create } from 'zustand';

export type ViewMode = 'grid' | 'table';
export type Theme = 'light' | 'dark';

interface UIState {
  theme: Theme;
  viewMode: ViewMode;
  isSidebarOpen: boolean;
  isGameModalOpen: boolean;
  editingGameId: string | null;
  pendingSeriesId: string | null;

  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleSidebar: () => void;
  openAddGameModal: (seriesId?: string | null) => void;
  openEditGameModal: (id: string) => void;
  closeGameModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'light',
  viewMode: 'grid',
  isSidebarOpen: true,
  isGameModalOpen: false,
  editingGameId: null,
  pendingSeriesId: null,

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      return { theme: newTheme };
    });
  },

  setTheme: (theme) => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    set({ theme });
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  openAddGameModal: (seriesId = null) => {
    set({ isGameModalOpen: true, editingGameId: null, pendingSeriesId: seriesId });
  },

  openEditGameModal: (id) => {
    set({ isGameModalOpen: true, editingGameId: id, pendingSeriesId: null });
  },

  closeGameModal: () => {
    set({ isGameModalOpen: false, editingGameId: null, pendingSeriesId: null });
  },
}));