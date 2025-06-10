
import { useState, useEffect, useMemo, useRef } from 'react';
import { Photo } from '@/types/photo';
import { FilterState } from '@/components/SearchAndFilters';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const usePhotoData = (filters: FilterState) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const lastFiltersRef = useRef<string>('');

  const buildQuery = useMemo(() => {
    return () => {
      if (!user) {
        // If user is not authenticated, return a query that will return no results
        return supabase
          .from('photos')
          .select('*')
          .eq('id', '00000000-0000-0000-0000-000000000000'); // Non-existent ID
      }

      let query = supabase
        .from('photos')
        .select('*')
        .eq('user_id', user.id) // Only fetch photos for the authenticated user
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
  }, [filters, user]);

  useEffect(() => {
    const filtersString = JSON.stringify(filters) + (user?.id || 'no-user');
    
    if (filtersString === lastFiltersRef.current) {
      return;
    }
    
    lastFiltersRef.current = filtersString;
    
    let isMounted = true;
    
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        
        if (!user) {
          // If no user is authenticated, show empty gallery
          if (isMounted) {
            setPhotos([]);
          }
          return;
        }

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
  }, [buildQuery, toast, user]);

  return { photos, loading };
};
