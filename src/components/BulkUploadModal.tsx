
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useBulkUploadLogic } from '@/hooks/useBulkUploadLogic';
import BulkUploadHeader from './BulkUploadHeader';
import BulkUploadContent from './BulkUploadContent';

interface BulkUploadModalProps {
  files: File[];
  onUploadComplete: () => void;
  onCancel: () => void;
  onChooseDifferentFiles: () => void;
}

const BulkUploadModal = ({ files, onUploadComplete, onCancel, onChooseDifferentFiles }: BulkUploadModalProps) => {
  const { user } = useAuth();
  const {
    step,
    setStep,
    currentIndex,
    filesWithMetadata,
    uploading,
    uploadProgress,
    uploadResults,
    handleUploadAll,
    handleMetadataChange,
    nextPhoto,
    prevPhoto,
  } = useBulkUploadLogic(files);

  // Ensure user is authenticated before proceeding
  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <div className="p-6 text-center">
          <p className="text-gray-600">Please sign in to upload photos.</p>
        </div>
      </Card>
    );
  }

  const handleCancel = () => {
    filesWithMetadata.forEach(fileData => URL.revokeObjectURL(fileData.preview));
    onCancel();
  };

  const handleUploadComplete = async () => {
    await handleUploadAll();
    if (uploadResults && uploadResults.success > 0) {
      setTimeout(() => {
        onUploadComplete();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl mx-auto max-h-[90vh] flex flex-col">
        <BulkUploadHeader
          step={step}
          fileCount={files.length}
          currentIndex={currentIndex}
          onCancel={handleCancel}
        />
        <BulkUploadContent
          step={step}
          filesWithMetadata={filesWithMetadata}
          currentIndex={currentIndex}
          uploading={uploading}
          uploadProgress={uploadProgress}
          uploadResults={uploadResults}
          onNextPhoto={nextPhoto}
          onPrevPhoto={prevPhoto}
          onSetStep={setStep}
          onUploadAll={handleUploadComplete}
          onChooseDifferentFiles={onChooseDifferentFiles}
          onMetadataChange={handleMetadataChange}
        />
      </Card>
    </div>
  );
};

export default BulkUploadModal;
