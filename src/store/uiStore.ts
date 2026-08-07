import { create } from 'zustand';

export type Theme = 'light' | 'dark';

interface UIState {
  theme: Theme;
  isSidebarOpen: boolean;
  isGameModalOpen: boolean;
  editingGameId: string | null;
  parentGameId: string | null;

  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  toggleSidebar: () => void;
  openAddGameModal: (parentId?: string | null) => void;
  openEditGameModal: (id: string) => void;
  closeGameModal: () => void;
}

const savedTheme = (typeof window !== 'undefined' && localStorage.getItem('crescent-theme')) as Theme | null;

export const useUIStore = create<UIState>((set) => ({
  theme: savedTheme || 'dark',
  isSidebarOpen: true,
  isGameModalOpen: false,
  editingGameId: null,
  parentGameId: null,

  toggleTheme: () => set(s => {
    const t = s.theme === 'light' ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', t === 'dark');
    localStorage.setItem('crescent-theme', t);
    return { theme: t };
  }),

  setTheme: (t) => {
    document.documentElement.classList.toggle('dark', t === 'dark');
    localStorage.setItem('crescent-theme', t);
    set({ theme: t });
  },

  toggleSidebar: () => set(s => ({ isSidebarOpen: !s.isSidebarOpen })),

  openAddGameModal: (parentId = null) => set({ isGameModalOpen: true, editingGameId: null, parentGameId: parentId }),
  openEditGameModal: (id) => set({ isGameModalOpen: true, editingGameId: id, parentGameId: null }),
  closeGameModal: () => set({ isGameModalOpen: false, editingGameId: null, parentGameId: null }),
}));