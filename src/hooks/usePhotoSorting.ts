import { useState, useCallback } from 'react';
import { Photo } from '@/types/photo';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { 
  DndContext, 
  DragEndEvent, 
  DragStartEvent,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

export const usePhotoSorting = (
  photos: Photo[], 
  onPhotosReordered: () => void,
  selectedPhotoIds: Set<string>,
  isPhotoSelected: (id: string) => boolean,
  viewMode: 'grid' | 'compact' = 'grid'
) => {
  const [activePhoto, setActivePhoto] = useState<Photo | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const isCompact = viewMode === 'compact';

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: isCompact ? 4 : 8,
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: isCompact ? 150 : 200,
        tolerance: isCompact ? 6 : 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const photo = photos.find(p => p.id === event.active.id);
    setActivePhoto(photo || null);
  }, [photos]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActivePhoto(null);

    if (!over || active.id === over.id) {
      return;
    }

    const activePhoto = photos.find(p => p.id === active.id);
    if (!activePhoto) return;

    const isActiveSelected = isPhotoSelected(activePhoto.id);
    const photosToMove = isActiveSelected && selectedPhotoIds.size > 1
      ? photos.filter(p => isPhotoSelected(p.id))
      : [activePhoto];

    const oldIndex = photos.findIndex(photo => photo.id === active.id);
    const newIndex = photos.findIndex(photo => photo.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Handle group movement
    let reorderedPhotos = [...photos];
    
    if (photosToMove.length > 1) {
      // Remove all selected photos from their current positions
      const nonSelectedPhotos = photos.filter(p => !isPhotoSelected(p.id));
      
      // Insert the group at the new position
      const insertIndex = Math.min(newIndex, nonSelectedPhotos.length);
      reorderedPhotos = [
        ...nonSelectedPhotos.slice(0, insertIndex),
        ...photosToMove,
        ...nonSelectedPhotos.slice(insertIndex),
      ];
    } else {
      // Single photo movement
      reorderedPhotos = arrayMove(photos, oldIndex, newIndex);
    }
    
    // Update sort orders in database
    setIsUpdating(true);
    try {
      const updates = reorderedPhotos.map((photo, index) => ({
        id: photo.id,
        sort_order: index + 1,
      }));

      // Batch update all photos with new sort orders
      for (const update of updates) {
        const { error } = await supabase
          .from('photos')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);

        if (error) throw error;
      }

      const count = photosToMove.length;
      toast({
        title: "Photos reordered",
        description: `${count} photo${count > 1 ? 's' : ''} reordered successfully.`,
      });

      onPhotosReordered();
    } catch (error) {
      console.error('Error updating photo order:', error);
      toast({
        title: "Error",
        description: "Failed to save photo order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  }, [photos, onPhotosReordered, toast, selectedPhotoIds, isPhotoSelected]);

  const handleDragCancel = useCallback(() => {
    setActivePhoto(null);
  }, []);

  return {
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
  };
};
