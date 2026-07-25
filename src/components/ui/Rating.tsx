// Файл: src/components/ui/Rating.tsx
import { Star } from 'lucide-react';

interface RatingProps {
  value: number | null;
  maxStars?: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses: Record<string, string> = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

function Rating({ value, maxStars = 10, onChange, readonly = false, size = 'md' }: RatingProps) {
  const stars = [];
  for (let i = 1; i <= maxStars; i++) {
    const filled = value !== null && i <= value;
    stars.push(
      <button
        key={i}
        type="button"
        disabled={readonly}
        onClick={() => onChange?.(i)}
        className={`transition-all duration-100 ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-115'}`}
        title={`${i} из ${maxStars}`}
      >
        <Star
          className={`${sizeClasses[size]} transition-colors ${
            filled ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-gray-700'
          }`}
        />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-0.5">
      {stars}
      {value !== null && (
        <span className="ml-1.5 text-xs font-medium text-crescent-muted">{value}/10</span>
      )}
    </div>
  );
}

export default Rating;