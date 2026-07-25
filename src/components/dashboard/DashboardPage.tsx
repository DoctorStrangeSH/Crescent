// Файл: src/components/dashboard/DashboardPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { useStats } from '../../hooks/useStats';
import { seriesService } from '../../core/services/seriesService';
import type { SeriesStats } from '../../core/types/game';
import EmptyState from '../ui/EmptyState';
import Button from '../ui/Button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Package, Heart, DollarSign, Star, Plus, Library, ArrowRight, TrendingUp, Award, PartyPopper } from 'lucide-react';

const COLORS = ['#7c6ff7', '#f0a860', '#22c55e', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

function DashboardPage() {
  const navigate = useNavigate();
  const { games, series, loadAll } = useGameStore();
  const openAddGameModal = useUIStore(s => s.openAddGameModal);
  const stats = useStats();
  const [completedSeries, setCompletedSeries] = useState<string[]>([]);
  const [confettiShown, setConfettiShown] = useState<Set<string>>(new Set());

  useEffect(() => { loadAll(); }, []);

  // Проверяем завершённые серии и запускаем конфетти
  useEffect(() => {
    const checkCompleted = async () => {
      const completed: string[] = [];
      for (const s of series) {
        const st = await seriesService.getStats(s.id);
        if (st.completionPercent === 100 && st.totalGames > 0) {
          completed.push(s.id);
        }
      }
      setCompletedSeries(completed);

      // Запускаем конфетти для новых завершённых серий
      completed.forEach(id => {
        if (!confettiShown.has(id)) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#7c6ff7', '#f0a860', '#22c55e', '#ffffff'],
          });
          setConfettiShown(prev => new Set(prev).add(id));
        }
      });
    };
    checkCompleted();
  }, [games, series]);

  // Данные для графиков
  const seriesChartData = series.map(s => {
    const seriesGames = games.filter(g => g.seriesId === s.id);
    return {
      name: s.title.length > 20 ? s.title.substring(0, 20) + '...' : s.title,
      fullName: s.title,
      value: seriesGames.length,
      owned: seriesGames.filter(g => g.status === 'owned').length,
    };
  }).filter(d => d.value > 0);

  const statusChartData = [
    { name: 'Есть', value: stats.ownedGames, color: '#22c55e' },
    { name: 'Хочу купить', value: stats.wishlistGames, color: '#f0a860' },
  ].filter(d => d.value > 0);

  const totalProgress = games.length > 0
    ? Math.round((stats.ownedGames / games.length) * 100)
    : 0;

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
      {/* Заголовок */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-title font-bold text-gray-900 dark:text-gray-100">Дашборд</h1>
          <p className="text-sm text-crescent-muted mt-0.5">Обзор вашей коллекции</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => openAddGameModal()} className="w-full sm:w-auto">
          Добавить игру
        </Button>
      </div>

      {/* 🎉 Завершённые серии */}
      {completedSeries.length > 0 && (
        <div className="bg-gradient-to-r from-crescent-accent/10 via-emerald-500/10 to-crescent-gold/10 rounded-2xl border border-crescent-accent/20 p-4 flex items-center gap-3 animate-fade-in">
          <PartyPopper className="w-6 h-6 text-crescent-accent flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              🎉 Полностью собрано: {completedSeries.length} {completedSeries.length === 1 ? 'серия' : completedSeries.length >= 2 && completedSeries.length <= 4 ? 'серии' : 'серий'}!
            </p>
            <p className="text-xs text-crescent-muted mt-0.5">
              {series.filter(s => completedSeries.includes(s.id)).map(s => s.title).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Общий прогресс */}
      <div className="bg-white dark:bg-crescent-card-dark rounded-2xl border border-gray-100/50 dark:border-gray-800/50 shadow-card dark:shadow-card-dark p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-crescent-accent" />
            Общий прогресс коллекции
          </h3>
          <span className="text-lg font-bold text-crescent-accent">{totalProgress}%</span>
        </div>
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-crescent-accent via-crescent-gold to-emerald-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
        <p className="text-xs text-crescent-muted mt-2">
          {stats.ownedGames} из {games.length} игр в коллекции
        </p>
      </div>

      {/* Карточки статистики */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Всего игр" value={stats.totalGames} icon={<Package className="w-4 h-4" />} color="purple" />
        <StatCard label="В коллекции" value={stats.ownedGames} subtitle={`Хочу: ${stats.wishlistGames}`} icon={<Heart className="w-4 h-4" />} color="green" />
        <StatCard label="Стоимость" value={`${stats.totalValue.toLocaleString('ru-RU')} ₽`} icon={<DollarSign className="w-4 h-4" />} color="gold" />
        <StatCard label="Средняя оценка" value={stats.averageRating ? `${stats.averageRating.toFixed(1)}/10` : '—'} icon={<Star className="w-4 h-4" />} color="blue" />
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {statusChartData.length > 0 && (
          <div className="bg-white dark:bg-crescent-card-dark rounded-2xl border border-gray-100/50 dark:border-gray-800/50 shadow-card dark:shadow-card-dark p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Статус игр</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '13px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-2">
              {statusChartData.map(d => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-crescent-muted">{d.name}</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {seriesChartData.length > 0 && (
          <div className="bg-white dark:bg-crescent-card-dark rounded-2xl border border-gray-100/50 dark:border-gray-800/50 shadow-card dark:shadow-card-dark p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Игр в сериях</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={seriesChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                  {seriesChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, _: string, entry: any) => [
                    `${value} игр (${entry.payload.owned} есть)`,
                    entry.payload.fullName,
                  ]}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '13px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Серии с прогресс-барами */}
      {series.length > 0 && (
        <div className="bg-white dark:bg-crescent-card-dark rounded-2xl border border-gray-100/50 dark:border-gray-800/50 shadow-card dark:shadow-card-dark p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-crescent-accent" />
              Мои серии
            </h3>
            <button onClick={() => navigate('/collection')} className="text-xs text-crescent-accent hover:underline flex items-center gap-1">
              Все <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-1">
            {series.slice(0, 5).map(s => {
              const seriesGames = games.filter(g => g.seriesId === s.id);
              const owned = seriesGames.filter(g => g.status === 'owned').length;
              const pct = seriesGames.length > 0 ? Math.round((owned / seriesGames.length) * 100) : 0;
              const isComplete = pct === 100 && seriesGames.length > 0;
              return (
                <button
                  key={s.id}
                  onClick={() => navigate(`/series/${s.id}`)}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center gap-3"
                >
                  {s.photoUrl ? (
                    <img src={s.photoUrl} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <span className="text-lg flex-shrink-0">{isComplete ? '🏆' : '📚'}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{s.title}</p>
                      {isComplete && <PartyPopper className="w-3.5 h-3.5 text-crescent-accent flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isComplete ? 'bg-emerald-500' : 'bg-crescent-accent'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-crescent-muted">{owned}/{seriesGames.length}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Без протекторов */}
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
  label: string; value: string | number; subtitle?: string; icon: React.ReactNode; color: 'purple' | 'green' | 'gold' | 'blue';
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
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bgColors[color]}`}>{icon}</div>
      </div>
    </div>
  );
}

export default DashboardPage;