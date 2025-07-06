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
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export const usePhotoSorting = (photos: Photo[], onPhotosReordered: () => void) => {
  const [activePhoto, setActivePhoto] = useState<Photo | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
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

    const oldIndex = photos.findIndex(photo => photo.id === active.id);
    const newIndex = photos.findIndex(photo => photo.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reorderedPhotos = arrayMove(photos, oldIndex, newIndex);
    
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

      toast({
        title: "Photos reordered",
        description: "Your photo order has been saved successfully.",
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
  }, [photos, onPhotosReordered, toast]);

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
    verticalListSortingStrategy,
  };
};