// Файл: src/components/ui/SearchInput.tsx
import { Search, X } from 'lucide-react';
import { useRef } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

function SearchInput({ value, onChange, placeholder = 'Поиск...', autoFocus = false }: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-crescent-muted" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="block w-full pl-9 pr-9 py-2 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-gray-100 placeholder-crescent-muted focus:outline-none focus:ring-2 focus:ring-crescent-accent/20 focus:border-crescent-accent/50 transition-all"
      />
      {value && (
        <button
          onClick={() => { onChange(''); inputRef.current?.focus(); }}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-crescent-muted hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export default SearchInput;