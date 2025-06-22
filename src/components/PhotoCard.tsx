
import { Calendar, Eye, Check } from 'lucide-react';
import { PhotoCardData } from '@/types/photo';
import WhatsAppShareButton from './WhatsAppShareButton';
import { usePhotoSelection } from '@/contexts/PhotoSelectionContext';
import { useLongPress } from '@/hooks/useLongPress';
import { useAuth } from '@/contexts/AuthContext';

interface PhotoCardProps {
  photo: PhotoCardData;
  onClick: () => void;
}

const PhotoCard = ({ photo, onClick }: PhotoCardProps) => {
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
      className={`group bg-white rounded-lg overflow-hidden border-2 transition-all duration-300 cursor-pointer select-none touch-manipulation ${
        selected 
          ? 'border-emerald-500' 
          : isSelectionMode 
            ? 'border-gray-300' 
            : 'border-transparent'
      }`}
    >
      <div className="relative overflow-hidden">
        <img
          src={photo.imageUrl}
          alt={photo.title}
          className="w-full h-auto aspect-[3/4] object-cover"
          draggable={false}
        />
        
        {isSelectionMode && (
          <div className={`absolute inset-0 ${selected ? 'bg-emerald-500/20' : 'bg-black/10'} transition-all duration-200`} />
        )}
        
        {isSelectionMode && (
          <div className="absolute top-2 left-2">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
              selected 
                ? 'bg-emerald-500 border-emerald-500' 
                : 'bg-white/90 border-gray-400'
            }`}>
              {selected && <Check className="h-3 w-3 text-white" />}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-2">
        <h3 className="font-bold text-sm text-gray-800 truncate">
          {photo.title}
        </h3>
        <p className="text-xs text-gray-500 truncate">
          {photo.description}
        </p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm font-semibold text-gray-900">
            ₹{photo.price}
          </p>
          <div className="flex items-center text-xs text-gray-400">
            <Calendar className="h-3 w-3 mr-1" />
            {photo.createdAt}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoCard;
