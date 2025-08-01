
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

// SearchBar component props
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  debounce?: number;
}
// This is a reusable search bar component with debouncing functionality
const SearchBar = ({ value, onChange, placeholder = "Search...", disabled = false, debounce = 500 }: SearchBarProps) => {
  // This is a state to store the input value
  const [inputValue, setInputValue] = useState(value);

  // This is an effect to handle the debouncing
  useEffect(() => {
    // This is a timer to delay the onChange event
    const handler = setTimeout(() => {
      if (inputValue !== value) {
        onChange(inputValue);
      }
    }, debounce);

    // This is a cleanup function to clear the timer
    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, debounce, onChange, value]);
  
  // This is an effect to update the input value when the value prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
// This is the JSX for the search bar
    <div className="relative">
      <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${disabled ? 'text-gray-400' : 'text-gray-500'}`} />
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
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
