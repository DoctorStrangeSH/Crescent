import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-crescent-accent text-white hover:bg-crescent-accent/90 shadow-sm',
  secondary: 'bg-surface-hover dark:bg-surface-hover-dark text-gray-700 dark:text-white hover:bg-surface-border dark:hover:bg-surface-border-dark',
  ghost: 'text-surface-muted dark:text-surface-muted-dark hover:text-gray-700 dark:hover:text-white hover:bg-surface-hover dark:hover:bg-surface-hover-dark',
  danger: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20',
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1 text-xs rounded-lg gap-1.5',
  sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-5 py-3 text-sm rounded-2xl gap-2',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, variant = 'primary', size = 'md', isLoading, icon, disabled, className = '', ...props }, ref
) {
  return (
    <button ref={ref}
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || isLoading} {...props}>
      {isLoading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? <span className="flex-shrink-0">{icon}</span> : null}
      {children}
    </button>
  );
});

export default Button;