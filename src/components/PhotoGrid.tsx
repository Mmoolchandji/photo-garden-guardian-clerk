
import { useState, useEffect, useMemo, useRef } from 'react';
import { Photo, PhotoCardData } from '@/types/photo';
import PhotoModal from './PhotoModal';
import PhotoLoadingState from './PhotoLoadingState';
import PhotoEmptyState from './PhotoEmptyState';
import PhotoGridView from './PhotoGridView';
import SearchAndFilters, { FilterState } from './SearchAndFilters';
import useURLFilters from '@/hooks/useURLFilters';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface PhotoGridProps {
  viewMode: 'grid' | 'list';
}

const PhotoGrid = ({ viewMode }: PhotoGridProps) => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { filters, updateFilters, clearAllFilters } = useURLFilters();
  
  // Use ref to track the last filter state to prevent unnecessary API calls
  const lastFiltersRef = useRef<string>('');

  // Memoize the query builder to prevent recreation
  const buildQuery = useMemo(() => {
    return () => {
      let query = supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });

      // Search filter
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Fabric filter
      if (filters.fabrics.length > 0) {
        query = query.in('fabric', filters.fabrics);
      }

      // Stock status filter
      if (filters.stockStatuses.length > 0) {
        query = query.in('stock_status', filters.stockStatuses);
      }

      // Price range filter
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
    // Convert filters to string for comparison
    const filtersString = JSON.stringify(filters);
    
    // Only fetch if filters actually changed
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

  const transformSelectedPhoto = (photo: Photo): PhotoCardData => ({
    id: photo.id,
    title: photo.title,
    description: photo.description || '',
    imageUrl: photo.image_url,
    createdAt: new Date(photo.created_at).toLocaleDateString(),
    price: photo.price,
  });

  if (loading) {
    return (
      <PhotoLoadingState
        filters={filters}
        updateFilters={updateFilters}
        clearAllFilters={clearAllFilters}
      />
    );
  }

  return (
    <>
      <SearchAndFilters
        filters={filters}
        onChange={updateFilters}
        onClearAll={clearAllFilters}
      />

      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Gallery Collection</h3>
        <p className="text-gray-600">
          {photos.length === 0 
            ? "No photos match your search criteria" 
            : `Showing ${photos.length} photo${photos.length !== 1 ? 's' : ''}`
          }
        </p>
      </div>

      {photos.length === 0 ? (
        <PhotoEmptyState />
      ) : (
        <PhotoGridView
          photos={photos}
          viewMode={viewMode}
          onPhotoClick={setSelectedPhoto}
        />
      )}

      <PhotoModal
        photo={selectedPhoto ? transformSelectedPhoto(selectedPhoto) : null}
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />
    </>
  );
};

export default PhotoGrid;
