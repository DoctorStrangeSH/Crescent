import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { gameService } from '../../core/services/gameService';
import type { Game, GameStats } from '../../core/types/game';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import BulkAddModal from '../forms/BulkAddModal';
import { ArrowLeft, Plus, Check, ShoppingCart, Star, Shield, Edit3, Trash2, FolderPlus, Layers, Package, Image, ChevronDown, ChevronRight, GripVertical, X, FileText } from 'lucide-react';

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
  const [dragOverZone, setDragOverZone] = useState<string | null>(null);
  const [dragOverGameId, setDragOverGameId] = useState<string | null>(null);
  const [editingCycleId, setEditingCycleId] = useState<string | null>(null);
  const [editCycleTitle, setEditCycleTitle] = useState('');
  const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [collapsedBase, setCollapsedBase] = useState(false);

  useEffect(() => {
    if (gameId) {
      loadAll();
      gameService.getById(gameId).then(g => { if (g) setGame(g); });
      gameService.getStats(gameId).then(setStats);
    }
  }, [gameId, games.length]);

  if (!gameId || !game) return null;

  const expansions = games.filter(g => g.parentId === gameId);
  const gameCycles = cycles.filter(c => c.parentGameId === gameId).sort((a, b) => a.sortOrder - b.sortOrder);

  const baseGame = expansions.find(e => !e.cycleId && e.sortOrder === 0);
  const baseExpansions = expansions.filter(e => !e.cycleId && e.sortOrder > 0).sort((a, b) => a.sortOrder - b.sortOrder);
  const uncycledExpansions = expansions.filter(e => !e.cycleId && e.sortOrder < 0).sort((a, b) => a.sortOrder - b.sortOrder);
  const hasExpansions = expansions.length > 0;

  const handleToggle = async (g: Game) => {
    await updateGame(g.id, { status: g.status === 'owned' ? 'wishlist' : 'owned' });
  };

  const handleAddExpansion = () => openAddGameModal(gameId);
  const handleEditGame = () => openEditGameModal(gameId);

  const handleAddCycle = async () => {
    if (!newCycleTitle.trim()) return;
    const maxOrder = gameCycles.reduce((max, c) => Math.max(max, c.sortOrder || 0), -1);
    await addCycle({ title: newCycleTitle.trim(), parentGameId: gameId, sortOrder: maxOrder + 1 });
    setNewCycleTitle(''); setShowAddCycle(false);
  };

  const handleRenameCycle = async (cycleId: string) => {
    if (editCycleTitle.trim()) await updateCycle(cycleId, { title: editCycleTitle.trim() });
    setEditingCycleId(null);
  };

  const handleDeleteCycle = async (id: string) => {
    if (window.confirm('Удалить цикл?')) await deleteCycle(id);
  };

  const handleDeleteGame = async () => {
    if (window.confirm(`Удалить «${game.title}» и все дополнения?`)) {
      await deleteGame(gameId);
      navigate('/collection');
    }
  };

  // Drag-and-drop игры
  const handleGameDragStart = (e: React.DragEvent, gameId: string) => {
    e.dataTransfer.setData('text/plain', gameId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleGameDrop = async (e: React.DragEvent, zone: string, cycleId?: string) => {
    e.preventDefault();
    setDragOverZone(null);
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId) return;

    if (zone === 'base') {
      await updateGame(draggedId, { cycleId: null, sortOrder: 0 });
    } else if (zone === 'uncycled') {
      const maxOrder = uncycledExpansions.reduce((max, g) => Math.max(max, g.sortOrder || 0), -1);
      await updateGame(draggedId, { cycleId: null, sortOrder: maxOrder + 1 });
    } else if (zone === 'cycle' && cycleId) {
      const cycleGames = expansions.filter(e => e.cycleId === cycleId);
      const maxOrder = cycleGames.reduce((max, g) => Math.max(max, g.sortOrder || 0), -1);
      await updateGame(draggedId, { cycleId, sortOrder: maxOrder + 1 });
    }
  };

  // Drag-and-drop сортировка внутри зоны
  const handleSortDrop = async (e: React.DragEvent, targetGame: Game) => {
    e.preventDefault();
    setDragOverGameId(null);
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId || draggedId === targetGame.id) return;
    const dragged = games.find(g => g.id === draggedId);
    if (dragged) {
      await updateGame(draggedId, { sortOrder: targetGame.sortOrder });
      await updateGame(targetGame.id, { sortOrder: dragged.sortOrder });
    }
  };

  // Drag-and-drop циклов
  const handleCycleDragStart = (e: React.DragEvent, cycleId: string) => {
    e.dataTransfer.setData('cycleId', cycleId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCycleDrop = async (e: React.DragEvent, targetCycleId: string) => {
    e.preventDefault();
    const draggedCycleId = e.dataTransfer.getData('cycleId');
    if (!draggedCycleId || draggedCycleId === targetCycleId) return;
    const dragged = cycles.find(c => c.id === draggedCycleId);
    const target = cycles.find(c => c.id === targetCycleId);
    if (dragged && target) {
      await updateCycle(draggedCycleId, { sortOrder: target.sortOrder });
      await updateCycle(targetCycleId, { sortOrder: dragged.sortOrder });
    }
  };

  const handleGameDragOver = (e: React.DragEvent, zone: string) => {
    e.preventDefault();
    setDragOverZone(zone);
  };

  const handleSortDragOver = (e: React.DragEvent, gameId: string) => {
    e.preventDefault();
    setDragOverGameId(gameId);
  };

  const handleDragLeave = () => {
    setDragOverZone(null);
    setDragOverGameId(null);
  };

  const toggleCollapse = (id: string) => {
    setCollapsedCycles(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Шапка */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate('/collection')} className="p-2 rounded-xl hover:bg-surface-hover dark:hover:bg-surface-hover-dark mt-1"><ArrowLeft className="w-4 h-4 text-surface-muted" /></button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {game.photos && game.photos.length > 0 ? (
              <img src={game.photos[0]} alt="" className="w-16 h-16 rounded-2xl object-cover border border-surface-border dark:border-surface-border-dark cursor-pointer hover:opacity-80" onClick={() => setFullscreenPhoto(game.photos[0])} />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-surface-hover dark:bg-surface-hover-dark border border-surface-border dark:border-surface-border-dark flex items-center justify-center"><Package className="w-8 h-8 text-surface-muted" /></div>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{game.title}</h1>
              {game.titleOriginal && <p className="text-sm text-surface-muted">{game.titleOriginal}</p>}
              <div className="flex items-center gap-2 mt-1.5">
                {game.isSeries && <Badge variant="purple">📚 Серия</Badge>}
              </div>
            </div>
            <div className="flex-1" />
            <div className="flex gap-1">
              <button onClick={handleEditGame} className="p-2 rounded-xl text-surface-muted hover:text-gray-700 dark:hover:text-white hover:bg-surface-hover dark:hover:bg-surface-hover-dark"><Edit3 className="w-4 h-4" /></button>
              <button onClick={handleDeleteGame} className="p-2 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
          {!game.isSeries && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-surface-muted mt-3">
              <span>👥 {game.playerCountMin}-{game.playerCountMax} игроков</span>
              <span>⏱ {game.playTimeMin}-{game.playTimeMax} мин</span>
              <span>🧩 Сложность: {game.complexity}/5</span>
              {game.year && <span>📅 {game.year}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Статистика */}
      {stats && hasExpansions && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <StatBadge label="Всего" value={stats.totalExpansions.toString()} />
            <StatBadge label="Есть" value={stats.ownedExpansions.toString()} color="green" />
            <StatBadge label="Хочу" value={stats.wishlistExpansions.toString()} color="amber" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5"><span className="text-surface-muted">Прогресс</span><span className="font-semibold text-crescent-accent">{stats.completionPercent}%</span></div>
            <div className="h-2 bg-surface-hover dark:bg-surface-hover-dark rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-crescent-accent to-crescent-gold rounded-full transition-all duration-700" style={{ width: `${stats.completionPercent}%` }} /></div>
          </div>
        </>
      )}

      {/* Кнопки */}
      {game.isSeries && (
        <div className="flex flex-wrap gap-2">
          <Button icon={<Plus className="w-4 h-4" />} onClick={handleAddExpansion}>Добавить дополнение</Button>
          <Button icon={<FolderPlus className="w-4 h-4" />} variant="secondary" onClick={() => setShowAddCycle(!showAddCycle)}>Создать цикл</Button>
          <Button icon={<FileText className="w-4 h-4" />} variant="ghost" size="sm" onClick={() => setShowBulkAdd(true)}>Массово</Button>
        </div>
      )}

      {showAddCycle && (
        <div className="flex gap-2 items-center bg-surface-hover dark:bg-surface-hover-dark p-3 rounded-2xl border border-surface-border dark:border-surface-border-dark">
          <input value={newCycleTitle} onChange={e => setNewCycleTitle(e.target.value)} placeholder="Название цикла" className="flex-1 px-3 py-2 bg-white dark:bg-surface-card-dark border border-surface-border dark:border-surface-border-dark rounded-xl text-sm text-gray-900 dark:text-white" onKeyDown={e => e.key === 'Enter' && handleAddCycle()} autoFocus />
          <Button onClick={handleAddCycle} size="sm">Создать</Button>
        </div>
      )}

      {/* === БАЗОВАЯ ИГРА === */}
      <DropZone
        title="Базовая игра" icon="🎯" zone="base"
        dragOverZone={dragOverZone} collapsed={collapsedBase}
        onToggle={() => setCollapsedBase(!collapsedBase)}
        onDrop={(e) => handleGameDrop(e, 'base')}
        onDragOver={(e) => handleGameDragOver(e, 'base')}
        onDragLeave={handleDragLeave}
        count={baseGame ? 1 + baseExpansions.length : 0}
        owned={baseGame ? (baseGame.status === 'owned' ? 1 : 0) + baseExpansions.filter(e => e.status === 'owned').length : 0}
      >
        {baseGame && (
          <SortableExpansionRow game={baseGame} dragOverGameId={dragOverGameId} onToggle={() => handleToggle(baseGame)} onEdit={() => openEditGameModal(baseGame.id)} onDelete={() => { if (window.confirm('Удалить?')) deleteGame(baseGame.id); }} onDragStart={handleGameDragStart} onDragOver={handleSortDragOver} onDrop={handleSortDrop} onDragLeave={handleDragLeave} />
        )}
        {baseExpansions.map(e => (
          <SortableExpansionRow key={e.id} game={e} dragOverGameId={dragOverGameId} onToggle={() => handleToggle(e)} onEdit={() => openEditGameModal(e.id)} onDelete={() => { if (window.confirm('Удалить?')) deleteGame(e.id); }} onDragStart={handleGameDragStart} onDragOver={handleSortDragOver} onDrop={handleSortDrop} onDragLeave={handleDragLeave} />
        ))}
      </DropZone>

      {/* === ЦИКЛЫ === */}
      {gameCycles.map(cycle => {
        const cg = expansions.filter(e => e.cycleId === cycle.id).sort((a, b) => a.sortOrder - b.sortOrder);
        const owned = cg.filter(e => e.status === 'owned').length;
        const isCollapsed = collapsedCycles.has(cycle.id);
        const isDragOver = dragOverZone === `cycle-${cycle.id}`;
        return (
          <div key={cycle.id} draggable onDragStart={(e) => handleCycleDragStart(e, cycle.id)} onDrop={(e) => handleCycleDrop(e, cycle.id)} onDragOver={(e) => e.preventDefault()}>
            <div className="flex items-center gap-2 mb-1 px-1 group cursor-grab active:cursor-grabbing">
              <button onClick={() => toggleCollapse(cycle.id)}>{isCollapsed ? <ChevronRight className="w-4 h-4 text-surface-muted" /> : <ChevronDown className="w-4 h-4 text-surface-muted" />}</button>
              <GripVertical className="w-3 h-3 text-surface-muted" />
              <Layers className="w-4 h-4 text-crescent-accent/70" />
              {editingCycleId === cycle.id ? (
                <input value={editCycleTitle} onChange={e => setEditCycleTitle(e.target.value)} onBlur={() => handleRenameCycle(cycle.id)} onKeyDown={e => { if (e.key === 'Enter') handleRenameCycle(cycle.id); if (e.key === 'Escape') setEditingCycleId(null); }} className="px-2 py-0.5 border border-surface-border dark:border-surface-border-dark rounded-lg text-sm font-semibold bg-white dark:bg-surface-card-dark" autoFocus />
              ) : (
                <h3 className="font-semibold text-sm text-gray-700 dark:text-white/80 cursor-pointer hover:text-crescent-accent" onDoubleClick={() => { setEditingCycleId(cycle.id); setEditCycleTitle(cycle.title); }}>{cycle.title}</h3>
              )}
              <Badge variant="ghost" size="sm">{owned}/{cg.length}</Badge>
              <div className="flex-1" />
              <button onClick={() => handleDeleteCycle(cycle.id)} className="p-1 text-surface-muted hover:text-red-400 opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3" /></button>
            </div>
            {!isCollapsed && (
              <div
                className={`border-2 border-dashed rounded-2xl p-2 min-h-[50px] ml-4 transition-all ${isDragOver ? 'border-crescent-accent bg-crescent-accent/5' : 'border-surface-border dark:border-surface-border-dark'}`}
                onDrop={(e) => handleGameDrop(e, 'cycle', cycle.id)}
                onDragOver={(e) => handleGameDragOver(e, `cycle-${cycle.id}`)}
                onDragLeave={handleDragLeave}
              >
                {cg.length === 0 ? <p className="text-xs text-surface-muted text-center py-3">Перетащите сюда</p> : cg.map(e => (
                  <SortableExpansionRow key={e.id} game={e} dragOverGameId={dragOverGameId} onToggle={() => handleToggle(e)} onEdit={() => openEditGameModal(e.id)} onDelete={() => { if (window.confirm('Удалить?')) deleteGame(e.id); }} onDragStart={handleGameDragStart} onDragOver={handleSortDragOver} onDrop={handleSortDrop} onDragLeave={handleDragLeave} />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* === ОДИНОЧНЫЕ === */}
      <DropZone
        title="Одиночные дополнения" icon="📋" zone="uncycled"
        dragOverZone={dragOverZone} collapsed={false}
        onToggle={() => {}}
        onDrop={(e) => handleGameDrop(e, 'uncycled')}
        onDragOver={(e) => handleGameDragOver(e, 'uncycled')}
        onDragLeave={handleDragLeave}
        count={uncycledExpansions.length}
        owned={uncycledExpansions.filter(e => e.status === 'owned').length}
        collapsible={false}
      >
        {uncycledExpansions.map(e => (
          <SortableExpansionRow key={e.id} game={e} dragOverGameId={dragOverGameId} onToggle={() => handleToggle(e)} onEdit={() => openEditGameModal(e.id)} onDelete={() => { if (window.confirm('Удалить?')) deleteGame(e.id); }} onDragStart={handleGameDragStart} onDragOver={handleSortDragOver} onDrop={handleSortDrop} onDragLeave={handleDragLeave} />
        ))}
      </DropZone>

      {!hasExpansions && !game.isSeries && (
        <div className="text-center py-12"><Package className="w-12 h-12 text-surface-muted mx-auto mb-3" /><p className="text-surface-muted">Одиночная игра</p></div>
      )}

      <BulkAddModal isOpen={showBulkAdd} onClose={() => setShowBulkAdd(false)} parentGameId={gameId} />

      {fullscreenPhoto && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setFullscreenPhoto(null)}>
          <button onClick={() => setFullscreenPhoto(null)} className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20"><X className="w-6 h-6" /></button>
          <img src={fullscreenPhoto} alt="" className="max-w-full max-h-[90vh] object-contain rounded-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

function DropZone({ title, icon, zone, dragOverZone, collapsed, onToggle, onDrop, onDragOver, onDragLeave, count, owned, children, collapsible = true }: {
  title: string; icon: string; zone: string; dragOverZone: string | null; collapsed: boolean; onToggle: () => void;
  onDrop: (e: React.DragEvent) => void; onDragOver: (e: React.DragEvent) => void; onDragLeave: () => void;
  count: number; owned: number; children: React.ReactNode; collapsible?: boolean;
}) {
  const isDragOver = dragOverZone === zone;
  return (
    <div>
      <div className="flex items-center gap-2 mb-1 px-1">
        {collapsible && <button onClick={onToggle}>{collapsed ? <ChevronRight className="w-4 h-4 text-surface-muted" /> : <ChevronDown className="w-4 h-4 text-surface-muted" />}</button>}
        <span className="text-lg">{icon}</span>
        <h3 className="font-semibold text-sm text-gray-700 dark:text-white/80">{title}</h3>
        <Badge variant="ghost" size="sm">{owned}/{count}</Badge>
      </div>
      {!collapsed && (
        <div className={`border-2 border-dashed rounded-2xl p-2 min-h-[50px] ml-4 transition-all ${isDragOver ? 'border-crescent-accent bg-crescent-accent/5' : 'border-surface-border dark:border-surface-border-dark'}`}
          onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}>
          {count === 0 ? <p className="text-xs text-surface-muted text-center py-3">Перетащите сюда</p> : children}
        </div>
      )}
    </div>
  );
}

function StatBadge({ label, value, color = 'default' }: { label: string; value: string; color?: string }) {
  const c: Record<string, string> = { default: 'bg-surface-hover dark:bg-surface-hover-dark', green: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' };
  return <div className={`${c[color] || c.default} rounded-2xl p-3 text-center border border-surface-border dark:border-surface-border-dark`}><p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p><p className="text-[11px] text-surface-muted">{label}</p></div>;
}

function SortableExpansionRow({ game, dragOverGameId, onToggle, onEdit, onDelete, onDragStart, onDragOver, onDrop, onDragLeave }: {
  game: Game; dragOverGameId: string | null; onToggle: () => void; onEdit: () => void; onDelete: () => void;
  onDragStart: (e: React.DragEvent, id: string) => void; onDragOver: (e: React.DragEvent, id: string) => void;
  onDrop: (e: React.DragEvent, target: Game) => void; onDragLeave: () => void;
}) {
  const isOwned = game.status === 'owned';
  const hasPhoto = game.photos && game.photos.length > 0;
  const isDragOver = dragOverGameId === game.id;
  return (
    <div draggable
      onDragStart={(e) => onDragStart(e, game.id)}
      onDragOver={(e) => onDragOver(e, game.id)}
      onDrop={(e) => onDrop(e, game)}
      onDragLeave={onDragLeave}
      className={`flex items-center gap-2 p-2 rounded-xl border transition-all cursor-grab active:cursor-grabbing ${isDragOver ? 'border-crescent-accent bg-crescent-accent/5 scale-[1.02]' : ''} ${isOwned ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30' : 'bg-white dark:bg-surface-card-dark border-surface-border dark:border-surface-border-dark hover:border-gray-300 dark:hover:border-gray-600'}`}>
      <GripVertical className="w-3 h-3 text-surface-muted flex-shrink-0 pointer-events-none" />
      {hasPhoto ? <img src={game.photos[0]} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" /> : <div className="w-8 h-8 rounded-lg bg-surface-hover dark:bg-surface-hover-dark flex items-center justify-center"><Image className="w-3.5 h-3.5 text-surface-muted" /></div>}
      <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onToggle(); }} className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center ${isOwned ? 'bg-emerald-500 text-white' : 'bg-surface-hover dark:bg-surface-hover-dark text-surface-muted'}`}>{isOwned ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}</button>
      <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 dark:text-white truncate">{game.title}</p></div>
      {game.isFavorite && <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />}
      {game.hasProtectors && <Shield className="w-3 h-3 text-purple-400 flex-shrink-0" />}
      <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onEdit(); }} className="p-1 text-surface-muted hover:text-gray-700 dark:hover:text-white"><Edit3 className="w-3 h-3" /></button>
      <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onDelete(); }} className="p-1 text-surface-muted hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
    </div>
  );
}

export default GameDetailPage;