
import { useState, useEffect, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';

interface FabricFilterProps {
  selectedFabrics: string[];
  onChange: (fabrics: string[]) => void;
}

const FabricFilter = ({ selectedFabrics, onChange }: FabricFilterProps) => {
  const [availableFabrics, setAvailableFabrics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Memoize the fetch function to prevent recreation
  const fetchAvailableFabrics = useMemo(() => {
    return async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('photos')
          .select('fabric')
          .not('fabric', 'is', null);

        if (error) {
          console.error('Error fetching fabrics:', error);
          return;
        }

        // Extract unique fabrics
        const uniqueFabrics = [...new Set(data?.map(item => item.fabric).filter(Boolean))];
        setAvailableFabrics(uniqueFabrics);
      } catch (error) {
        console.error('Error fetching fabrics:', error);
      } finally {
        setLoading(false);
      }
    };
  }, []);

  // Fetch available fabrics only once on mount
  useEffect(() => {
    fetchAvailableFabrics();
  }, [fetchAvailableFabrics]);

  const toggleFabric = (fabric: string) => {
    if (selectedFabrics.includes(fabric)) {
      onChange(selectedFabrics.filter(f => f !== fabric));
    } else {
      onChange([...selectedFabrics, fabric]);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Fabric</label>
        <div className="text-sm text-gray-500">Loading fabrics...</div>
      </div>
    );
  }

  if (availableFabrics.length === 0) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Fabric</label>
        <div className="text-sm text-gray-500">No fabrics available</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700" id="fabric-filter-label">
        Fabric
      </label>
      <div className="space-y-2" role="group" aria-labelledby="fabric-filter-label">
        {availableFabrics.map((fabric) => {
          const checkboxId = `fabric-${fabric.toLowerCase().replace(/\s+/g, '-')}`;
          const isChecked = selectedFabrics.includes(fabric);
          return (
            <div key={fabric} className="flex items-center space-x-2">
              <Checkbox
                id={checkboxId}
                checked={isChecked}
                onCheckedChange={() => toggleFabric(fabric)}
              />
              <label
                htmlFor={checkboxId}
                className="text-sm text-gray-600 cursor-pointer"
              >
                {fabric}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FabricFilter;
