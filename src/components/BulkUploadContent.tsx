
import { CardContent } from '@/components/ui/card';
import BulkPreviewStep from './BulkPreviewStep';
import BulkMetadataStep from './BulkMetadataStep';

interface FileWithMetadata {
  file: File;
  preview: string;
  title: string;
  description: string;
  fabric: string;
  price: string;
  stockStatus: string;
}

interface BulkUploadContentProps {
  step: 'preview' | 'metadata';
  filesWithMetadata: FileWithMetadata[];
  currentIndex: number;
  uploading: boolean;
  uploadProgress: number;
  uploadResults: { success: number; failed: string[] } | null;
  onNextPhoto: () => void;
  onPrevPhoto: () => void;
  onSetStep: (step: 'preview' | 'metadata') => void;
  onUploadAll: () => void;
  onChooseDifferentFiles: () => void;
  onMetadataChange: (field: 'title' | 'description' | 'fabric' | 'price' | 'stockStatus', value: string) => void;
  onRemoveFile: (index: number) => void;
  isModal?: boolean; // Optional prop to indicate if this is being used in a modal
}

const BulkUploadContent = ({
  step,
  filesWithMetadata,
  currentIndex,
  uploading,
  uploadProgress,
  uploadResults,
  onNextPhoto,
  onPrevPhoto,
  onSetStep,
  onUploadAll,
  onChooseDifferentFiles,
  onMetadataChange,
  onRemoveFile,
  isModal = true, // Default to true for backward compatibility
}: BulkUploadContentProps) => {
  // Different styling based on whether we're in a modal or in-page view
  return (
    <CardContent className={`flex-1 overflow-hidden p-4 md:p-6 ${isModal ? '' : ' md:max-h-none'}`}>
      {step === 'preview' ? (
        <BulkPreviewStep
          filesWithMetadata={filesWithMetadata}
          currentIndex={currentIndex}
          uploading={uploading}
          uploadProgress={uploadProgress}
          uploadResults={uploadResults}
          onNextPhoto={onNextPhoto}
          onPrevPhoto={onPrevPhoto}
          onSetStep={onSetStep}
          onUploadAll={onUploadAll}
          onChooseDifferentFiles={onChooseDifferentFiles}
          onRemoveFile={onRemoveFile}
        />
      ) : (
        <BulkMetadataStep
          filesWithMetadata={filesWithMetadata}
          currentIndex={currentIndex}
          uploading={uploading}
          uploadProgress={uploadProgress}
          uploadResults={uploadResults}
          onMetadataChange={onMetadataChange}
          onNextPhoto={onNextPhoto}
          onPrevPhoto={onPrevPhoto}
          onUploadAll={onUploadAll}
          onSetStep={onSetStep}
        />
      )}
    </CardContent>
  );
};

export default BulkUploadContent;
