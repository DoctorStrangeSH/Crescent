import { Search, X } from 'lucide-react';
import { useRef } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

function SearchInput({ value, onChange, placeholder = 'Поиск...', autoFocus }: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-white/30" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="block w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-crescent-accent/50 focus:border-crescent-accent/50 transition-all"
      />
      {value && (
        <button onClick={() => { onChange(''); inputRef.current?.focus(); }} className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default SearchInput;