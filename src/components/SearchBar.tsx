
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const SearchBar = ({ value, onChange, placeholder = "Search...", disabled = false }: SearchBarProps) => {
  return (
    <div className="relative">
      <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${disabled ? 'text-gray-400' : 'text-gray-500'}`} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
          disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'
        }`}
      />
    </div>
  );
};

export default SearchBar;
