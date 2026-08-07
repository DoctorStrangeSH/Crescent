import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { gameService } from '../../core/services/gameService';
import { cycleService } from '../../core/services/cycleService';
import type { Game, Cycle, GameStats } from '../../core/types/game';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import { ArrowLeft, Plus, Check, ShoppingCart, Star, Shield, Edit3, Trash2, FolderPlus, Layers, Package, Move, Image, ChevronDown, ChevronRight } from 'lucide-react';

function GameDetailPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { games, cycles, loadAll, updateGame, deleteGame, addCycle, deleteCycle } = useGameStore();
  const { openAddGameModal, openEditGameModal } = useUIStore();

  const [game, setGame] = useState<Game | null>(null);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [showAddCycle, setShowAddCycle] = useState(false);
  const [newCycleTitle, setNewCycleTitle] = useState('');
  const [collapsedCycles, setCollapsedCycles] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (gameId) {
      loadAll();
      gameService.getById(gameId).then(setGame);
      gameService.getStats(gameId).then(setStats);
    }
  }, [gameId, games.length]);

  if (!gameId || !game) return null;

  const expansions = games.filter(g => g.parentId === gameId);
  const gameCycles = cycles.filter(c => c.parentGameId === gameId).sort((a, b) => a.sortOrder - b.sortOrder);
  const uncycledExpansions = expansions.filter(e => !e.cycleId);
  const isParent = expansions.length > 0 || gameCycles.length > 0;

  const handleToggle = async (g: Game) => {
    await updateGame(g.id, { status: g.status === 'owned' ? 'wishlist' : 'owned' });
  };

  const handleAddExpansion = () => openAddGameModal(gameId);
  const handleEditGame = () => openEditGameModal(gameId);

  const handleAddCycle = async () => {
    if (!newCycleTitle.trim()) return;
    await addCycle({ title: newCycleTitle.trim(), parentGameId: gameId });
    setNewCycleTitle(''); setShowAddCycle(false);
  };

  const handleDeleteCycle = async (id: string) => {
    if (window.confirm('Удалить цикл?')) await deleteCycle(id);
  };

  const handleMoveToCycle = async (gameId: string, cycleId: string | null) => {
    await updateGame(gameId, { cycleId });
  };

  const toggleCollapse = (id: string) => {
    setCollapsedCycles(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const handleDeleteGame = async () => {
    if (window.confirm(`Удалить «${game.title}» и все дополнения?`)) {
      await deleteGame(gameId);
      navigate('/collection');
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Шапка */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate('/collection')} className="p-2 rounded-xl hover:bg-white/10 mt-1"><ArrowLeft className="w-4 h-4 text-white/60" /></button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {game.photos && game.photos.length > 0 ? (
              <img src={game.photos[0]} alt="" className="w-16 h-16 rounded-2xl object-cover border border-white/10" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"><Package className="w-8 h-8 text-white/20" /></div>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">{game.title}</h1>
              {game.titleOriginal && <p className="text-sm text-white/40">{game.titleOriginal}</p>}
              <div className="flex items-center gap-2 mt-1.5">
                <Badge variant={game.status === 'owned' ? 'success' : 'warning'}>{game.status === 'owned' ? '✅ Есть' : '🎯 Хочу'}</Badge>
                {game.isFavorite && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                {game.hasProtectors && <Badge variant="purple" icon={<Shield className="w-3 h-3" />}>Протекторы</Badge>}
              </div>
            </div>
            <div className="flex-1" />
            <div className="flex gap-1">
              <button onClick={handleEditGame} className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10"><Edit3 className="w-4 h-4" /></button>
              <button onClick={handleDeleteGame} className="p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Статистика */}
      {stats && isParent && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <StatBadge label="Допов" value={stats.totalExpansions.toString()} />
            <StatBadge label="Есть" value={stats.ownedExpansions.toString()} color="green" />
            <StatBadge label="Хочу" value={stats.wishlistExpansions.toString()} color="amber" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5"><span className="text-white/40">Прогресс</span><span className="font-semibold text-crescent-accent">{stats.completionPercent}%</span></div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-crescent-accent to-crescent-gold rounded-full transition-all duration-700" style={{ width: `${stats.completionPercent}%` }} /></div>
          </div>
        </>
      )}

      {/* Инфо */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-white/50">
        {game.playerCountMin && <span>👥 {game.playerCountMin}-{game.playerCountMax} игроков</span>}
        {game.playTimeMin && <span>⏱ {game.playTimeMin}-{game.playTimeMax} мин</span>}
        {game.complexity && <span>🧩 Сложность: {game.complexity}/5</span>}
        {game.year && <span>📅 {game.year}</span>}
        {game.publisher && <span>🏢 {game.publisher}</span>}
        {game.purchasePrice && <span>💰 {game.purchasePrice.toLocaleString('ru-RU')} ₽</span>}
        {game.language && <span>🌐 {game.language === 'russian' ? 'Русский' : game.language === 'english' ? 'Английский' : game.language}</span>}
      </div>

      {game.notes && (
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <p className="text-xs text-white/40 mb-1">Заметки</p>
          <p className="text-sm text-white/80 whitespace-pre-wrap">{game.notes}</p>
        </div>
      )}

      {/* Кнопки */}
      <div className="flex flex-wrap gap-2">
        <Button icon={<Plus className="w-4 h-4" />} onClick={handleAddExpansion}>Добавить дополнение</Button>
        <Button icon={<FolderPlus className="w-4 h-4" />} variant="secondary" onClick={() => setShowAddCycle(!showAddCycle)}>Создать цикл</Button>
      </div>

      {showAddCycle && (
        <div className="flex gap-2 items-center bg-white/5 p-3 rounded-2xl border border-white/10">
          <input value={newCycleTitle} onChange={e => setNewCycleTitle(e.target.value)} placeholder="Название цикла" className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white" onKeyDown={e => e.key === 'Enter' && handleAddCycle()} autoFocus />
          <Button onClick={handleAddCycle} size="sm">Создать</Button>
        </div>
      )}

      {/* Циклы */}
      {gameCycles.map(cycle => {
        const cg = expansions.filter(e => e.cycleId === cycle.id).sort((a, b) => a.sortOrder - b.sortOrder);
        const owned = cg.filter(e => e.status === 'owned').length;
        const isCollapsed = collapsedCycles.has(cycle.id);
        return (
          <div key={cycle.id}>
            <div className="flex items-center gap-2 mb-1 px-1 group">
              <button onClick={() => toggleCollapse(cycle.id)}>{isCollapsed ? <ChevronRight className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}</button>
              <Layers className="w-4 h-4 text-crescent-accent/70" />
              <h3 className="font-semibold text-sm text-white/80">{cycle.title}</h3>
              <Badge variant="ghost" size="sm">{owned}/{cg.length}</Badge>
              <div className="flex-1" />
              <button onClick={() => handleDeleteCycle(cycle.id)} className="p-1 text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3" /></button>
            </div>
            {!isCollapsed && (
              <div className="border border-dashed border-white/10 rounded-2xl p-2 min-h-[50px] ml-4">
                {cg.length === 0 ? <p className="text-xs text-white/30 text-center py-3">Перетащите дополнения</p> : cg.map(e => (
                  <ExpansionRow key={e.id} game={e} cycles={gameCycles} parentGameId={gameId} onToggle={() => handleToggle(e)} onEdit={() => openEditGameModal(e.id)} onDelete={() => { if (window.confirm('Удалить?')) deleteGame(e.id); }} onMoveToCycle={(cid) => handleMoveToCycle(e.id, cid)} />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Одиночные дополнения */}
      {uncycledExpansions.length > 0 && (
        <div>
          {gameCycles.length > 0 && (
            <div className="flex items-center gap-3 py-1 mb-2"><div className="flex-1 h-px bg-white/10" /><span className="text-[11px] text-white/30">Одиночные</span><div className="flex-1 h-px bg-white/10" /></div>
          )}
          <div className="border border-dashed border-white/10 rounded-2xl p-2 space-y-1">
            {uncycledExpansions.map(e => (
              <ExpansionRow key={e.id} game={e} cycles={gameCycles} parentGameId={gameId} onToggle={() => handleToggle(e)} onEdit={() => openEditGameModal(e.id)} onDelete={() => { if (window.confirm('Удалить?')) deleteGame(e.id); }} onMoveToCycle={(cid) => handleMoveToCycle(e.id, cid)} />
            ))}
          </div>
        </div>
      )}

      {!isParent && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/40">Нет дополнений</p>
          <p className="text-white/20 text-sm mt-1">Добавьте первое дополнение</p>
        </div>
      )}
    </div>
  );
}

function StatBadge({ label, value, color = 'default' }: { label: string; value: string; color?: string }) {
  const c: Record<string, string> = { default: 'bg-white/5', green: 'bg-emerald-500/20 text-emerald-400', amber: 'bg-amber-500/20 text-amber-400' };
  return <div className={`${c[color] || c.default} rounded-2xl p-3 text-center border border-white/10`}><p className="text-xl font-bold text-white">{value}</p><p className="text-[11px] text-white/40">{label}</p></div>;
}

function ExpansionRow({ game, cycles, parentGameId, onToggle, onEdit, onDelete, onMoveToCycle }: {
  game: Game; cycles: Cycle[]; parentGameId: string; onToggle: () => void; onEdit: () => void; onDelete: () => void; onMoveToCycle: (cycleId: string | null) => void;
}) {
  const isOwned = game.status === 'owned';
  const [showMove, setShowMove] = useState(false);
  const pc = cycles.filter(c => c.parentGameId === parentGameId);
  const hasPhoto = game.photos && game.photos.length > 0;

  return (
    <>
      <div className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${isOwned ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
        {hasPhoto ? <img src={game.photos[0]} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" /> : <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0"><Image className="w-3.5 h-3.5 text-white/20" /></div>}
        <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onToggle(); }} className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center ${isOwned ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/40'}`}>{isOwned ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}</button>
        <div className="flex-1 min-w-0"><p className="text-sm font-medium text-white truncate">{game.title}</p></div>
        {game.isFavorite && <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />}
        {game.hasProtectors && <Shield className="w-3 h-3 text-purple-400 flex-shrink-0" />}
        {pc.length > 0 && <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); setShowMove(true); }} className="p-1 text-white/30 hover:text-blue-400"><Move className="w-3 h-3" /></button>}
        <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onEdit(); }} className="p-1 text-white/30 hover:text-white"><Edit3 className="w-3 h-3" /></button>
        <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onDelete(); }} className="p-1 text-white/30 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
      </div>
      {showMove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowMove(false)}>
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-5 w-80 shadow-2xl" onClick={e => e.stopPropagation()}>
            <p className="text-sm font-semibold text-white mb-3">Переместить</p>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              <button onClick={() => { onMoveToCycle(null); setShowMove(false); }} className="w-full text-left px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 rounded-xl">📦 Без цикла</button>
              {pc.map(c => <button key={c.id} onClick={() => { onMoveToCycle(c.id); setShowMove(false); }} className="w-full text-left px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 rounded-xl">📁 {c.title}</button>)}
            </div>
            <button onClick={() => setShowMove(false)} className="mt-3 w-full text-xs text-white/30 py-1">Отмена</button>
          </div>
        </div>
      )}
    </>
  );
}

export default GameDetailPage;