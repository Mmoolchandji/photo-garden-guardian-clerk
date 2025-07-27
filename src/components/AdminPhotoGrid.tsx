
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
import AdminPhotoGridView from './admin/AdminPhotoGridView';
import { useViewMode } from '@/contexts/ViewModeContext';

interface AdminPhotoGridProps {
  photos: Photo[];
  onPhotoEdit: (photo: Photo) => void;
  onPhotoDeleted: () => void;
}

const AdminPhotoGrid = ({ photos, onPhotoEdit, onPhotoDeleted }: AdminPhotoGridProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { viewMode } = useViewMode();
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

  // If not in sorting mode, use the view mode switcher
  if (!isSortingMode) {
    return (
      <div className="space-y-4">
        {/* Selection Header */}
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

        <AdminPhotoGridView
          photos={photos}
          viewMode={viewMode}
          onPhotoEdit={onPhotoEdit}
          onPhotoDeleted={onPhotoDeleted}
        />
      </div>
    );
  }

  // Sorting mode - always use grid layout with drag and drop
  return (
    <div className="space-y-4">
      {/* Sorting Mode Instructions */}
      <div className="bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-lg">
        <p className="text-sm text-emerald-800">
          <strong>Reorder Mode:</strong> Drag and drop photos to rearrange them. 
          {selectedPhotoIds.size > 0 && ` Selected photos (${selectedPhotoIds.size}) will move together.`}
        </p>
      </div>

      {/* Photo Grid */}
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
                onPhotoEdit={onPhotoEdit}
                onPhotoDeleted={onPhotoDeleted}
                deletingId={deletingId}
                handleDelete={handleDelete}
                handlePhotoLongPress={handlePhotoLongPress}
                handlePhotoClick={handlePhotoClick}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activePhoto && <SortableDragOverlay photo={activePhoto} />}
        </DragOverlay>
      </DndContext>

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


export default AdminPhotoGrid;
