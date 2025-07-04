
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import PhotoEditForm from './PhotoEditForm';
import { Photo } from '@/types/photo';
import { useToast } from '@/components/ui/use-toast';
import BulkEditHeader from './BulkEditModalParts/BulkEditHeader';
import BulkEditImage from './BulkEditModalParts/BulkEditImage';
import BulkEditNavigation from './BulkEditModalParts/BulkEditNavigation';

interface BulkEditModalProps {
  open: boolean;
  photos: Photo[];
  onClose: (reloadAll?: boolean) => void;
  onPhotoUpdated?: () => void;
}

type EditState = {
  [photoId: string]: {
    fields?: Partial<Photo>;
    saved: boolean;
    error?: string;
  };
};

/**
 * Modal for step-by-step (carousel style) multi-photo editing.
 * Refactored into separate subcomponents for maintainability.
 */
export default function BulkEditModal({ open, photos: initialPhotos, onClose, onPhotoUpdated }: BulkEditModalProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [editStates, setEditStates] = useState<EditState>({});
  const [saving, setSaving] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  const [photos, setPhotos] = useState(initialPhotos);
  const escBlockedRef = useRef<boolean>(false);

  useEffect(() => {
    setPhotos(initialPhotos);
  }, [initialPhotos]);

  const total = photos.length;
  const currentPhoto = photos[currentStep];
  const progressStr = `Photo ${currentStep + 1} of ${total}`;

  function handleDirtyChange(dirty: boolean) {
    setFormDirty(dirty);
  }

  // Navigation
  function goToStep(step: number) {
    setCurrentStep(Math.max(0, Math.min(step, total - 1)));
  }

  // Handle Save (validate via form, then update)
  async function handleSave(fields: Partial<Photo>) {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('photos')
        .update(fields)
        .eq('id', currentPhoto.id);

      if (error) throw error;

      setPhotos(currentPhotos =>
        currentPhotos.map(p =>
          p.id === currentPhoto.id ? { ...p, ...fields } : p
        )
      );

      setEditStates(prev => ({
        ...prev,
        [currentPhoto.id]: { fields, saved: true },
      }));
      setFormDirty(false); // Reset dirty state after successful save
      
      // Call the refetch function to update the UI immediately
      if (onPhotoUpdated) {
        onPhotoUpdated();
      }
      
      toast({
        title: 'Photo updated successfully',
        description: `${progressStr} updated successfully.`,
      });
      return true; // Indicate success
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setEditStates((prev) => ({
        ...prev,
        [currentPhoto.id]: { ...prev[currentPhoto.id], saved: false, error: errorMessage }
      }));
      toast({
        title: "Error updating photo",
        description: errorMessage,
        variant: 'destructive',
      });
      return false; // Indicate failure
    } finally {
      setSaving(false);
    }
  }

  // Confirm modal close. If there are unsaved changes, warn user
  function handleClose(force = false) {
    const isAnyEdited = anyEdited();
    if (!force && formDirty) {
      escBlockedRef.current = true;
      if (confirm('You have unsaved changes. Are you sure you want to exit?')) {
        onClose(isAnyEdited);
      }
      escBlockedRef.current = false;
    } else {
      onClose(isAnyEdited);
    }
  }

  function anyEdited() {
    return Object.values(editStates).some(e => e.saved);
  }

  const formRef = useRef<{ submit: () => void }>(null);

  async function handleNavigation(direction: 'next' | 'prev') {
    if (formDirty) {
      // Directly call the submit handler of the form
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }

    if (direction === 'next' && currentStep < total - 1) {
      goToStep(currentStep + 1);
    } else if (direction === 'prev' && currentStep > 0) {
      goToStep(currentStep - 1);
    }
  }

  async function handleDone() {
    if (formDirty) {
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }
    // Always call onPhotoUpdated when closing to ensure the grid is refreshed
    if (onPhotoUpdated && anyEdited()) {
      onPhotoUpdated();
    }
    onClose(anyEdited());
  }

  function onOpenChange(open: boolean) {
    if (!open) handleClose();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full h-full max-h-full md:h-auto md:max-h-[90vh] p-0 flex flex-col">
        <BulkEditHeader
          progressStr={progressStr}
          saving={saving}
          onClose={handleClose}
        />
        <div className="flex-grow overflow-y-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="order-last md:order-first">
            <PhotoEditForm
              key={currentPhoto.id}
              photo={currentPhoto}
              disabled={saving}
              onSubmit={handleSave}
              onDirtyChange={handleDirtyChange}
              initialFocus
            />
          </div>
          <BulkEditImage photo={currentPhoto} />
        </div>
        <div className="flex-shrink-0">
          <BulkEditNavigation
            currentStep={currentStep}
            total={total}
            saving={saving}
            onPrev={() => handleNavigation('prev')}
            onNext={() => handleNavigation('next')}
            isLastStep={currentStep === total - 1}
            onDone={handleDone}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
