
import { useState } from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdminPhotoSelection } from '@/contexts/AdminPhotoSelectionContext';
import { useLongPress } from '@/hooks/useLongPress';
import { Photo } from '@/types/photo';
import BulkActionToolbar from './BulkActionToolbar';
import { usePhotoSorting } from '@/hooks/usePhotoSorting';
import SortableAdminPhotoCard from './SortableAdminPhotoCard';
import SortableDragOverlay from './SortableDragOverlay';

interface AdminPhotoGridProps {
  photos: Photo[];
  onPhotoEdit: (photo: Photo) => void;
  onPhotoDeleted: () => void;
}

const AdminPhotoGrid = ({ photos, onPhotoEdit, onPhotoDeleted }: AdminPhotoGridProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  const {
    isSelectionMode,
    isSortingMode,
    selectedPhotoIds,
    isPhotoSelected,
    togglePhoto,
    selectAll,
    clearSelection,
    getSelectedCount,
    enterSelectionMode,
    exitSelectionMode
  } = useAdminPhotoSelection();

  // Photo sorting functionality
  const {
    activePhoto,
    isUpdating,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    DndContext,
    DragOverlay,
    SortableContext,
    closestCenter,
    rectSortingStrategy,
  } = usePhotoSorting(photos, onPhotoDeleted, selectedPhotoIds, isPhotoSelected);

  const handleDelete = async (photo: Photo) => {
    if (!confirm(`Are you sure you want to delete "${photo.title}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(photo.id);

    try {
      // Delete from database first
      const { error: dbError } = await supabase
        .from('photos')
        .delete()
        .eq('id', photo.id);

      if (dbError) {
        throw dbError;
      }

      // Extract file path from URL and delete from storage
      const url = new URL(photo.image_url);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(-2).join('/'); // Get 'photos/filename.ext'

      const { error: storageError } = await supabase.storage
        .from('photos')
        .remove([filePath]);

      if (storageError) {
        console.warn('Storage deletion error:', storageError);
        // Don't throw here as the database deletion was successful
      }

      toast({
        title: "Photo deleted successfully!",
        description: "The photo has been removed from your gallery.",
      });

      onPhotoDeleted();
    } catch (error: unknown) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSelectAll = () => {
    if (selectedPhotoIds.size === photos.length) {
      clearSelection();
    } else {
      selectAll(photos);
    }
  };

  // Long press/tap to start selection mode and select, tap to toggle select/deselect
  const handlePhotoLongPress = (photo: Photo) => {
    if (!isSelectionMode) {
      enterSelectionMode();
      togglePhoto(photo);
    }
  };

  const handlePhotoClick = (photo: Photo) => {
    if (isSelectionMode) {
      togglePhoto(photo);
    }
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No photos yet</h3>
        <p className="text-gray-500">Start building your gallery by adding your first photo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selection Header - only show in selection mode, not sorting mode */}
      {!isSortingMode && (
        <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={photos.length > 0 && selectedPhotoIds.size === photos.length}
              onCheckedChange={handleSelectAll}
              className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
            />
            <label className="text-sm font-medium text-gray-700">
              Select All ({photos.length} photos)
            </label>
          </div>
        </div>
      )}

      {/* Sorting Mode Instructions */}
      {isSortingMode && (
        <div className="bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-lg">
          <p className="text-sm text-emerald-800">
            <strong>Reorder Mode:</strong> Drag and drop photos to rearrange them. 
            {selectedPhotoIds.size > 0 && ` Selected photos (${selectedPhotoIds.size}) will move together.`}
          </p>
        </div>
      )}

      {/* Photo Grid */}
      {isSortingMode ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext items={photos.map(p => p.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
              {photos.map((photo) => (
                <SortableAdminPhotoCard
                  key={photo.id}
                  photo={photo}
                />
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            <SortableDragOverlay photo={activePhoto} />
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
          {photos.map((photo) => (
            <AdminPhotoCard
              key={photo.id}
              photo={photo}
              onPhotoEdit={onPhotoEdit}
              onPhotoDeleted={onPhotoDeleted}
              deletingId={deletingId}
              handleDelete={handleDelete}
              handlePhotoLongPress={handlePhotoLongPress}
              handlePhotoClick={handlePhotoClick}
            />
          ))}
        </div>
      )}

      {/* Loading overlay during sort updates */}
      {isUpdating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600" />
            <span className="text-gray-700">Saving new order...</span>
          </div>
        </div>
      )}
    </div>
  );
};

interface AdminPhotoCardProps {
  photo: Photo;
  onPhotoEdit: (photo: Photo) => void;
  onPhotoDeleted: () => void;
  deletingId: string | null;
  handleDelete: (photo: Photo) => void;
  handlePhotoLongPress: (photo: Photo) => void;
  handlePhotoClick: (photo: Photo) => void;
}

const AdminPhotoCard = ({
  photo,
  onPhotoEdit,
  deletingId,
  handleDelete,
  handlePhotoLongPress,
  handlePhotoClick,
}: AdminPhotoCardProps) => {
  const { isPhotoSelected, isSelectionMode } = useAdminPhotoSelection();
  const isSelected = isPhotoSelected(photo.id);

  const longPressHandlers = useLongPress({
    onLongPress: () => handlePhotoLongPress(photo),
    onClick: () => handlePhotoClick(photo),
    delay: 500,
  });

  return (
    <div
      {...longPressHandlers}
      className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer select-none ${
        isSelected
          ? 'border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50 scale-[1.02]'
          : 'border-gray-200 hover:scale-[1.01]'
      }`}
      style={{ touchAction: 'manipulation' }}
    >
      <div className="relative">
        <img
          src={photo.image_url}
          alt={photo.title}
          className="w-full h-56 sm:h-48 object-cover"
          draggable={false}
        />
        {/* Overlay for selection */}
        {isSelected && (
          <div className="absolute inset-0 bg-emerald-500/20 animate-fade-in" />
        )}
        {/* Title overlay at bottom of image */}
        <div
          className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 via-black/30 to-transparent px-3 py-2"
          style={{ pointerEvents: 'none' }}
        >
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

export default AdminPhotoGrid;
