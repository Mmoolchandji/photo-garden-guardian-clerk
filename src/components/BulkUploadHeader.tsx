
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';

interface BulkUploadHeaderProps {
  step: 'preview' | 'metadata';
  fileCount: number;
  currentIndex: number;
  onCancel: () => void;
}

const BulkUploadHeader = ({ step, fileCount, currentIndex, onCancel }: BulkUploadHeaderProps) => {
  return (
    <CardHeader className="flex-shrink-0">
      <div className="flex items-center justify-between">
        <CardTitle>
          {step === 'preview' 
            ? `Bulk Photo Upload (${fileCount} photos)` 
            : `Edit Photo Details (${currentIndex + 1} of ${fileCount})`
          }
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
  );
};

export default BulkUploadHeader;
