
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Save, SkipForward } from 'lucide-react';
import { Photo } from '@/types/photo';

type EditState = {
  [photoId: string]: {
    fields?: Partial<Photo>;
    saved: boolean;
    error?: string;
  };
};

type Props = {
  currentStep: number;
  total: number;
  saving: boolean;
  formDirty: boolean;
  editStates: EditState;
  currentPhoto: Photo;
  onPrev: () => void;
  onSkip: () => void;
  onNext: () => void;
};

export default function BulkEditNavigation({
  currentStep,
  total,
  saving,
  formDirty,
  editStates,
  currentPhoto,
  onPrev,
  onSkip,
  onNext
}: Props) {
  return (
    <div className="flex justify-between items-center p-4 border-t">
      <div>
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={saving || currentStep === 0}
        >
          <ChevronLeft className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Previous</span>
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          onClick={onSkip}
          disabled={saving}
        >
          <SkipForward className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Skip</span>
        </Button>
        <Button
          onClick={onNext}
          disabled={
            saving ||
            (!!editStates[currentPhoto.id]?.fields && !editStates[currentPhoto.id]?.saved) ||
            currentStep === total - 1
          }
        >
          <span className="hidden md:inline">Next</span>
          <ChevronRight className="h-4 w-4 md:ml-2" />
        </Button>
        <Button
          onClick={() =>
            document.querySelector("form")?.dispatchEvent(
              new Event("submit", { cancelable: true, bubbles: true })
            )
          }
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          disabled={saving || !formDirty}
        >
          <Save className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Save & Continue</span>
          <span className="md:hidden">Save</span>
        </Button>
      </div>
    </div>
  );
}
