
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Photo } from '@/types/photo';
import { FilterState } from '@/components/SearchAndFilters';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const usePhotoData = (filters: FilterState) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, authReady } = useAuth();
  

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
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false }); // Fallback for photos without sort_order

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

  

  const fetchPhotos = useCallback(async () => {
    let isMounted = true;
    try {
      console.log('usePhotoData: Starting photo fetch for user:', user?.id || 'no user');
      setLoading(true);
      
      if (!user) {
        console.log('usePhotoData: No authenticated user, setting empty photos');
        if (isMounted) {
          setPhotos([]);
        }
        return;
      }

      console.log('usePhotoData: Fetching photos for user:', user.id);
      const query = buildQuery();
      const { data, error } = await query;

      if (error) {
        throw error;
      }

        if (isMounted) {
          console.log('usePhotoData: Photos fetched successfully:', data?.length || 0);
          setPhotos(data || []);
        }
      } catch (error: unknown) {
        console.error('usePhotoData: Fetch photos error:', error);
        if (isMounted) {
          toast({
            title: "Error loading photos",
            description: (error as Error).message || "Failed to load photos. Please try again.",
            variant: "destructive",
          });
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
    return () => {
      isMounted = false;
    };
  }, [buildQuery, user, toast]);


  useEffect(() => {
    if (authReady) {
      fetchPhotos();
    }
  }, [authReady, fetchPhotos]);

  return { photos, loading, refetch: fetchPhotos };
};
