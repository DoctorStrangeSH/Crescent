// Файл: src/components/series/SeriesCard.tsx
import { motion } from 'framer-motion';
import { forwardRef } from 'react';
import type { GameSeries, SeriesStats } from '../../core/types/game';
import Badge from '../ui/Badge';
import { Package, CheckCircle } from 'lucide-react';

interface SeriesCardProps {
  series: GameSeries;
  stats: SeriesStats;
  onClick: () => void;
}

const SeriesCard = forwardRef<HTMLDivElement, SeriesCardProps>(function SeriesCard({ series, stats, onClick }, ref) {
  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="group cursor-pointer bg-white dark:bg-gray-900 rounded-2xl shadow-card hover:shadow-card-hover border border-gray-100 dark:border-gray-800 overflow-hidden transition-shadow duration-300"
    >
      {/* Обложка */}
      <div className="relative h-40 bg-gradient-to-br from-crescent-accent/20 to-crescent-gold/20 dark:from-crescent-accent/10 dark:to-crescent-gold/10 flex items-center justify-center">
        {series.photoUrl ? (
          <img src={series.photoUrl} alt={series.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="text-5xl">📚</div>
        )}
        {/* Прогресс */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${stats.completionPercent}%` }}
          />
        </div>
      </div>

      {/* Инфо */}
      <div className="p-4 space-y-2">
        <h3 className="font-title font-bold text-gray-900 dark:text-gray-100 text-base line-clamp-2">{series.title}</h3>
        {series.titleOriginal && (
          <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1">{series.titleOriginal}</p>
        )}

        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Package className="w-3.5 h-3.5" />
          <span>{stats.ownedGames}/{stats.totalGames} игр</span>
          {stats.completionPercent === 100 && (
            <Badge variant="success" icon={<CheckCircle className="w-3 h-3" />}>Полная</Badge>
          )}
        </div>

        {/* Прогресс-бар текстом */}
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Прогресс</span>
          <span className="font-medium text-emerald-600">{stats.completionPercent}%</span>
        </div>
      </div>
    </motion.div>
  );
});

export default SeriesCard;