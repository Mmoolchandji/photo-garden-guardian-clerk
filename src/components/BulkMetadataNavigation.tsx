
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BulkMetadataNavigationProps {
  currentIndex: number;
  totalFiles: number;
  onNextPhoto: () => void;
  onPrevPhoto: () => void;
}

const BulkMetadataNavigation = ({
  currentIndex,
  totalFiles,
  onNextPhoto,
  onPrevPhoto
}: BulkMetadataNavigationProps) => {
  return (
    <div className="flex justify-between items-center">
      <Button
        variant="outline"
        onClick={onPrevPhoto}
        disabled={currentIndex === 0}
        size="sm"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>
      
      <span className="text-sm text-gray-600">
        {currentIndex + 1} of {totalFiles}
      </span>
      
      <Button
        variant="outline"
        onClick={onNextPhoto}
        disabled={currentIndex === totalFiles - 1}
        size="sm"
      >
        Next
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};

export default BulkMetadataNavigation;
