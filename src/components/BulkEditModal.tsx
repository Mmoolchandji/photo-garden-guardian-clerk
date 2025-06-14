import { useState, useMemo, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Save, SkipBack, SkipForward, X } from 'lucide-react';
import PhotoEditForm from './PhotoEditForm';
import { useToast } from '@/components/ui/use-toast';

type Photo = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  created_at: string;
  user_id: string;
  legacy?: boolean;
  fabric?: string | null;
  price?: number | null;
  stock_status?: string | null;
};

interface BulkEditModalProps {
  open: boolean;
  photos: Photo[];
  onClose: () => void; // Closes modal
  onAllDone?: () => void; // Optional: called when all done/success
  onPhotoUpdated?: () => void; // Optional: reload parent grid
}

type PhotoEditState = {
  form: {
    title: string;
    description: string | null;
    fabric: string;
    price: string;
    stock_status: string;
  };
  dirty: boolean;
  saving: boolean;
  saved: boolean;
  error: string | null;
};

const getInitialForm = (p: Photo) => ({
  title: p.title,
  description: p.description ?? '',
  fabric: p.fabric ?? 'New Fabric',
  price: p.price !== undefined && p.price !== null ? String(p.price) : '',
  stock_status: p.stock_status ?? 'Available'
});

const BulkEditModal = ({
  open,
  photos,
  onClose,
  onAllDone,
  onPhotoUpdated,
}: BulkEditModalProps) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [states, setStates] = useState<PhotoEditState[]>(() =>
    photos.map((p) => ({
      form: getInitialForm(p),
      dirty: false,
      saving: false,
      saved: false,
      error: null,
    }))
  );
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const { toast } = useToast();

  // Keep in sync if number of photos changes
  const firstLoadRef = useRef(true);
  const prevPhotosJson = useRef(JSON.stringify(photos));
  if (JSON.stringify(photos) !== prevPhotosJson.current) {
    prevPhotosJson.current = JSON.stringify(photos);
    setStates(photos.map((p) => ({
      form: getInitialForm(p),
      dirty: false,
      saving: false,
      saved: false,
      error: null,
    })));
    setCurrentIdx(0);
  }

  // Numbered steps (e.g., "Photo 2 of 5")
  const total = photos.length;

  const currentState = states[currentIdx];
  const currentPhoto = photos[currentIdx];

  // See if any are dirty or incomplete
  const anyUnsaved = states.some((s) => s.dirty && !s.saved);

  // Navigation disable/enable
  const atFirst = currentIdx === 0;
  const atLast = currentIdx === total - 1;

  // Helper: Set current form value
  const setCurrentForm = (next: Partial<PhotoEditState["form"]>) => {
    setStates((prev) =>
      prev.map((s, idx) =>
        idx === currentIdx
          ? {
              ...s,
              form: { ...s.form, ...next },
              dirty: true,
              error: null,
            }
          : s
      )
    );
  };

  const setCurrentDirty = (dirty: boolean) => {
    setStates((prev) =>
      prev.map((s, idx) =>
        idx === currentIdx ? { ...s, dirty } : s
      )
    );
  };

  // Handler for field change from form
  const handleFieldChange = (name: keyof PhotoEditState["form"], value: string) => {
    setCurrentForm({ [name]: value });
  };

  // Save handler for current
  const handleSaveCurrent = async (autoAdvance: boolean) => {
    setStates(prev =>
      prev.map((s, idx) => idx === currentIdx ? { ...s, saving: true } : s)
    );

    const photo = photos[currentIdx];
    const s = states[currentIdx];
    // Validate minimal fields (title required, price valid number)
    if (!s.form.title.trim()) {
      setStates(prev =>
        prev.map((st, idx) =>
          idx === currentIdx
            ? { ...st, error: "Title is required.", saving: false }
            : st
        )
      );
      return;
    }
    if (s.form.price && isNaN(Number(s.form.price))) {
      setStates(prev =>
        prev.map((st, idx) =>
          idx === currentIdx
            ? { ...st, error: "Price must be a valid number.", saving: false }
            : st
        )
      );
      return;
    }
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const valuesToUpdate: Partial<Photo> = {
        title: s.form.title.trim(),
        description: s.form.description?.trim() || null,
        fabric: s.form.fabric || null,
        price: s.form.price ? Number(s.form.price) : null,
        stock_status: s.form.stock_status || null,
      };
      Object.keys(valuesToUpdate).forEach(key => {
        if (typeof (valuesToUpdate as any)[key] === 'undefined') {
          delete (valuesToUpdate as any)[key];
        }
      });

      const { error } = await supabase
        .from('photos')
        .update(valuesToUpdate)
        .eq('id', photo.id);

      if (error) throw error;

      setStates((prev) =>
        prev.map((st, idx) =>
          idx === currentIdx
            ? { ...st, dirty: false, saving: false, saved: true, error: null }
            : st
        )
      );
      toast({
        title: `Photo ${currentIdx + 1} of ${total} updated successfully`,
        variant: "default"
      });

      // Parent can reload list after each save
      onPhotoUpdated?.();
      if (autoAdvance && !atLast) {
        setCurrentIdx((i) => i + 1);
      }
    } catch (error: any) {
      setStates((prev) =>
        prev.map((st, idx) =>
          idx === currentIdx
            ? { ...st, saving: false, error: error.message || "Failed to update!" }
            : st
        )
      );
    }
  };

  // "Save and Continue" (save and move next if success)
  const handleSaveAndContinue = async () => {
    await handleSaveCurrent(true);
  };

  // "Save Changes" (save but stay here)
  const handleSave = async () => {
    await handleSaveCurrent(false);
  };

  // "Skip" (but only if no validation errors, warn if dirty)
  const handleSkip = () => {
    const cur = states[currentIdx];
    if (cur.dirty && !cur.saved) {
      if (!window.confirm("You have unsaved changes. Skip anyway?")) {
        return;
      }
    }
    if (!atLast) setCurrentIdx((i) => i + 1);
  };

  // Navigation
  const handlePrev = () => {
    if (!atFirst) setCurrentIdx((i) => i - 1);
  };

  const handleNext = () => {
    // Block moving fwd w/ error
    if (states[currentIdx]?.error) return;
    if (!atLast) setCurrentIdx((i) => i + 1);
  };

  // When closing: block if dirty
  const handleRequestClose = () => {
    if (anyUnsaved) {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  };

  // Modal overlay disables backdrop close if unsaved
  const handleReallyClose = () => {
    setShowExitConfirm(false);
    onClose();
  };
  const handleCancelExit = () => {
    setShowExitConfirm(false);
  };

  // When finished, onAllDone callback and close modal.
  const handleFinishAll = () => {
    onAllDone?.();
    onClose();
  };

  // Done summary
  const allSaved = states.every((s) => s.saved || !s.dirty);
  const hasAny = photos.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleRequestClose}>
      <DialogContent className="max-w-2xl sm:max-w-3xl">
        <div className="relative space-y-6">
          <button
            className="absolute top-4 right-4 p-2 rounded hover:bg-gray-100 transition"
            onClick={handleRequestClose}
            tabIndex={-1}
            aria-label="Close"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="text-lg font-bold mb-2 text-center">
            Bulk Edit Photos
          </div>
          {hasAny && !allSaved ? (
            <>
              <div className="flex items-center justify-center space-x-4 text-xs mb-2">
                <span className="font-semibold">Photo {currentIdx + 1} of {total}</span>
                {states[currentIdx]?.saved && (
                  <span className="text-emerald-600 font-medium">Saved</span>
                )}
                {states[currentIdx]?.error && (
                  <span className="text-red-600 font-medium">{states[currentIdx].error}</span>
                )}
              </div>
              <PhotoEditForm
                values={currentState.form}
                disabled={states[currentIdx]?.saving}
                onChange={handleFieldChange}
                showErrors={!!currentState.error}
              />
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={atFirst}
                  type="button"
                >
                  <SkipBack className="h-4 w-4 mr-1" /> Previous
                </Button>
                <Button
                  onClick={handleSkip}
                  disabled={atLast}
                  type="button"
                  variant="ghost"
                >
                  Skip
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!currentState.dirty || currentState.saving}
                  type="button"
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Save className="h-4 w-4 mr-2" /> Save Changes
                </Button>
                <Button
                  onClick={handleSaveAndContinue}
                  disabled={!currentState.dirty || currentState.saving || atLast}
                  type="button"
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Save className="h-4 w-4 mr-2" /> Save & Continue
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNext}
                  disabled={atLast}
                  type="button"
                >
                  <SkipForward className="h-4 w-4 mr-1" />
                  Next
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 space-y-4">
              <div className="text-lg font-semibold">All selected photos have been processed!</div>
              <div>
                {states.filter(s => s.saved).length} out of {total} updated successfully.
              </div>
              <Button onClick={handleFinishAll}>Close</Button>
            </div>
          )}

          {/* Exit warning modal overlay */}
          {showExitConfirm && (
            <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
              <div className="bg-white shadow-lg rounded-lg border p-8 max-w-xs text-center">
                <div className="text-lg font-semibold mb-3">Unsaved changes</div>
                <div className="mb-4 text-sm text-gray-700">
                  You have unsaved changes in one or more photos.<br />Are you sure you want to exit?
                </div>
                <div className="flex justify-center space-x-3">
                  <Button variant="outline" onClick={handleCancelExit}>Cancel</Button>
                  <Button className="bg-red-600 hover:bg-red-700" onClick={handleReallyClose}>
                    Exit Without Saving
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkEditModal;
