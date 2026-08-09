import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { gameService } from '../../core/services/gameService';
import type { Game, GameStats } from '../../core/types/game';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { ArrowLeft, Plus, Check, ShoppingCart, Star, Shield, Edit3, Trash2, FolderPlus, Layers, Package, Image, ChevronDown, ChevronRight, GripVertical, X } from 'lucide-react';

function GameDetailPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const games = useGameStore(s => s.games);
  const cycles = useGameStore(s => s.cycles);
  const loadAll = useGameStore(s => s.loadAll);
  const updateGame = useGameStore(s => s.updateGame);
  const deleteGame = useGameStore(s => s.deleteGame);
  const addCycle = useGameStore(s => s.addCycle);
  const updateCycle = useGameStore(s => s.updateCycle);
  const deleteCycle = useGameStore(s => s.deleteCycle);
  const openAddGameModal = useUIStore(s => s.openAddGameModal);
  const openEditGameModal = useUIStore(s => s.openEditGameModal);

  const [game, setGame] = useState<Game | null>(null);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [showAddCycle, setShowAddCycle] = useState(false);
  const [newCycleTitle, setNewCycleTitle] = useState('');
  const [collapsedCycles, setCollapsedCycles] = useState<Set<string>>(new Set());
  const [collapsedBase, setCollapsedBase] = useState(false);
  const [collapsedStandalone, setCollapsedStandalone] = useState(false);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null);
  const [editingCycleId, setEditingCycleId] = useState<string | null>(null);
  const [editCycleTitle, setEditCycleTitle] = useState('');

  useEffect(() => {
    if (gameId) { loadAll(); gameService.getById(gameId).then(g => { if (g) setGame(g); }); gameService.getStats(gameId).then(setStats); }
  }, [gameId, games.length]);

  if (!gameId || !game) return null;

  const items = games.filter(g => g.collectionId === gameId);
  const gameCycles = cycles.filter(c => c.collectionId === gameId).sort((a, b) => a.sortOrder - b.sortOrder);
  const baseGame = items.find(e => e.kind === 'base' && !e.cycleId);
  const baseItems = items.filter(e => e.kind === 'base' && !e.cycleId);
  const expansions = items.filter(e => e.kind === 'expansion' && !e.cycleId).sort((a, b) => a.sortOrder - b.sortOrder);
  const standaloneItems = items.filter(e => e.kind === 'standalone' && !e.cycleId).sort((a, b) => a.sortOrder - b.sortOrder);
  const hasContent = items.length > 0;

  const handleToggle = async (g: Game) => { await updateGame(g.id, { status: g.status === 'owned' ? 'wishlist' : 'owned' }); };
  const handleAdd = () => openAddGameModal(gameId);
  const handleEdit = () => openEditGameModal(gameId);

  const handleAddCycle = async () => {
    if (!newCycleTitle.trim()) return;
    await addCycle({ title: newCycleTitle.trim(), collectionId: gameId });
    setNewCycleTitle(''); setShowAddCycle(false);
  };

  const handleRenameCycle = async (id: string) => {
    if (editCycleTitle.trim()) await updateCycle(id, { title: editCycleTitle.trim() });
    setEditingCycleId(null);
  };

  const handleDeleteCycle = async (id: string) => { if (window.confirm('Удалить цикл?')) await deleteCycle(id); };
  const handleDelete = async () => { if (window.confirm(`Удалить «${game.title}»?`)) { await deleteGame(gameId); navigate('/collection'); } };

  const toggleCollapse = (id: string) => setCollapsedCycles(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Шапка */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate('/collection')} className="p-2 rounded-xl hover:bg-surface-hover dark:hover:bg-surface-hover-dark mt-1"><ArrowLeft className="w-4 h-4 text-surface-muted" /></button>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            {game.photos && game.photos.length > 0 ? (
              <img src={game.photos[0]} alt="" className="w-20 h-20 rounded-2xl object-cover border border-surface-border dark:border-surface-border-dark cursor-pointer hover:opacity-80" onClick={() => setFullscreenPhoto(game.photos[0])} />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-surface-hover dark:bg-surface-hover-dark border border-surface-border dark:border-surface-border-dark flex items-center justify-center"><Package className="w-10 h-10 text-surface-muted" /></div>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{game.title}</h1>
              {game.titleOriginal && <p className="text-sm text-surface-muted">{game.titleOriginal}</p>}
              {game.kind === 'base' && <Badge variant="purple" className="mt-1">📚 Хранилище</Badge>}
            </div>
            <div className="flex-1" />
            <div className="flex gap-1">
              <button onClick={handleEdit} className="p-2 rounded-xl text-surface-muted hover:text-gray-700 dark:hover:text-white hover:bg-surface-hover dark:hover:bg-surface-hover-dark"><Edit3 className="w-4 h-4" /></button>
              <button onClick={handleDelete} className="p-2 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Статистика */}
      {stats && hasContent && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <StatBadge label="Всего" value={stats.total.toString()} />
            <StatBadge label="Есть" value={stats.owned.toString()} color="green" />
            <StatBadge label="Хочу" value={stats.wishlist.toString()} color="amber" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5"><span className="text-surface-muted">Прогресс</span><span className="font-semibold text-crescent-accent">{stats.completionPercent}%</span></div>
            <div className="h-2 bg-surface-hover dark:bg-surface-hover-dark rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-crescent-accent to-crescent-gold rounded-full transition-all duration-700" style={{ width: `${stats.completionPercent}%` }} /></div>
          </div>
        </>
      )}

      {/* Кнопки */}
      <div className="flex flex-wrap gap-2">
        <Button icon={<Plus className="w-4 h-4" />} onClick={handleAdd}>Добавить в хранилище</Button>
        <Button icon={<FolderPlus className="w-4 h-4" />} variant="secondary" onClick={() => setShowAddCycle(!showAddCycle)}>Создать цикл</Button>
      </div>

      {showAddCycle && (
        <div className="flex gap-2 items-center bg-surface-hover dark:bg-surface-hover-dark p-3 rounded-2xl border border-surface-border dark:border-surface-border-dark">
          <input value={newCycleTitle} onChange={e => setNewCycleTitle(e.target.value)} placeholder="Название цикла" className="flex-1 px-3 py-2 bg-white dark:bg-surface-card-dark border border-surface-border dark:border-surface-border-dark rounded-xl text-sm text-gray-900 dark:text-white" onKeyDown={e => e.key === 'Enter' && handleAddCycle()} autoFocus />
          <Button onClick={handleAddCycle} size="sm">Создать</Button>
        </div>
      )}

      {/* Базовая игра */}
      {baseItems.length > 0 && (
        <Section title="Базовая игра" icon="🎯" collapsed={collapsedBase} onToggle={() => setCollapsedBase(!collapsedBase)} count={baseItems.length} owned={baseItems.filter(e => e.status === 'owned').length}>
          {baseItems.map(e => (
            <GameRow key={e.id} game={e} onToggle={() => handleToggle(e)} onEdit={() => openEditGameModal(e.id)} onDelete={() => { if (window.confirm('Удалить?')) deleteGame(e.id); }} />
          ))}
        </Section>
      )}

      {/* Циклы */}
      {gameCycles.map(cycle => {
        const cg = items.filter(e => e.cycleId === cycle.id).sort((a, b) => a.sortOrder - b.sortOrder);
        const owned = cg.filter(e => e.status === 'owned').length;
        const isCollapsed = collapsedCycles.has(cycle.id);
        return (
          <div key={cycle.id}>
            <div className="flex items-center gap-2 mb-1 px-1 group">
              <button onClick={() => toggleCollapse(cycle.id)}>{isCollapsed ? <ChevronRight className="w-4 h-4 text-surface-muted" /> : <ChevronDown className="w-4 h-4 text-surface-muted" />}</button>
              <Layers className="w-4 h-4 text-crescent-accent/70" />
              {editingCycleId === cycle.id ? (
                <input value={editCycleTitle} onChange={e => setEditCycleTitle(e.target.value)} onBlur={() => handleRenameCycle(cycle.id)} onKeyDown={e => { if (e.key === 'Enter') handleRenameCycle(cycle.id); if (e.key === 'Escape') setEditingCycleId(null); }} className="px-2 py-0.5 border rounded-lg text-sm font-semibold bg-white dark:bg-surface-card-dark" autoFocus />
              ) : (
                <h3 className="font-semibold text-sm text-gray-700 dark:text-white/80 cursor-pointer hover:text-crescent-accent" onDoubleClick={() => { setEditingCycleId(cycle.id); setEditCycleTitle(cycle.title); }}>{cycle.title}</h3>
              )}
              <Badge variant="ghost" size="sm">{owned}/{cg.length}</Badge>
              <div className="flex-1" />
              <button onClick={() => handleDeleteCycle(cycle.id)} className="p-1 text-surface-muted hover:text-red-400 opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3" /></button>
            </div>
            {!isCollapsed && (
              <div className="ml-4 space-y-1">
                {cg.length === 0 ? <p className="text-xs text-surface-muted text-center py-3">Пусто</p> : cg.map(e => (
                  <GameRow key={e.id} game={e} onToggle={() => handleToggle(e)} onEdit={() => openEditGameModal(e.id)} onDelete={() => { if (window.confirm('Удалить?')) deleteGame(e.id); }} />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Дополнения */}
      {expansions.length > 0 && (
        <Section title="Дополнения" icon="📦" collapsed={false} onToggle={() => {}} count={expansions.length} owned={expansions.filter(e => e.status === 'owned').length} collapsible={false}>
          {expansions.map(e => (
            <GameRow key={e.id} game={e} onToggle={() => handleToggle(e)} onEdit={() => openEditGameModal(e.id)} onDelete={() => { if (window.confirm('Удалить?')) deleteGame(e.id); }} />
          ))}
        </Section>
      )}

      {/* Самостоятельные игры */}
      {standaloneItems.length > 0 && (
        <Section title="Самостоятельные игры" icon="🎲" collapsed={collapsedStandalone} onToggle={() => setCollapsedStandalone(!collapsedStandalone)} count={standaloneItems.length} owned={standaloneItems.filter(e => e.status === 'owned').length}>
          {standaloneItems.map(e => (
            <GameRow key={e.id} game={e} onToggle={() => handleToggle(e)} onEdit={() => openEditGameModal(e.id)} onDelete={() => { if (window.confirm('Удалить?')) deleteGame(e.id); }} />
          ))}
        </Section>
      )}

      {!hasContent && (
        <div className="text-center py-16"><Package className="w-16 h-16 text-surface-muted mx-auto mb-4 opacity-40" /><p className="text-surface-muted text-lg">Пусто</p><p className="text-surface-muted text-sm mt-1">Добавьте игры в хранилище</p></div>
      )}

      {fullscreenPhoto && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setFullscreenPhoto(null)}>
          <button onClick={() => setFullscreenPhoto(null)} className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20"><X className="w-6 h-6" /></button>
          <img src={fullscreenPhoto} alt="" className="max-w-full max-h-[90vh] object-contain rounded-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

function Section({ title, icon, collapsed, onToggle, count, owned, children, collapsible = true }: {
  title: string; icon: string; collapsed: boolean; onToggle: () => void; count: number; owned: number; children: React.ReactNode; collapsible?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 px-1">
        {collapsible && <button onClick={onToggle}>{collapsed ? <ChevronRight className="w-4 h-4 text-surface-muted" /> : <ChevronDown className="w-4 h-4 text-surface-muted" />}</button>}
        <span className="text-lg">{icon}</span>
        <h3 className="font-semibold text-sm text-gray-700 dark:text-white/80">{title}</h3>
        <Badge variant="ghost" size="sm">{owned}/{count}</Badge>
      </div>
      {!collapsed && <div className="ml-8 space-y-1">{children}</div>}
    </div>
  );
}

function StatBadge({ label, value, color = 'default' }: { label: string; value: string; color?: string }) {
  const c: Record<string, string> = { default: 'bg-surface-hover dark:bg-surface-hover-dark', green: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' };
  return <div className={`${c[color] || c.default} rounded-2xl p-3 text-center border border-surface-border dark:border-surface-border-dark`}><p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p><p className="text-[11px] text-surface-muted">{label}</p></div>;
}

function GameRow({ game, onToggle, onEdit, onDelete }: { game: Game; onToggle: () => void; onEdit: () => void; onDelete: () => void; }) {
  const isOwned = game.status === 'owned';
  const hasPhoto = game.photos && game.photos.length > 0;
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isOwned ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30' : 'bg-white dark:bg-surface-card-dark border-surface-border dark:border-surface-border-dark hover:border-gray-300 dark:hover:border-gray-600'}`}>
      {hasPhoto ? <img src={game.photos[0]} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-surface-border dark:border-surface-border-dark" /> : <div className="w-12 h-12 rounded-xl bg-surface-hover dark:bg-surface-hover-dark flex items-center justify-center flex-shrink-0"><Image className="w-5 h-5 text-surface-muted" /></div>}
      <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onToggle(); }} className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm ${isOwned ? 'bg-emerald-500 text-white' : 'bg-surface-hover dark:bg-surface-hover-dark text-surface-muted'}`}>{isOwned ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}</button>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 dark:text-white truncate">{game.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {game.kind === 'base' && <Badge size="sm" variant="purple">База</Badge>}
          {game.kind === 'expansion' && <Badge size="sm" variant="default">Доп</Badge>}
          {game.kind === 'standalone' && <Badge size="sm" variant="gold">Соло</Badge>}
          {game.isFavorite && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
          {game.hasProtectors && <Shield className="w-3 h-3 text-purple-400" />}
        </div>
      </div>
      <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onEdit(); }} className="p-1.5 text-surface-muted hover:text-gray-700 dark:hover:text-white rounded-lg hover:bg-surface-hover dark:hover:bg-surface-hover-dark"><Edit3 className="w-4 h-4" /></button>
      <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onDelete(); }} className="p-1.5 text-surface-muted hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></button>
    </div>
  );
}

export default GameDetailPage;