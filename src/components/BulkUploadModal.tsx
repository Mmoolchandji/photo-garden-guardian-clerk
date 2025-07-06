import { useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useBulkUploadLogic } from '@/hooks/useBulkUploadLogic';
import BulkUploadHeader from './BulkUploadHeader';
import BulkUploadContent from './BulkUploadContent';
import BulkUploadResults from './BulkUploadResults';

interface BulkUploadModalProps {
  files: File[];
  onUploadComplete: () => void;
  onCancel: () => void;
  onChooseDifferentFiles: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const BulkUploadModal = ({
  files,
  onUploadComplete,
  onCancel,
  onChooseDifferentFiles,
  isOpen,
  onClose,
}: BulkUploadModalProps) => {
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
    removeFile,
  } = useBulkUploadLogic(files);

  const [hasHandledCompletion, setHasHandledCompletion] = useState(false);

  const cleanupPreviewURLs = useCallback(() => {
    filesWithMetadata.forEach((fileData) => {
      if (fileData.preview) {
        URL.revokeObjectURL(fileData.preview);
      }
    });
  }, [filesWithMetadata]);

  const handleExit = useCallback(() => {
    cleanupPreviewURLs();
    onUploadComplete?.();
    onClose();
  }, [cleanupPreviewURLs, onUploadComplete, onClose]);

  useEffect(() => {
    if (isOpen && !hasHandledCompletion && uploadResults && !uploading) {
      const allSuccessful =
        uploadResults.failed.length === 0 && uploadResults.success > 0;

      if (allSuccessful) {
        handleExit();
      } else {
        setHasHandledCompletion(true);
      }
    }
  }, [
    isOpen,
    uploadResults,
    uploading,
    hasHandledCompletion,
    handleExit,
  ]);

  if (!isOpen) {
    return null;
  }

  const handleCancel = () => {
    cleanupPreviewURLs();
    onCancel();
    onClose();
  };

  // Start upload and handle completion logic.
  const handleUploadComplete = async () => {
    if (uploading) return; // Avoid double triggers
    await handleUploadAll();
    // handled in effect below
  };

  const handleManualExit = () => {
    handleExit();
  };

  // Helper: determine type of failure (all, some, none)
  const allFailed = uploadResults && 
    uploadResults.success === 0 &&
    uploadResults.failed.length === files.length;

  // Helper: render error/success summary messaging
  const renderSummaryMessage = () => {
    if (!uploadResults) return null;
    if (allFailed) {
      return (
        <div className="text-center mt-4 text-red-600 text-sm font-semibold">
          All uploads failed.<br />
          Please check your connection and try again.<br />
        </div>
      );
    }
    if (uploadResults.failed.length > 0) {
      return (
        <div className="text-center mt-4 text-gray-700 text-sm">
          Some uploads failed.<br />
          Please review the failed files below, then retry or exit.<br />
        </div>
      );
    }
    return (
      <div className="text-center mt-4 text-gray-700 text-sm font-semibold">
        Upload complete! Redirecting…
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="max-w-4xl w-full max-h-[95vh] flex flex-col p-0">
        <BulkUploadHeader
          step={step}
          fileCount={files.length}
          currentIndex={currentIndex}
          onCancel={handleCancel}
        />
        <div className="flex-1 overflow-y-auto p-6">
          {uploadResults && hasHandledCompletion ? (
            <div className="flex flex-col items-center justify-center text-center">
              <BulkUploadResults uploadResults={uploadResults} />
              {renderSummaryMessage()}
              <Button
                className="mt-6"
                variant="default"
                onClick={handleManualExit}
                data-testid="bulk-upload-modal-done"
              >
                Done
              </Button>
            </div>
          ) : (
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
              onChooseDifferentFiles={() => {
                cleanupPreviewURLs();
                onChooseDifferentFiles();
              }}
              onMetadataChange={handleMetadataChange}
              onRemoveFile={removeFile}
              isModal={true}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkUploadModal;
