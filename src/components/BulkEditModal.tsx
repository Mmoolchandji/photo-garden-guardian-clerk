
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
export default function BulkEditModal({ open, photos, onClose }: BulkEditModalProps) {
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setEditStates((prev) => ({
        ...prev,
        [currentPhoto.id]: { ...prev[currentPhoto.id], saved: false, error: errorMessage }
      }));
      toast({
        title: "Error updating photo",
        description: errorMessage,
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
        onClose(true);
      }
      escBlockedRef.current = false;
    } else {
      onClose(anyEdited());
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
              onSubmit={async (fields) => {
                await handleSave(fields);
              }}
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
            formDirty={formDirty}
            editStates={editStates}
            currentPhoto={currentPhoto}
            onPrev={handlePrev}
            onSkip={handleSkip}
            onNext={handleNext}
          />
        </div>
        {allFinished && (
          <BulkEditDone
            anyEdited={anyEdited()}
            onDone={() => onClose(anyEdited())}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
