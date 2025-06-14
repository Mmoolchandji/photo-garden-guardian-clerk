
import { Calendar, Eye, Check } from 'lucide-react';
import { PhotoCardData } from '@/types/photo';
import WhatsAppShareButton from './WhatsAppShareButton';
import { usePhotoSelection } from '@/contexts/PhotoSelectionContext';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LazyImage from './LazyImage';

interface OptimizedPhotoCardProps {
  photo: PhotoCardData;
  onClick: () => void;
}

const OptimizedPhotoCard = ({ photo, onClick }: OptimizedPhotoCardProps) => {
  const { 
    isSelectionMode, 
    isPhotoSelected, 
    togglePhoto, 
    enterSelectionMode,
    canAddMore
  } = usePhotoSelection();
  
  const { user } = useAuth();
  const [isLongPress, setIsLongPress] = useState(false);
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
        return;
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

  // Long press detection
  useEffect(() => {
    let pressTimer: NodeJS.Timeout;
    
    const startPress = () => {
      pressTimer = setTimeout(() => {
        setIsLongPress(true);
        handleLongPress();
      }, 500);
    };

    const endPress = () => {
      clearTimeout(pressTimer);
      setIsLongPress(false);
    };

    const photoElement = document.getElementById(`photo-${photo.id}`);
    if (photoElement) {
      photoElement.addEventListener('touchstart', startPress);
      photoElement.addEventListener('touchend', endPress);
      photoElement.addEventListener('mousedown', startPress);
      photoElement.addEventListener('mouseup', endPress);
      photoElement.addEventListener('mouseleave', endPress);

      return () => {
        photoElement.removeEventListener('touchstart', startPress);
        photoElement.removeEventListener('touchend', endPress);
        photoElement.removeEventListener('mousedown', startPress);
        photoElement.removeEventListener('mouseup', endPress);
        photoElement.removeEventListener('mouseleave', endPress);
      };
    }
  }, [photo.id]);

  return (
    <div
      id={`photo-${photo.id}`}
      className={`group bg-white rounded-xl shadow-sm border-2 overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer ${
        selected 
          ? 'border-emerald-500 ring-2 ring-emerald-200' 
          : isSelectionMode 
            ? 'border-gray-300' 
            : 'border-gray-200'
      }`}
      onClick={handleClick}
    >
      <div className="relative overflow-hidden">
        <LazyImage
          src={photo.imageUrl}
          alt={photo.title}
          className="w-full h-48 group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Selection overlay */}
        {isSelectionMode && (
          <div className={`absolute inset-0 ${selected ? 'bg-emerald-500/20' : 'bg-black/10'} transition-all duration-200`} />
        )}
        
        {/* Selection checkbox */}
        {isSelectionMode && (
          <div className="absolute top-3 left-3">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
              selected 
                ? 'bg-emerald-500 border-emerald-500' 
                : 'bg-white/90 border-gray-400'
            }`}>
              {selected && <Check className="h-4 w-4 text-white" />}
            </div>
          </div>
        )}
        
        {/* Action buttons (only show when not in selection mode) */}
        {!isSelectionMode && (
          <div className="absolute top-3 right-3 flex space-x-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Eye className="h-4 w-4 text-gray-700" />
            </div>
            <WhatsAppShareButton
              photo={{
                id: photo.id,
                title: photo.title,
                imageUrl: photo.imageUrl,
                price: photo.price,
              }}
              variant="icon"
            />
          </div>
        )}
        
        {/* Selection mode indicator */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="p-4">
        <h3 className={`font-semibold mb-2 transition-colors ${
          selected 
            ? 'text-emerald-600' 
            : 'text-gray-900 group-hover:text-emerald-600'
        }`}>
          {photo.title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {photo.description}
        </p>
        <div className="flex items-center text-xs text-gray-400">
          <Calendar className="h-3 w-3 mr-1" />
          {photo.createdAt}
        </div>
      </div>
    </div>
  );
};

export default OptimizedPhotoCard;
