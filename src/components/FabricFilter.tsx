
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FabricFilterProps {
  selectedFabrics: string[];
  onChange: (fabrics: string[]) => void;
}

const FabricFilter = ({ selectedFabrics, onChange }: FabricFilterProps) => {
  const [availableFabrics, setAvailableFabrics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailableFabrics();
  }, []);

  const fetchAvailableFabrics = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('fabric')
        .not('fabric', 'is', null);

      if (error) throw error;

      const uniqueFabrics = [...new Set(data.map(item => item.fabric).filter(Boolean))];
      setAvailableFabrics(uniqueFabrics.sort());
    } catch (error) {
      console.error('Error fetching fabrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFabric = (fabric: string) => {
    if (selectedFabrics.includes(fabric)) {
      onChange(selectedFabrics.filter(f => f !== fabric));
    } else {
      onChange([...selectedFabrics, fabric]);
    }
  };

  const removeFabric = (fabric: string) => {
    onChange(selectedFabrics.filter(f => f !== fabric));
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Fabric</label>
        <div className="animate-pulse bg-gray-200 h-10 rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Fabric</label>
      <Select onValueChange={toggleFabric}>
        <SelectTrigger>
          <SelectValue placeholder="Select fabrics..." />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
          {availableFabrics.map((fabric) => (
            <SelectItem key={fabric} value={fabric} className="flex items-center space-x-2">
              <Checkbox
                checked={selectedFabrics.includes(fabric)}
                onChange={() => toggleFabric(fabric)}
              />
              <span>{fabric}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedFabrics.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedFabrics.map((fabric) => (
            <Badge key={fabric} variant="secondary" className="flex items-center gap-1">
              {fabric}
              <button
                onClick={() => removeFabric(fabric)}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default FabricFilter;
