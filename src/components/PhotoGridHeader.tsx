
import { Photo } from '@/types/photo';
import { usePhotoSelection } from '@/contexts/PhotoSelectionContext';

interface PhotoGridHeaderProps {
  photosCount: number;
}

const PhotoGridHeader = ({ photosCount }: PhotoGridHeaderProps) => {
  const { isSelectionMode } = usePhotoSelection();

  return (
    <div className="mb-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        {isSelectionMode ? 'Select Photos' : 'Gallery Collection'}
      </h3>
      <p className="text-gray-600">
        {photosCount === 0 
          ? "No photos match your search criteria" 
          : `Showing ${photosCount} photo${photosCount !== 1 ? 's' : ''}`
        }
        {isSelectionMode && ` • Long press to start selection mode`}
      </p>
    </div>
  );
};

export default PhotoGridHeader;
