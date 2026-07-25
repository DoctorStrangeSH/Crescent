// Файл: src/components/dashboard/DashboardPage.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { useStats } from '../../hooks/useStats';
import EmptyState from '../ui/EmptyState';
import Button from '../ui/Button';
import { Package, Heart, DollarSign, Star, Plus, Library, ArrowRight } from 'lucide-react';

function DashboardPage() {
  const navigate = useNavigate();
  const { games, series, loadAll } = useGameStore();
  const openAddGameModal = useUIStore(s => s.openAddGameModal);
  const stats = useStats();

  useEffect(() => { loadAll(); }, []);

  if (games.length === 0 && series.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <EmptyState
          icon={<Library className="w-10 h-10 text-crescent-muted" />}
          title="Добро пожаловать в Crescent"
          description="Создайте серию или добавьте первую игру"
          actionLabel="Перейти в коллекцию"
          onAction={() => navigate('/collection')}
        />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-title font-bold text-gray-900 dark:text-gray-100">Дашборд</h1>
          <p className="text-sm text-crescent-muted mt-0.5">Обзор вашей коллекции</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => openAddGameModal()} className="w-full sm:w-auto">Добавить игру</Button>
      </div>

      {/* Карточки статистики */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Всего игр" value={stats.totalGames} icon={<Package className="w-4 h-4" />} color="purple" />
        <StatCard label="В коллекции" value={stats.ownedGames} subtitle={`Хочу: ${stats.wishlistGames}`} icon={<Heart className="w-4 h-4" />} color="green" />
        <StatCard label="Стоимость" value={`${stats.totalValue.toLocaleString('ru-RU')} ₽`} icon={<DollarSign className="w-4 h-4" />} color="gold" />
        <StatCard label="Средняя оценка" value={stats.averageRating ? `${stats.averageRating.toFixed(1)}/10` : '—'} icon={<Star className="w-4 h-4" />} color="blue" />
      </div>

      {/* Серии */}
      {series.length > 0 && (
        <div className="bg-white dark:bg-crescent-card-dark rounded-2xl border border-gray-100/50 dark:border-gray-800/50 shadow-card dark:shadow-card-dark p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Мои серии</h3>
            <button onClick={() => navigate('/collection')} className="text-xs text-crescent-accent hover:underline flex items-center gap-1">
              Все <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-1">
            {series.slice(0, 5).map(s => (
              <button
                key={s.id}
                onClick={() => navigate(`/series/${s.id}`)}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center gap-3"
              >
                <span className="text-lg">📚</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{s.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Быстрые действия */}
      {stats.withoutProtectors > 0 && (
        <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/30 p-4 flex items-center gap-3">
          <span className="text-lg">🛡️</span>
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <span className="font-semibold">{stats.withoutProtectors}</span> игр без протекторов
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, subtitle, icon, color = 'purple' }: {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'purple' | 'green' | 'gold' | 'blue';
}) {
  const bgColors = {
    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400',
    green: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
    gold: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
  };

  return (
    <div className="bg-white dark:bg-crescent-card-dark rounded-2xl border border-gray-100/50 dark:border-gray-800/50 shadow-card dark:shadow-card-dark p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-crescent-muted mb-1">{label}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
          {subtitle && <p className="text-[11px] text-crescent-muted mt-0.5">{subtitle}</p>}
        </div>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bgColors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;