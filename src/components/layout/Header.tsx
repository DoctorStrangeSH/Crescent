// Файл: src/components/layout/Header.tsx
import { useState, useRef, useEffect } from 'react';
import { Menu, Moon, Sun, Search, X } from 'lucide-react';
import BackupMenu from '../ui/BackupMenu';
import ExportMenu from '../ui/ExportMenu';
import ShareMenu from '../ui/ShareMenu';
import { useUIStore } from '../../store/uiStore';
import { useGameStore } from '../../store/gameStore';
import { useNavigate } from 'react-router-dom';

function Header() {
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const games = useGameStore((s) => s.games);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredGames = searchQuery.trim()
    ? games.filter(g =>
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.titleOriginal.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : [];

  const handleGameClick = (gameId: string, seriesId: string | null) => {
    setSearchQuery('');
    setShowResults(false);
    if (seriesId) {
      navigate(`/series/${seriesId}`);
    } else {
      useUIStore.getState().openEditGameModal(gameId);
    }
  };

  return (
    <header className="flex items-center justify-between h-14 px-4 lg:px-6 bg-white/80 dark:bg-crescent-dark/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60">
      <button onClick={toggleSidebar} className="lg:hidden p-2 -ml-1 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
        <Menu className="w-4 h-4" />
      </button>

      <span className="lg:hidden font-title font-bold text-gray-900 dark:text-gray-100 text-sm">
        🌙 Crescent
      </span>

      <div ref={searchRef} className="hidden sm:block flex-1 max-w-sm lg:ml-0 ml-4 relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-crescent-muted" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
            onFocus={() => setShowResults(true)}
            placeholder="Поиск по названию..."
            className="block w-full pl-9 pr-9 py-1.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-sm placeholder-crescent-muted focus:outline-none focus:ring-2 focus:ring-crescent-accent/20 focus:border-crescent-accent/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setShowResults(false); }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-crescent-muted hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {showResults && searchQuery.trim() && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 py-1 z-50 max-h-80 overflow-y-auto">
            {filteredGames.length > 0 ? (
              filteredGames.map(game => (
                <button
                  key={game.id}
                  onClick={() => handleGameClick(game.id, game.seriesId)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="text-base flex-shrink-0">{game.status === 'owned' ? '✅' : '🎯'}</span>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{game.title}</p>
                    {game.titleOriginal && (
                      <p className="text-[11px] text-crescent-muted truncate">{game.titleOriginal}</p>
                    )}
                  </div>
                  {game.seriesId && (
                    <span className="text-[10px] text-crescent-muted flex-shrink-0 ml-auto">📚 серия</span>
                  )}
                </button>
              ))
            ) : (
              <p className="px-4 py-3 text-sm text-crescent-muted text-center">Ничего не найдено</p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <ShareMenu />
        <ExportMenu />
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