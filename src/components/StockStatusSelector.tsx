
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StockStatusSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const STOCK_OPTIONS = [
  'Available',
  'Coming Soon', 
  'Out of Stock'
];

const StockStatusSelector = ({ value, onChange }: StockStatusSelectorProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select stock status..." />
      </SelectTrigger>
      <SelectContent>
        {STOCK_OPTIONS.map((status) => (
          <SelectItem key={status} value={status}>
            {status}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default StockStatusSelector;
