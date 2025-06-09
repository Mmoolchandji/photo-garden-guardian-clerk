
import { useState, useEffect, useMemo, useRef } from 'react';
import { Photo } from '@/types/photo';
import { FilterState } from '@/components/SearchAndFilters';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const usePhotoData = (filters: FilterState) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const lastFiltersRef = useRef<string>('');

  const buildQuery = useMemo(() => {
    return () => {
      let query = supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.fabrics.length > 0) {
        query = query.in('fabric', filters.fabrics);
      }

      if (filters.stockStatuses.length > 0) {
        query = query.in('stock_status', filters.stockStatuses);
      }

      if (filters.priceRange) {
        if (filters.priceRange === '0-300') {
          query = query.lt('price', 300);
        } else if (filters.priceRange === '300-500') {
          query = query.gte('price', 300).lte('price', 500);
        } else if (filters.priceRange === '500-700') {
          query = query.gte('price', 500).lte('price', 700);
        } else if (filters.priceRange === '700-1000') {
          query = query.gte('price', 700).lte('price', 1000);
        } else if (filters.priceRange === '1000+') {
          query = query.gte('price', 1000);
        }
      }

      return query;
    };
  }, [filters]);

  useEffect(() => {
    const filtersString = JSON.stringify(filters);
    
    if (filtersString === lastFiltersRef.current) {
      return;
    }
    
    lastFiltersRef.current = filtersString;
    
    let isMounted = true;
    
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        const query = buildQuery();
        const { data, error } = await query;

        if (error) {
          throw error;
        }

        if (isMounted) {
          setPhotos(data || []);
        }
      } catch (error: any) {
        console.error('Fetch photos error:', error);
        if (isMounted) {
          toast({
            title: "Error loading photos",
            description: error.message || "Failed to load photos. Please try again.",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPhotos();

    return () => {
      isMounted = false;
    };
  }, [buildQuery, toast]);

  return { photos, loading };
};
