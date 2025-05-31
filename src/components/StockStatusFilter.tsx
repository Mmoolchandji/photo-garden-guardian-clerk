
import { Checkbox } from '@/components/ui/checkbox';

interface StockStatusFilterProps {
  selectedStatuses: string[];
  onChange: (statuses: string[]) => void;
}

const STOCK_OPTIONS = [
  'Available',
  'Coming Soon',
  'Out of Stock'
];

const StockStatusFilter = ({ selectedStatuses, onChange }: StockStatusFilterProps) => {
  const toggleStatus = (status: string) => {
    if (selectedStatuses.includes(status)) {
      onChange(selectedStatuses.filter(s => s !== status));
    } else {
      onChange([...selectedStatuses, status]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Stock Status</label>
      <div className="space-y-2">
        {STOCK_OPTIONS.map((status) => (
          <div key={status} className="flex items-center space-x-2">
            <Checkbox
              id={`status-${status}`}
              checked={selectedStatuses.includes(status)}
              onCheckedChange={() => toggleStatus(status)}
            />
            <label
              htmlFor={`status-${status}`}
              className="text-sm text-gray-600 cursor-pointer"
            >
              {status}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockStatusFilter;
