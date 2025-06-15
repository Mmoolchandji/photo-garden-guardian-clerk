
import { useState, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import PhotoEditForm from './PhotoEditForm';
import { Photo } from '@/types/photo';
import { useToast } from '@/components/ui/use-toast';
import BulkEditHeader from './BulkEditModalParts/BulkEditHeader';
import BulkEditImage from './BulkEditModalParts/BulkEditImage';
import BulkEditNavigation from './BulkEditModalParts/BulkEditNavigation';
import BulkEditDone from './BulkEditModalParts/BulkEditDone';

interface BulkEditModalProps {
  open: boolean;
  photos: Photo[];
  onClose: (reloadAll?: boolean) => void;
  onPhotosUpdated?: () => void;
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
export default function BulkEditModal({ open, photos, onClose, onPhotosUpdated }: BulkEditModalProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [editStates, setEditStates] = useState<EditState>({});
  const [saving, setSaving] = useState(false);
  const [anyDirty, setAnyDirty] = useState(false); // For exit warning
  const [formDirty, setFormDirty] = useState(false);
  const escBlockedRef = useRef<boolean>(false);

  const total = photos.length;
  const currentPhoto = photos[currentStep];
  const progressStr = `Photo ${currentStep + 1} of ${total}`;

  // Per step, track if fields are dirty (for warning)
  function handleDirtyChange(dirty: boolean) {
    setFormDirty(dirty);
    setAnyDirty(dirty || Object.values(editStates).some(e => !e.saved && !!e.fields));
  }

  // Navigation
  function goToStep(step: number) {
    setCurrentStep(Math.max(0, Math.min(step, total - 1)));
  }

  // Handle Save (validate via form, then update)
  async function handleSave(fields: Partial<Photo>) {
    setSaving(true);
    try {
      const { error } = await import('@/integrations/supabase/client').then(m => m.supabase)
        .then(supabase =>
          supabase.from('photos').update(fields).eq('id', currentPhoto.id)
        );
      if (error) throw error;

      setEditStates((prev) => ({
        ...prev,
        [currentPhoto.id]: { fields, saved: true }
      }));
      toast({
        title: "Photo updated successfully",
        description: `${progressStr} updated successfully.`,
      });
    } catch (err: any) {
      setEditStates((prev) => ({
        ...prev,
        [currentPhoto.id]: { ...prev[currentPhoto.id], saved: false, error: err?.message }
      }));
      toast({
        title: "Error updating photo",
        description: err?.message || "Something went wrong.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  }

  // Skip photo without saving
  function handleSkip() {
    setEditStates((prev) => ({
      ...prev,
      [currentPhoto.id]: { ...prev[currentPhoto.id], saved: false }
    }));
    goToStep(currentStep + 1);
    setFormDirty(false); // as if user discarded changes
  }

  // Confirm modal close. If there are unsaved changes, warn user
  function handleClose(force = false) {
    if (!force && (formDirty || anyDirty)) {
      escBlockedRef.current = true;
      if (confirm("You have unsaved changes. Are you sure you want to exit?")) {
        const hasEdits = anyEdited();
        onClose(true);
        if (hasEdits && onPhotosUpdated) {
          onPhotosUpdated();
        }
      }
      escBlockedRef.current = false;
    } else {
      const hasEdits = anyEdited();
      onClose(hasEdits);
      if (hasEdits && onPhotosUpdated) {
        onPhotosUpdated();
      }
    }
  }

  function anyEdited() {
    return Object.values(editStates).some(e => e.saved);
  }

  // Handle navigation with validation
  async function handleNext() {
    const state = editStates[currentPhoto.id];
    if (state?.fields && !state.saved) {
      alert("Please save or skip this photo before continuing.");
      return;
    }
    if (currentStep < total - 1) {
      goToStep(currentStep + 1);
    }
  }

  function handlePrev() {
    if (currentStep > 0) goToStep(currentStep - 1);
  }

  // On modal close, reset state
  function onOpenChange(open: boolean) {
    if (!open) handleClose();
  }

  const allFinished = currentStep === total - 1 &&
    (editStates[currentPhoto.id]?.saved || !formDirty);

  function handleDone() {
    const hasEdits = anyEdited();
    onClose(hasEdits);
    if (hasEdits && onPhotosUpdated) {
      onPhotosUpdated();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0">
        <BulkEditHeader
          progressStr={progressStr}
          saving={saving}
          onClose={handleClose}
        />
        <div className="p-6">
          <BulkEditImage photo={currentPhoto} />
          <PhotoEditForm
            key={currentPhoto.id}
            photo={currentPhoto}
            disabled={saving}
            onSubmit={async (fields) => {
              await handleSave(fields);
            }}
            onDirtyChange={handleDirtyChange}
            initialFocus
          />
        </div>
        <BulkEditNavigation
          currentStep={currentStep}
          total={total}
          saving={saving}
          formDirty={formDirty}
          editStates={editStates}
          currentPhoto={currentPhoto}
          onPrev={handlePrev}
          onSkip={handleSkip}
          onNext={handleNext}
        />
        {allFinished && (
          <BulkEditDone
            anyEdited={anyEdited()}
            onDone={handleDone}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
