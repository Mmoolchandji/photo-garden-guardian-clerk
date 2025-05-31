
import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar = ({ value, onChange, placeholder = "Search photos..." }: SearchBarProps) => {
  const [localValue, setLocalValue] = useState(value);
  const inputId = 'search-input';

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onChange(localValue);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [localValue, onChange]);

  return (
    <div className="relative">
      <label htmlFor={inputId} className="sr-only">
        Search photos
      </label>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        id={inputId}
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10"
      />
      {localValue && (
        <button
          onClick={() => {
            setLocalValue('');
            onChange('');
          }}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
