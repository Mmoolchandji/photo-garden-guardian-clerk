
import { useState, useEffect } from 'react';
import PhotoCard from './PhotoCard';
import PhotoModal from './PhotoModal';
import SearchAndFilters, { FilterState } from './SearchAndFilters';
import useURLFilters from '@/hooks/useURLFilters';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Photo {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  created_at: string;
  fabric?: string;
  price?: number;
  stock_status?: string;
}

interface PhotoGridProps {
  viewMode: 'grid' | 'list';
}

const PhotoGrid = ({ viewMode }: PhotoGridProps) => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { filters, updateFilters, clearAllFilters } = useURLFilters();

  useEffect(() => {
    fetchPhotos();
  }, [filters]);

  const buildQuery = () => {
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

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const { data, error } = await buildQuery();

      if (error) {
        throw error;
      }

      setPhotos(data || []);
    } catch (error: any) {
      console.error('Fetch photos error:', error);
      toast({
        title: "Error loading photos",
        description: error.message || "Failed to load photos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <SearchAndFilters
          filters={filters}
          onChange={updateFilters}
          onClearAll={clearAllFilters}
        />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading photos...</p>
        </div>
      </div>
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
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h4 className="text-lg font-medium text-gray-900 mb-2">No photos found</h4>
          <p className="text-gray-500 mb-4">
            Try adjusting your search criteria or clearing filters to see more results.
          </p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {photos.map((photo) => (
                <PhotoCard
                  key={photo.id}
                  photo={{
                    id: photo.id,
                    title: photo.title,
                    description: photo.description || '',
                    imageUrl: photo.image_url,
                    createdAt: new Date(photo.created_at).toLocaleDateString()
                  }}
                  onClick={() => setSelectedPhoto(photo)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <div className="flex space-x-4">
                    <img
                      src={photo.image_url}
                      alt={photo.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{photo.title}</h4>
                      <p className="text-gray-600 text-sm mb-2">{photo.description}</p>
                      {photo.fabric && (
                        <p className="text-xs text-emerald-600 mb-1">Fabric: {photo.fabric}</p>
                      )}
                      {photo.price && (
                        <p className="text-xs text-gray-600 mb-1">Price: ₹{photo.price}</p>
                      )}
                      {photo.stock_status && (
                        <p className="text-xs text-blue-600 mb-1">Status: {photo.stock_status}</p>
                      )}
                      <p className="text-xs text-gray-400">Added {new Date(photo.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <PhotoModal
        photo={selectedPhoto ? {
          id: selectedPhoto.id,
          title: selectedPhoto.title,
          description: selectedPhoto.description || '',
          imageUrl: selectedPhoto.image_url,
          createdAt: new Date(selectedPhoto.created_at).toLocaleDateString()
        } : null}
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />
    </>
  );
};

export default PhotoGrid;
