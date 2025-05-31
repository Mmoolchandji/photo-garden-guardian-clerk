
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PriceRangeFilterProps {
  selectedRange: string;
  onChange: (range: string) => void;
}

const PRICE_RANGES = [
  { label: 'All Prices', value: 'all' },
  { label: 'Under ₹300', value: '0-300' },
  { label: '₹300-₹500', value: '300-500' },
  { label: '₹500-₹700', value: '500-700' },
  { label: '₹700-₹1000', value: '700-1000' },
  { label: 'Above ₹1000', value: '1000+' }
];

const PriceRangeFilter = ({ selectedRange, onChange }: PriceRangeFilterProps) => {
  const handleChange = (value: string) => {
    // Convert 'all' back to empty string for filtering logic
    onChange(value === 'all' ? '' : value);
  };

  // Convert empty string to 'all' for display
  const displayValue = selectedRange === '' ? 'all' : selectedRange;
  const selectId = 'price-range-filter';

  return (
    <div className="space-y-2">
      <label htmlFor={selectId} className="text-sm font-medium text-gray-700">
        Price Range
      </label>
      <Select value={displayValue} onValueChange={handleChange}>
        <SelectTrigger id={selectId}>
          <SelectValue placeholder="Select price range..." />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
          {PRICE_RANGES.map((range) => (
            <SelectItem key={range.value} value={range.value}>
              {range.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PriceRangeFilter;
