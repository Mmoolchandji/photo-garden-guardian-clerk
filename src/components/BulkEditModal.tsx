import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PhotoEditForm from './PhotoEditForm';
import { Photo } from '@/types/photo';
import { ChevronLeft, ChevronRight, Save, X, SkipForward } from 'lucide-react';

interface BulkEditModalProps {
  open: boolean;
  photos: Photo[];
  onClose: (reloadAll?: boolean) => void; // reloadAll = refetch grid
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
      const { error } = await supabase
        .from('photos')
        .update(fields)
        .eq('id', currentPhoto.id);
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
    // Only allow next if saved or skipped for this photo, OR if no changes for this photo
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

  // Key event: block escape while dirty
  // Could add keydown-esc-block logic if needed

  // On modal close, reset state
  function onOpenChange(open: boolean) {
    if (!open) handleClose();
  }

  // Allow closing after last save
  const allFinished = currentStep === total - 1 &&
    (editStates[currentPhoto.id]?.saved || !formDirty);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0">
        <DialogHeader>
          <DialogTitle>
            Bulk Edit Photos
          </DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs text-gray-500">{progressStr}</span>
            <Button
              variant="ghost"
              className="ml-auto text-gray-500"
              onClick={() => handleClose()}
              disabled={saving}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <img
              src={currentPhoto.image_url}
              alt={currentPhoto.title}
              className="w-full h-40 object-cover rounded-lg mb-4"
            />
          </div>
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
        <div className="flex justify-between items-center px-6 pb-4 gap-2">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={saving || currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="secondary"
            onClick={handleSkip}
            disabled={saving}
          >
            <SkipForward className="h-4 w-4 mr-1" />
            Skip
          </Button>
          <Button
            onClick={handleNext}
            disabled={
              saving ||
              !!editStates[currentPhoto.id]?.fields && !editStates[currentPhoto.id]?.saved ||
              currentStep === total - 1
            }
            className="bg-gray-200 text-gray-700"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
          <Button
            onClick={() =>
              document.querySelector("form")?.dispatchEvent(
                new Event("submit", { cancelable: true, bubbles: true })
              )
            }
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            disabled={saving || !(formDirty)}
          >
            <Save className="h-4 w-4 mr-1" />
            Save & Continue
          </Button>
        </div>
        {allFinished && (
          <div className="px-6 pb-3">
            <Button
              className="w-full mt-2"
              onClick={() => onClose(anyEdited())}
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
