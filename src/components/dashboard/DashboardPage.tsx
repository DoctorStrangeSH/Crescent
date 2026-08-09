import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { useStats } from '../../hooks/useStats';
import EmptyState from '../ui/EmptyState';
import Button from '../ui/Button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Package, Heart, DollarSign, Plus, Library, TrendingUp, Shield } from 'lucide-react';

function DashboardPage() {
  const navigate = useNavigate();
  const loadAll = useGameStore(s => s.loadAll);
  const openAddGameModal = useUIStore(s => s.openAddGameModal);
  const stats = useStats();

  useEffect(() => { loadAll(); }, []);

  const statusData = [
    { name: 'Есть', value: stats.ownedGames, color: '#22c55e' },
    { name: 'Хочу', value: stats.wishlistGames, color: '#e8a850' },
  ].filter(d => d.value > 0);

  const totalProgress = stats.totalGames > 0 ? Math.round((stats.ownedGames / stats.totalGames) * 100) : 0;

  if (stats.totalGames === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <EmptyState icon={<Library className="w-12 h-12 text-surface-muted" />} title="Добро пожаловать в Crescent" description="Добавьте свою первую игру" actionLabel="Перейти в коллекцию" onAction={() => navigate('/collection')} />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Дашборд</h1><p className="text-sm text-surface-muted mt-0.5">Обзор коллекции</p></div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => openAddGameModal()} className="w-full sm:w-auto">Добавить</Button>
      </div>

      <div className="bg-white dark:bg-surface-card-dark rounded-2xl border border-surface-border dark:border-surface-border-dark shadow-card dark:shadow-card-dark p-5">
        <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><TrendingUp className="w-4 h-4 text-crescent-accent" />Общий прогресс</h3><span className="text-lg font-bold text-crescent-accent">{totalProgress}%</span></div>
        <div className="h-3 bg-surface-hover dark:bg-surface-hover-dark rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-crescent-accent to-crescent-gold rounded-full transition-all duration-1000" style={{ width: `${totalProgress}%` }} /></div>
        <p className="text-xs text-surface-muted mt-2">{stats.ownedGames} из {stats.totalGames} игр</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Всего игр" value={stats.totalGames} subtitle={`${stats.collections} хранилищ`} icon={<Package className="w-4 h-4" />} />
        <StatCard label="В коллекции" value={stats.ownedGames} subtitle={`Хочу: ${stats.wishlistGames}`} icon={<Heart className="w-4 h-4" />} color="green" />
        <StatCard label="Стоимость" value={`${stats.totalValue.toLocaleString('ru-RU')} ₽`} icon={<DollarSign className="w-4 h-4" />} color="gold" />
        <StatCard label="Без протекторов" value={stats.withoutProtectors} icon={<Shield className="w-4 h-4" />} color="purple" />
      </div>

      {statusData.length > 0 && (
        <div className="bg-white dark:bg-surface-card-dark rounded-2xl border border-surface-border dark:border-surface-border-dark shadow-card dark:shadow-card-dark p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Статус игр</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart><Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">{statusData.map((e, i) => <Cell key={i} fill={e.color} strokeWidth={0} />)}</Pie><Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '13px' }} /></PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">{statusData.map(d => <div key={d.name} className="flex items-center gap-2 text-sm"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} /><span className="text-surface-muted">{d.name}</span><span className="font-semibold text-gray-900 dark:text-white">{d.value}</span></div>)}</div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, subtitle, icon, color = 'default' }: { label: string; value: string | number; subtitle?: string; icon: React.ReactNode; color?: string }) {
  const bg: Record<string, string> = { default: 'bg-surface-hover dark:bg-surface-hover-dark', green: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', gold: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400', purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' };
  return (
    <div className="bg-white dark:bg-surface-card-dark rounded-2xl border border-surface-border dark:border-surface-border-dark shadow-card dark:shadow-card-dark p-4">
      <div className="flex items-start justify-between"><div><p className="text-xs text-surface-muted mb-1">{label}</p><p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>{subtitle && <p className="text-[11px] text-surface-muted mt-0.5">{subtitle}</p>}</div><div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg[color] || bg.default}`}>{icon}</div></div>
    </div>
  );
}

export default DashboardPage;