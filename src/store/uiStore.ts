import { create } from 'zustand';

export type Theme = 'light' | 'dark';

interface UIState {
  theme: Theme;
  isSidebarOpen: boolean;
  isGameModalOpen: boolean;
  editingGameId: string | null;
  collectionId: string | null;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  toggleSidebar: () => void;
  openAddGameModal: (collectionId?: string | null) => void;
  openEditGameModal: (id: string) => void;
  closeGameModal: () => void;
}

const saved = (typeof window !== 'undefined' && localStorage.getItem('crescent-theme')) as Theme | null;

export const useUIStore = create<UIState>((set) => ({
  theme: saved || 'dark', isSidebarOpen: true, isGameModalOpen: false, editingGameId: null, collectionId: null,

  toggleTheme: () => set(s => {
    const t = s.theme === 'light' ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', t === 'dark');
    localStorage.setItem('crescent-theme', t);
    return { theme: t };
  }),
  setTheme: (t) => { document.documentElement.classList.toggle('dark', t === 'dark'); localStorage.setItem('crescent-theme', t); set({ theme: t }); },
  toggleSidebar: () => set(s => ({ isSidebarOpen: !s.isSidebarOpen })),
  openAddGameModal: (collectionId = null) => set({ isGameModalOpen: true, editingGameId: null, collectionId }),
  openEditGameModal: (id) => set({ isGameModalOpen: true, editingGameId: id, collectionId: null }),
  closeGameModal: () => set({ isGameModalOpen: false, editingGameId: null, collectionId: null }),
}));