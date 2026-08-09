import { type ReactNode } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'purple' | 'gold' | 'ghost';

interface BadgeProps { children: ReactNode; variant?: BadgeVariant; icon?: ReactNode; size?: 'sm' | 'md'; className?: string; }

const v: Record<BadgeVariant, string> = {
  default: 'bg-surface-hover dark:bg-surface-hover-dark text-surface-muted',
  success: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30',
  warning: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30',
  danger: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30',
  purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30',
  gold: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30',
  ghost: 'bg-transparent text-surface-muted',
};

function Badge({ children, variant = 'default', icon, size = 'md', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-lg ${size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'} ${v[variant]} ${className}`}>
      {icon && <span className="flex-shrink-0">{icon}</span>}{children}
    </span>
  );
}

export default Badge;