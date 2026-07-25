// Файл: src/components/ui/Badge.tsx
import { type ReactNode } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'purple' | 'gold' | 'ghost';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  icon?: ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
  danger: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
  purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
  gold: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
  ghost: 'bg-transparent text-gray-500 dark:text-gray-500',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-2 py-0.5 text-[10px] rounded-md',
  md: 'px-2.5 py-1 text-xs rounded-lg',
};

function Badge({ children, variant = 'default', icon, size = 'md', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

export default Badge;