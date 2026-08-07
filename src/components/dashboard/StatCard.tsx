// Файл: src/components/dashboard/StatCard.tsx
import { type ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  subtitle?: string;
  color?: 'purple' | 'green' | 'amber' | 'blue' | 'red' | 'default';
}

const colorClasses: Record<string, { bg: string; icon: string; text: string }> = {
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    icon: 'text-purple-500',
    text: 'text-purple-700 dark:text-purple-300',
  },
  green: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    icon: 'text-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    icon: 'text-amber-500',
    text: 'text-amber-700 dark:text-amber-300',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    icon: 'text-blue-500',
    text: 'text-blue-700 dark:text-blue-300',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    icon: 'text-red-500',
    text: 'text-red-700 dark:text-red-300',
  },
  default: {
    bg: 'bg-gray-50 dark:bg-gray-800/50',
    icon: 'text-gray-500',
    text: 'text-gray-700 dark:text-gray-300',
  },
};

function StatCard({ title, value, icon, subtitle, color = 'default' }: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <div className={`${colors.bg} rounded-2xl p-5 border border-gray-100 dark:border-gray-800`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-title font-bold text-gray-900 dark:text-gray-100">
            {value}
          </p>
          {subtitle && (
            <p className={`text-xs ${colors.text}`}>{subtitle}</p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center ${colors.icon}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default StatCard;