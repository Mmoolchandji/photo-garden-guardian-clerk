import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Check } from 'lucide-react';
import { Photo } from '@/types/photo';
import { useLongPress } from '@/hooks/useLongPress';
import { useAdminPhotoSelection } from '@/contexts/AdminPhotoSelectionContext';

interface SortableAdminPhotoCardProps {
  photo: Photo;
  onPhotoEdit: (photo: Photo) => void;
  onPhotoDeleted: () => void;
  deletingId: string | null;
  handleDelete: (photo: Photo) => void;
  handlePhotoLongPress: (photo: Photo) => void;
  handlePhotoClick: (photo: Photo) => void;
  viewMode?: 'grid' | 'compact';
}

export const SortableAdminPhotoCard = ({ 
  photo,
  onPhotoEdit,
  onPhotoDeleted,
  deletingId,
  handleDelete,
  handlePhotoLongPress,
  handlePhotoClick,
  viewMode = 'grid',
}: SortableAdminPhotoCardProps) => {
  const { isPhotoSelected, selectedPhotoIds, isSortingMode, isSelectionMode } = useAdminPhotoSelection();
  const isSelected = isPhotoSelected(photo.id);
  const isPartOfSelection = selectedPhotoIds.size > 0 && isSelected;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: photo.id,
    data: {
      type: 'photo',
      photo,
    },
    disabled: !isSortingMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const longPressHandlers = useLongPress({
    onLongPress: () => handlePhotoLongPress(photo),
    onClick: () => handlePhotoClick(photo),
    delay: 500,
  });

  // Don't show individual photos that are part of a multi-selection during drag
  if (isDragging && isPartOfSelection && selectedPhotoIds.size > 1) {
    return null;
  }

  const isCompact = viewMode === 'compact';

  if (isCompact) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`relative group bg-white rounded-md overflow-hidden border-2 transition-all duration-200 cursor-pointer select-none ${
          isDragging ? 'opacity-50 scale-105 shadow-2xl z-50' :
          isSelected ? 'border-emerald-500' : 'border-transparent hover:border-gray-300'
        }`}
        {...attributes}
        {...longPressHandlers}
      >
        {isSortingMode && (
          <div
            {...listeners}
            className="absolute top-1 right-1 z-20 p-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-md cursor-grab active:cursor-grabbing touch-manipulation min-w-[48px] min-h-[48px] flex items-center justify-center"
            style={{ 
              touchAction: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              WebkitTouchCallout: 'none'
            }}
          >
            <GripVertical className="h-5 w-5 text-gray-700" />
          </div>
        )}
        <img
          src={photo.image_url}
          alt={photo.title}
          className="w-full h-auto aspect-[3/4] object-cover transition-transform duration-300 group-hover:scale-105"
          draggable={false}
        />
        <div className={`absolute inset-0 transition-colors duration-300 ${isSelected ? 'bg-emerald-500/20' : 'bg-transparent'}`} />
        <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5 bg-gradient-to-t from-black/50 to-transparent">
          <p className="text-xs font-medium text-white truncate">
            ₹{photo.price}
          </p>
        </div>
        {isSelectionMode && (
          <div className="absolute top-1 left-1">
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-200 ${
              isSelected 
                ? 'bg-emerald-500 border-emerald-500' 
                : 'bg-white/90 border-gray-400'
            }`}>
              {isSelected && <Check className="h-2 w-2 text-white" />}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all duration-300 select-none ${
        isDragging 
          ? 'opacity-50 scale-105 shadow-2xl z-50' 
          : isSelected
          ? 'border-emerald-500'
          : 'border-transparent hover:border-gray-300'
      }`}
      {...attributes}
      {...(!isSortingMode ? longPressHandlers : {})}
    >
      <div className="relative">
        {/* Drag Handle - Touch-friendly size */}
        {isSortingMode && (
          <div
            {...listeners}
            className="absolute top-2 right-2 z-10 p-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:bg-white transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            style={{ touchAction: 'none' }}
          >
            <GripVertical className="h-5 w-5 text-gray-600" />
          </div>
        )}

        <img
          src={photo.image_url}
          alt={photo.title}
          className="w-full h-56 sm:h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          draggable={false}
        />
        
        {/* Selection Overlay */}
        <div className={`absolute inset-0 transition-colors duration-300 ${isSelected ? 'bg-emerald-500/20' : 'bg-black/10'}`} />

        {/* Multi-selection indicator */}
        {isSelectionMode && (
          <div className="absolute top-2 left-2">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
              isSelected 
                ? 'bg-emerald-500 border-emerald-500' 
                : 'bg-white/90 border-gray-400'
            }`}>
              {isSelected && <Check className="h-3 w-3 text-white" />}
            </div>
          </div>
        )}

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 via-black/30 to-transparent px-3 py-2">
          <h3
            className={`font-semibold text-white text-base truncate drop-shadow-sm ${
              isSelected ? 'text-emerald-100' : ''
            }`}
            title={photo.title}
          >
            {photo.title}
          </h3>
          <p className="text-sm font-semibold text-white">
            ₹{photo.price}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SortableAdminPhotoCard;
