// Файл: src/components/ui/EmptyState.tsx
import { type ReactNode } from 'react';
import Button from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800/50 flex items-center justify-center mb-5">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-crescent-muted max-w-xs mb-6 leading-relaxed">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md">{actionLabel}</Button>
      )}
    </div>
  );
}

export default EmptyState;