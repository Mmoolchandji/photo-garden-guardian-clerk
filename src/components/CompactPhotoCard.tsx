import { Check } from 'lucide-react';
import { PhotoCardData } from '@/types/photo';
import { usePhotoSelection } from '@/contexts/PhotoSelectionContext';
import { useLongPress } from '@/hooks/useLongPress';
import { useAuth } from '@/contexts/AuthContext';
import { getOptimizedImageUrl } from '@/utils/imageOptimization';

interface CompactPhotoCardProps {
  photo: PhotoCardData;
  onClick: () => void;
}

const CompactPhotoCard = ({ photo, onClick }: CompactPhotoCardProps) => {
  const { 
    isSelectionMode, 
    isPhotoSelected, 
    togglePhoto, 
    enterSelectionMode,
    canAddMore
  } = usePhotoSelection();
  
  const { user } = useAuth();
  const selected = isPhotoSelected(photo.id);

  const handleLongPress = () => {
    if (!isSelectionMode && user) {
      enterSelectionMode();
      togglePhoto({
        id: photo.id,
        title: photo.title,
        description: photo.description,
        image_url: photo.imageUrl,
        created_at: photo.createdAt,
        price: photo.price,
        user_id: user.id,
        legacy: false,
      });
    }
  };

  const handleClick = () => {
    if (isSelectionMode && user) {
      if (!selected && !canAddMore()) {
        return; // Don't allow selection if limits reached
      }
      togglePhoto({
        id: photo.id,
        title: photo.title,
        description: photo.description,
        image_url: photo.imageUrl,
        created_at: photo.createdAt,
        price: photo.price,
        user_id: user.id,
        legacy: false,
      });
    } else {
      onClick();
    }
  };

  const longPressHandlers = useLongPress({
    onLongPress: handleLongPress,
    onClick: handleClick,
    delay: 500,
  });

  return (
    <div
      {...longPressHandlers}
      className={`group bg-white rounded-md overflow-hidden border-2 transition-all duration-200 cursor-pointer select-none touch-manipulation ${
        selected 
          ? 'border-primary shadow-sm' 
          : isSelectionMode 
            ? 'border-border' 
            : 'border-transparent'
      }`}
    >
      <div className="relative overflow-hidden">
        <img
          src={getOptimizedImageUrl(photo.imageUrl, { width: 320, quality: 80 })}
          alt={photo.title}
          className="w-full h-auto aspect-[3/4] object-cover"
          draggable={false}
          loading="lazy"
          decoding="async"
          sizes="(min-width:1024px) 20vw, (min-width:768px) 25vw, 33vw"
        />
        
        {isSelectionMode && (
          <div className={`absolute inset-0 ${selected ? 'bg-primary/10' : 'bg-black/5'} transition-all duration-200`} />
        )}
        
        {isSelectionMode && (
          <div className="absolute top-1 left-1">
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
              selected 
                ? 'bg-primary border-primary' 
                : 'bg-white/90 border-muted-foreground'
            }`}>
              {selected && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
            </div>
          </div>
        )}

        {/* Minimal title overlay - only show title */}
        {/* <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5 bg-gradient-to-t from-black/50 to-transparent">
          <p className="text-xs font-medium text-white truncate">
            {photo.title}
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default CompactPhotoCard;
