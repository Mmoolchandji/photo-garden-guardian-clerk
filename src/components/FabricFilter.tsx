
import { useState, useEffect, useMemo } from 'react';
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

  // Fetch fabrics only once on mount
  useEffect(() => {
    let isMounted = true;
    
    const fetchAvailableFabrics = async () => {
      try {
        const { data, error } = await supabase
          .from('photos')
          .select('fabric')
          .not('fabric', 'is', null);

        if (error) throw error;

        if (isMounted) {
          const uniqueFabrics = [...new Set(data.map(item => item.fabric).filter(Boolean))];
          setAvailableFabrics(uniqueFabrics.sort());
        }
      } catch (error) {
        console.error('Error fetching fabrics:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAvailableFabrics();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - only run once

  // Memoize handlers to prevent recreation
  const toggleFabric = useMemo(() => (fabric: string) => {
    if (selectedFabrics.includes(fabric)) {
      onChange(selectedFabrics.filter(f => f !== fabric));
    } else {
      onChange([...selectedFabrics, fabric]);
    }
  }, [selectedFabrics, onChange]);

  const removeFabric = useMemo(() => (fabric: string) => {
    onChange(selectedFabrics.filter(f => f !== fabric));
  }, [selectedFabrics, onChange]);

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
                readOnly
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
