import React from 'react';
import { Photo } from '@/types/photo';
import { useAdminPhotoSelection } from '@/contexts/AdminPhotoSelectionContext';

interface SortableDragOverlayProps {
  photo: Photo | null;
}

export const SortableDragOverlay = ({ photo }: SortableDragOverlayProps) => {
  const { selectedPhotoIds, isPhotoSelected } = useAdminPhotoSelection();

  if (!photo) return null;

  const isPartOfSelection = selectedPhotoIds.size > 0 && isPhotoSelected(photo.id);
  const multiSelectCount = selectedPhotoIds.size;

  return (
    <div className="bg-white rounded-xl shadow-2xl border-2 border-emerald-500 overflow-hidden rotate-6 scale-110 opacity-95">
      <div className="relative">
        <img
          src={photo.image_url}
          alt={photo.title}
          className="w-48 h-48 object-cover"
          draggable={false}
        />
        
        {/* Multi-selection overlay */}
        {isPartOfSelection && multiSelectCount > 1 && (
          <>
            <div className="absolute inset-0 bg-emerald-500/30" />
            <div className="absolute top-2 left-2 bg-emerald-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
              {multiSelectCount} photos
            </div>
          </>
        )}

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 py-2">
          <h3 className="font-semibold text-white text-sm truncate drop-shadow-sm">
            {isPartOfSelection && multiSelectCount > 1 
              ? `${multiSelectCount} selected photos`
              : photo.title
            }
          </h3>
        </div>
      </div>
    </div>
  );
};

export default SortableDragOverlay;