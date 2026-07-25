// Файл: src/components/layout/Header.tsx
import { Menu, Moon, Sun } from 'lucide-react';
import BackupMenu from '../ui/BackupMenu';
import { useUIStore } from '../../store/uiStore';
import { useEffect } from 'react';

function Header() {
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <header className="flex items-center justify-between h-14 px-4 lg:px-6 bg-white/80 dark:bg-crescent-dark/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60">
      <button onClick={toggleSidebar} className="lg:hidden p-2 -ml-1 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
        <Menu className="w-4 h-4" />
      </button>

      <span className="lg:hidden font-title font-bold text-gray-900 dark:text-gray-100 text-sm">
        🌙 Crescent
      </span>

      <div className="hidden sm:block flex-1 max-w-xs lg:ml-0 ml-4" />

      <div className="flex items-center gap-1">
        <BackupMenu />

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-crescent-accent to-crescent-gold flex items-center justify-center text-white text-[10px] font-bold shadow-sm ml-1">
          Я
        </div>
      </div>
    </header>
  );
}

export default Header;