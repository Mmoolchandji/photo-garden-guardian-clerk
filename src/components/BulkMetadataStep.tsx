
import { ScrollArea } from '@/components/ui/scroll-area';
import BulkUploadProgress from './BulkUploadProgress';
import BulkUploadResults from './BulkUploadResults';
import BulkMetadataForm from './BulkMetadataForm';
import BulkMetadataNavigation from './BulkMetadataNavigation';
import BulkMetadataActions from './BulkMetadataActions';

interface FileWithMetadata {
  file: File;
  preview: string;
  title: string;
  description: string;
  fabric: string;
  price: string;
  stockStatus: string;
}

interface BulkMetadataStepProps {
  filesWithMetadata: FileWithMetadata[];
  currentIndex: number;
  uploading: boolean;
  uploadProgress: number;
  uploadResults: { success: number; failed: string[] } | null;
  onMetadataChange: (field: 'title' | 'description' | 'fabric' | 'price' | 'stockStatus', value: string) => void;
  onNextPhoto: () => void;
  onPrevPhoto: () => void;
  onUploadAll: () => void;
  onSetStep: (step: 'preview') => void;
}

const BulkMetadataStep = ({
  filesWithMetadata,
  currentIndex,
  uploading,
  uploadProgress,
  uploadResults,
  onMetadataChange,
  onNextPhoto,
  onPrevPhoto,
  onUploadAll,
  onSetStep
}: BulkMetadataStepProps) => {
  const currentFile = filesWithMetadata[currentIndex];

  if (!currentFile) return null;

  return (
    <div className="flex flex-col h-full max-h-[calc(90vh-120px)]">
      {/* Upload Progress and Results - Fixed at top */}
      <div className="flex-shrink-0 space-y-4 mb-4">
        <BulkUploadProgress uploading={uploading} uploadProgress={uploadProgress} />
        <BulkUploadResults uploadResults={uploadResults} />
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="pr-4 pb-6">
            <BulkMetadataForm
              currentFile={currentFile}
              onMetadataChange={onMetadataChange}
            />
          </div>
        </ScrollArea>
      </div>

      {/* Navigation and Action Buttons - Fixed at bottom */}
      <div className="flex-shrink-0 pt-4 space-y-4 border-t bg-white">
        {/* Navigation */}
        <BulkMetadataNavigation
          currentIndex={currentIndex}
          totalFiles={filesWithMetadata.length}
          onNextPhoto={onNextPhoto}
          onPrevPhoto={onPrevPhoto}
        />

        {/* Action Buttons */}
        <BulkMetadataActions
          uploading={uploading}
          onUploadAll={onUploadAll}
          onSetStep={onSetStep}
        />
      </div>
    </div>
  );
};

export default BulkMetadataStep;
