
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
  currentStep: number;
  total: number;
  saving: boolean;
  onPrev: () => void;
  onNext: () => void;
  isLastStep: boolean;
  onDone: () => void;
};

export default function BulkEditNavigation({
  currentStep,
  saving,
  onPrev,
  onNext,
  isLastStep,
  onDone,
}: Props) {
  return (
    <div className="flex justify-between items-center p-4 border-t">
      <Button
        variant="outline"
        onClick={onPrev}
        disabled={saving || currentStep === 0}
        className={currentStep === 0 ? 'invisible' : ''}
      >
        <ChevronLeft className="h-4 w-4 md:mr-2" />
        <span className="hidden md:inline">Previous</span>
      </Button>
      <Button
        onClick={isLastStep ? onDone : onNext}
        disabled={saving}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
      >
        {isLastStep ? (
          'Done'
        ) : (
          <>
            <span className="hidden md:inline">Next</span>
            <ChevronRight className="h-4 w-4 md:ml-2" />
          </>
        )}
      </Button>
    </div>
  );
}
