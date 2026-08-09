import { type ReactNode } from 'react';
import Button from './Button';

interface EmptyStateProps { icon?: ReactNode; title: string; description?: string; actionLabel?: string; onAction?: () => void; }

function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      {icon && <div className="w-20 h-20 rounded-3xl bg-surface-hover dark:bg-surface-hover-dark border border-surface-border dark:border-surface-border-dark flex items-center justify-center mb-6">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      {description && <p className="text-sm text-surface-muted max-w-xs mb-6">{description}</p>}
      {actionLabel && onAction && <Button onClick={onAction}>{actionLabel}</Button>}
    </div>
  );
}

export default EmptyState;