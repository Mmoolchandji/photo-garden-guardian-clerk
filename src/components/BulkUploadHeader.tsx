
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
    <CardHeader className="flex-shrink-0 p-3 sm:p-4">
      <div className="flex items-center justify-between">
        <CardTitle className="px-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
          {step === 'preview' 
            ? `Bulk Photo Upload (${fileCount} photos)` 
            : `Edit Photo Details (${currentIndex + 1} of ${fileCount})`
          }
        </CardTitle>
      </div>
    </CardHeader>
  );
};

export default BulkUploadHeader;
