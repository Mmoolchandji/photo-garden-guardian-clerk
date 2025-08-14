
import { Photo, PhotoCardData } from '@/types/photo';
import PhotoCard from './PhotoCard';
import CompactPhotoCard from './CompactPhotoCard';

interface PhotoGridViewProps {
  photos: Photo[];
  viewMode: 'grid' | 'compact';
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 sm:gap-4 py-4 transition-all duration-300">
        {photos.map((photo, index) => (
          <PhotoCard
            key={photo.id}
            photo={transformPhotoData(photo)}
            onClick={() => onPhotoClick(photo)}
            priority={index === 0} // First image gets high priority for LCP
          />
        ))}
      </div>
    );
  }

  // Compact view - maximum density for mobile
  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-1 py-2 transition-all duration-300">
      {photos.map((photo, index) => (
        <CompactPhotoCard
          key={photo.id}
          photo={transformPhotoData(photo)}
          onClick={() => onPhotoClick(photo)}
          priority={index === 0} // First image gets high priority for LCP
        />
      ))}
    </div>
  );
};

export default PhotoGridView;
