
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Photo } from '@/types/photo';
import { FilterState } from '@/components/SearchAndFilters';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const usePhotoData = (filters: FilterState) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const { toast } = useToast();
  const { user, authReady } = useAuth();
  
  // Limit initial load to improve perceived performance
  const INITIAL_LIMIT = 24; // Show 24 photos initially (3-4 rows in grid view)
  

  const buildQuery = useMemo(() => {
    return (limitResults = false) => {
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
        
      // For initial load, limit results for better perceived performance
      if (limitResults) {
        query = query.limit(INITIAL_LIMIT);
      }

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
      const query = buildQuery(!initialLoadComplete);
      const { data, error } = await query;

      if (error) {
        throw error;
      }

        if (isMounted) {
          console.log('usePhotoData: Photos fetched successfully:', data?.length || 0);
          setPhotos(data || []);
          if (!initialLoadComplete) {
            setInitialLoadComplete(true);
          }
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
  }, [buildQuery, user, toast, initialLoadComplete]);


  useEffect(() => {
    if (authReady) {
      fetchPhotos();
    }
  }, [authReady, fetchPhotos]);

  const loadMorePhotos = useCallback(async () => {
    if (!user || !initialLoadComplete) return;
    
    try {
      const query = supabase
        .from('photos')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
        .range(photos.length, photos.length + INITIAL_LIMIT - 1);

      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setPhotos(prev => [...prev, ...data]);
      }
    } catch (error) {
      console.error('usePhotoData: Load more photos error:', error);
      toast({
        title: "Error loading more photos",
        description: "Failed to load additional photos. Please try again.",
        variant: "destructive",
      });
    }
  }, [user, initialLoadComplete, photos.length, toast]);

  return { 
    photos, 
    loading, 
    refetch: fetchPhotos, 
    loadMore: loadMorePhotos,
    hasInitialLoad: initialLoadComplete 
  };
};
