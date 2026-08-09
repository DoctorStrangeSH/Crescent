import { useState, useRef, useEffect } from 'react';
import { Menu, Moon, Sun, Search, X } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useGameStore } from '../../store/gameStore';
import { useNavigate } from 'react-router-dom';

function Header() {
  const theme = useUIStore(s => s.theme);
  const toggleTheme = useUIStore(s => s.toggleTheme);
  const toggleSidebar = useUIStore(s => s.toggleSidebar);
  const games = useGameStore(s => s.games);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); }, [theme]);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtered = searchQuery.trim() ? games.filter(g => g.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 8) : [];

  return (
    <header className="flex items-center justify-between h-14 px-4 lg:px-6 bg-white dark:bg-surface-dark border-b border-surface-border dark:border-surface-border-dark">
      <button onClick={toggleSidebar} className="lg:hidden p-2 -ml-1 rounded-xl text-surface-muted hover:text-gray-700 dark:hover:text-white hover:bg-surface-hover dark:hover:bg-surface-hover-dark"><Menu className="w-4 h-4" /></button>
      <span className="lg:hidden font-bold text-gray-900 dark:text-white text-sm">🌙 Crescent</span>

      <div ref={searchRef} className="hidden sm:block flex-1 max-w-sm lg:ml-0 ml-4 relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-surface-muted" /></div>
          <input type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setShowResults(true); }} onFocus={() => setShowResults(true)}
            placeholder="Поиск..." className="block w-full pl-9 pr-9 py-1.5 bg-surface-hover dark:bg-surface-hover-dark border border-surface-border dark:border-surface-border-dark rounded-xl text-sm text-gray-900 dark:text-white placeholder-surface-muted focus:outline-none focus:ring-2 focus:ring-crescent-accent/50" />
          {searchQuery && <button onClick={() => { setSearchQuery(''); setShowResults(false); }} className="absolute inset-y-0 right-0 pr-3 flex items-center text-surface-muted hover:text-gray-700 dark:hover:text-white"><X className="h-3.5 w-3.5" /></button>}
        </div>
        {showResults && searchQuery.trim() && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-surface-card-dark rounded-xl shadow-xl border border-surface-border dark:border-surface-border-dark py-1 z-50 max-h-80 overflow-y-auto">
            {filtered.length > 0 ? filtered.map(g => (
              <button key={g.id} onClick={() => { setSearchQuery(''); setShowResults(false); navigate(`/collection/${g.collectionId || g.id}`); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-surface-hover dark:hover:bg-surface-hover-dark">
                <span className="text-base">{g.status === 'owned' ? '✅' : '🎯'}</span>
                <span className="font-medium text-gray-900 dark:text-white truncate">{g.title}</span>
              </button>
            )) : <p className="px-4 py-3 text-sm text-surface-muted text-center">Ничего не найдено</p>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button onClick={toggleTheme} className="p-2 rounded-xl text-surface-muted hover:text-gray-700 dark:hover:text-white hover:bg-surface-hover dark:hover:bg-surface-hover-dark">
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-crescent-accent to-crescent-gold flex items-center justify-center text-white text-[10px] font-bold shadow-lg ml-1">Я</div>
      </div>
    </header>
  );
}

export default Header;