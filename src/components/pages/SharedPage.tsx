// Файл: src/components/pages/SharedPage.tsx
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Package, Heart, Star, TrendingUp } from 'lucide-react';

interface SharedGame {
  title: string;
  titleOriginal: string;
  status: string;
  seriesId: string | null;
  myRating: number | null;
  year: number | null;
}

interface SharedSeries {
  id: string;
  title: string;
  description: string;
  photoUrl: string | null;
  stats: {
    totalGames: number;
    ownedGames: number;
    completionPercent: number;
  };
}

interface SharedData {
  games: SharedGame[];
  series: SharedSeries[];
  totalGames: number;
  ownedGames: number;
}

function SharedPage() {
  const location = useLocation();
  const [data, setData] = useState<SharedData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const hash = location.hash.substring(1);
      if (!hash) {
        setError('Нет данных для отображения');
        return;
      }
      const decoded = JSON.parse(decodeURIComponent(atob(hash)));
      setData(decoded);
    } catch {
      setError('Неверная ссылка');
    }
  }, [location.hash]);

  if (error) {
    return (
      <div className="min-h-screen bg-crescent-light dark:bg-crescent-dark flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-4xl mb-4">🌙</p>
          <h1 className="text-xl font-title font-bold text-gray-900 dark:text-gray-100 mb-2">Crescent</h1>
          <p className="text-crescent-muted">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-crescent-light dark:bg-crescent-dark flex items-center justify-center">
        <p className="text-crescent-muted">Загрузка...</p>
      </div>
    );
  }

  const totalProgress = data.totalGames > 0
    ? Math.round((data.ownedGames / data.totalGames) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-crescent-light dark:bg-crescent-dark p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Заголовок */}
        <div className="text-center">
          <p className="text-4xl mb-3">🌙</p>
          <h1 className="text-2xl font-title font-bold text-gray-900 dark:text-gray-100">Коллекция настольных игр</h1>
          <p className="text-sm text-crescent-muted mt-1">Публичная ссылка · Только для просмотра</p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-crescent-card-dark rounded-2xl border border-gray-100/50 dark:border-gray-800/50 p-4 text-center">
            <Package className="w-5 h-5 text-crescent-accent mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{data.totalGames}</p>
            <p className="text-xs text-crescent-muted">Всего игр</p>
          </div>
          <div className="bg-white dark:bg-crescent-card-dark rounded-2xl border border-gray-100/50 dark:border-gray-800/50 p-4 text-center">
            <Heart className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{data.ownedGames}</p>
            <p className="text-xs text-crescent-muted">В коллекции</p>
          </div>
          <div className="bg-white dark:bg-crescent-card-dark rounded-2xl border border-gray-100/50 dark:border-gray-800/50 p-4 text-center">
            <TrendingUp className="w-5 h-5 text-crescent-accent mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{totalProgress}%</p>
            <p className="text-xs text-crescent-muted">Прогресс</p>
          </div>
        </div>

        {/* Серии */}
        {data.series.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-crescent-muted uppercase tracking-widest">Серии</h2>
            {data.series.map(s => {
              const seriesGames = data.games.filter(g => g.seriesId === s.id);
              return (
                <div key={s.id} className="bg-white dark:bg-crescent-card-dark rounded-2xl border border-gray-100/50 dark:border-gray-800/50 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    {s.photoUrl ? (
                      <img src={s.photoUrl} alt="" className="w-10 h-10 rounded-xl object-cover" />
                    ) : (
                      <span className="text-2xl">📚</span>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{s.title}</h3>
                      <p className="text-xs text-crescent-muted">{s.stats.ownedGames}/{s.stats.totalGames} игр · {s.stats.completionPercent}%</p>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-crescent-accent rounded-full" style={{ width: `${s.stats.completionPercent}%` }} />
                  </div>
                  {seriesGames.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {seriesGames.map(g => (
                        <div key={g.title} className="flex items-center gap-2 text-sm">
                          <span>{g.status === 'owned' ? '✅' : '🎯'}</span>
                          <span className="text-gray-700 dark:text-gray-300">{g.title}</span>
                          {g.myRating && (
                            <span className="text-xs text-crescent-muted ml-auto">⭐{g.myRating}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Одиночные игры */}
        {data.games.filter(g => !g.seriesId).length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-crescent-muted uppercase tracking-widest">Одиночные игры</h2>
            <div className="bg-white dark:bg-crescent-card-dark rounded-2xl border border-gray-100/50 dark:border-gray-800/50 p-4">
              {data.games.filter(g => !g.seriesId).map(g => (
                <div key={g.title} className="flex items-center gap-2 py-1.5 text-sm">
                  <span>{g.status === 'owned' ? '✅' : '🎯'}</span>
                  <span className="text-gray-700 dark:text-gray-300">{g.title}</span>
                  {g.myRating && <span className="text-xs text-crescent-muted ml-auto">⭐{g.myRating}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-crescent-muted pt-4">
          🌙 Создано в Crescent
        </p>
      </div>
    </div>
  );
}

export default SharedPage;