
import { Photo, PhotoCardData } from '@/types/photo';
import OptimizedPhotoCard from './OptimizedPhotoCard';
import LazyImage from './LazyImage';

interface PhotoGridViewProps {
  photos: Photo[];
  viewMode: 'grid' | 'list';
  onPhotoClick: (photo: Photo) => void;
}

const PhotoGridView = ({ photos, viewMode, onPhotoClick }: PhotoGridViewProps) => {
  const transformPhotoData = (photo: Photo): PhotoCardData => ({
    id: photo.id,
    title: photo.title,
    description: photo.description || '',
    imageUrl: photo.image_url,
    createdAt: new Date(photo.created_at).toLocaleDateString(),
    price: photo.price,
  });

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {photos.map((photo) => (
          <OptimizedPhotoCard
            key={photo.id}
            photo={transformPhotoData(photo)}
            onClick={() => onPhotoClick(photo)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onPhotoClick(photo)}
        >
          <div className="flex space-x-4">
            <LazyImage
              src={photo.image_url}
              alt={photo.title}
              className="w-24 h-24 rounded-lg"
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
  );
};

export default PhotoGridView;
