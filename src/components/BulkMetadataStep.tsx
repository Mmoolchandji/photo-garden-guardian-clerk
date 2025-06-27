
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
  sessionCustomFabrics?: string[];
  uploading: boolean;
  uploadProgress: number;
  uploadResults: { success: number; failed: string[] } | null;
  onMetadataChange: (field: 'title' | 'description' | 'fabric' | 'price' | 'stockStatus', value: string) => void;
  onAddCustomFabric?: (fabricName: string) => void;
  onNextPhoto: () => void;
  onPrevPhoto: () => void;
  onUploadAll: () => void;
  onSetStep: (step: 'preview') => void;
}

const BulkMetadataStep = ({
  filesWithMetadata,
  currentIndex,
  sessionCustomFabrics = [],
  uploading,
  uploadProgress,
  uploadResults,
  onMetadataChange,
  onAddCustomFabric,
  onNextPhoto,
  onPrevPhoto,
  onUploadAll,
  onSetStep
}: BulkMetadataStepProps) => {
  const currentFile = filesWithMetadata[currentIndex];

  if (!currentFile) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Upload Progress and Results - Fixed at top */}
      <div className="flex-shrink-0">
        <BulkUploadProgress uploading={uploading} uploadProgress={uploadProgress} />
        <BulkUploadResults uploadResults={uploadResults} />
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="px-1 pb-6">
            <BulkMetadataForm
              currentFile={currentFile}
              availableCustomFabrics={sessionCustomFabrics}
              onMetadataChange={onMetadataChange}
              onAddCustomFabric={onAddCustomFabric}
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
