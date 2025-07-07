import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Photo } from '@/types/photo';
import { useLongPress } from '@/hooks/useLongPress';
import { useAdminPhotoSelection } from '@/contexts/AdminPhotoSelectionContext';

interface SortableAdminPhotoCardProps {
  photo: Photo;
}

export const SortableAdminPhotoCard = ({ photo }: SortableAdminPhotoCardProps) => {
  const { isPhotoSelected, selectedPhotoIds } = useAdminPhotoSelection();
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
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Don't show individual photos that are part of a multi-selection during drag
  if (isDragging && isPartOfSelection && selectedPhotoIds.size > 1) {
    return null;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all duration-300 select-none ${
        isDragging 
          ? 'opacity-50 scale-105 shadow-2xl z-50' 
          : isSelected
          ? 'border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50 scale-[1.02]'
          : 'border-gray-200 hover:scale-[1.01] hover:shadow-lg'
      }`}
      {...attributes}
    >
      <div className="relative">
        {/* Drag Handle - Touch-friendly size */}
        <div
          {...listeners}
          className="absolute top-2 right-2 z-10 p-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:bg-white transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
          style={{ touchAction: 'none' }}
        >
          <GripVertical className="h-5 w-5 text-gray-600" />
        </div>

        <img
          src={photo.image_url}
          alt={photo.title}
          className="w-full h-56 sm:h-48 object-cover"
          draggable={false}
        />
        
        {/* Selection Overlay */}
        {isSelected && (
          <div className="absolute inset-0 bg-emerald-500/20 animate-fade-in" />
        )}

        {/* Multi-selection indicator */}
        {isPartOfSelection && selectedPhotoIds.size > 1 && (
          <div className="absolute top-2 left-2 bg-emerald-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
            {selectedPhotoIds.size}
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
        </div>
      </div>
    </div>
  );
};

export default SortableAdminPhotoCard;