
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
}: BulkUploadContentProps) => {
  return (
    <CardContent className="flex-1 overflow-hidden p-6">
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
