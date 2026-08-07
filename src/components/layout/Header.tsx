import { useState, useRef, useEffect } from 'react';
import { Menu, Moon, Sun, Search, X } from 'lucide-react';
import BackupMenu from '../ui/BackupMenu';
import ExportMenu from '../ui/ExportMenu';
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
    const handleClickOutside = (e: MouseEvent) => { if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = searchQuery.trim()
    ? games.filter(g => g.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 8)
    : [];

  const handleClick = (gameId: string, parentId: string | null) => {
    setSearchQuery(''); setShowResults(false);
    if (parentId) navigate(`/game/${parentId}`);
    else navigate(`/game/${gameId}`);
  };

  return (
    <header className="flex items-center justify-between h-14 px-4 lg:px-6 bg-gray-950/80 backdrop-blur-xl border-b border-white/5">
      <button onClick={toggleSidebar} className="lg:hidden p-2 -ml-1 rounded-xl text-white/50 hover:text-white hover:bg-white/10"><Menu className="w-4 h-4" /></button>
      <span className="lg:hidden font-bold text-white text-sm">🌙 Crescent</span>

      <div ref={searchRef} className="hidden sm:block flex-1 max-w-sm lg:ml-0 ml-4 relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-white/30" /></div>
          <input type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setShowResults(true); }} onFocus={() => setShowResults(true)}
            placeholder="Поиск..." className="block w-full pl-9 pr-9 py-1.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-crescent-accent/50 transition-all" />
          {searchQuery && <button onClick={() => { setSearchQuery(''); setShowResults(false); }} className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white"><X className="h-3.5 w-3.5" /></button>}
        </div>
        {showResults && searchQuery.trim() && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 py-1 z-50 max-h-80 overflow-y-auto">
            {filtered.length > 0 ? filtered.map(g => (
              <button key={g.id} onClick={() => handleClick(g.id, g.parentId)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-white/5 transition-colors">
                <span className="text-base">{g.status === 'owned' ? '✅' : '🎯'}</span>
                <div className="min-w-0"><p className="font-medium text-white truncate">{g.title}</p></div>
                {g.parentId && <span className="text-[10px] text-white/30 ml-auto">📦 доп</span>}
              </button>
            )) : <p className="px-4 py-3 text-sm text-white/40 text-center">Ничего не найдено</p>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <ExportMenu />
        <BackupMenu />
        <button onClick={toggleTheme} className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors">
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-crescent-accent to-crescent-gold flex items-center justify-center text-white text-[10px] font-bold shadow-lg ml-1">Я</div>
      </div>
    </header>
  );
}

export default Header;