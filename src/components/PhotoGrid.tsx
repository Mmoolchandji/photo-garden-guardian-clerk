
import { useState, useEffect } from 'react';
import PhotoCard from './PhotoCard';
import PhotoModal from './PhotoModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Photo {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  created_at: string;
}

interface PhotoGridProps {
  viewMode: 'grid' | 'list';
}

const PhotoGrid = ({ viewMode }: PhotoGridProps) => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });

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
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading photos...</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Gallery Collection</h3>
          <p className="text-gray-600">Explore our curated selection of garden photography</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-8">
          <h4 className="text-lg font-medium text-gray-900 mb-2">No photos yet</h4>
          <p className="text-gray-500">The gallery is waiting for beautiful photos to be added by the admin.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Gallery Collection</h3>
        <p className="text-gray-600">Explore our curated selection of garden photography</p>
      </div>

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
                  <p className="text-xs text-gray-400">Added {new Date(photo.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
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
