
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface FabricSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const PREDEFINED_FABRICS = [
  'New Fabric',
  'Fendy Silk',
  'Cotton',
  'Chiffon',
  'Banarasi Silk'
];

const FabricSelector = ({ value, onChange }: FabricSelectorProps) => {
  const [isCustom, setIsCustom] = useState(() => {
    return !PREDEFINED_FABRICS.includes(value) && value !== '';
  });

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === 'custom') {
      setIsCustom(true);
      onChange('');
    } else {
      setIsCustom(false);
      onChange(selectedValue);
    }
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  if (isCustom) {
    return (
      <div className="space-y-2">
        <Input
          type="text"
          value={value}
          onChange={handleCustomInputChange}
          placeholder="Enter custom fabric type..."
          className="w-full"
        />
        <button
          type="button"
          onClick={() => {
            setIsCustom(false);
            onChange('New Fabric');
          }}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          Choose from predefined options
        </button>
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={handleSelectChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select fabric type..." />
      </SelectTrigger>
      <SelectContent>
        {PREDEFINED_FABRICS.map((fabric) => (
          <SelectItem key={fabric} value={fabric}>
            {fabric}
          </SelectItem>
        ))}
        <SelectItem value="custom">Custom Fabric</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default FabricSelector;
