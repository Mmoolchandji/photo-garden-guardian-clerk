import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
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
}

const AUTO_CLOSE_DELAY_SEC = 2;

const BulkUploadModal = ({
  files,
  onUploadComplete,
  onCancel,
  onChooseDifferentFiles,
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
  } = useBulkUploadLogic(files);

  const [hasHandledCompletion, setHasHandledCompletion] = useState(false);

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

  const cleanupPreviewURLs = () => {
    filesWithMetadata.forEach(fileData => URL.revokeObjectURL(fileData.preview));
  };

  const handleCancel = () => {
    cleanupPreviewURLs();
    onCancel();
  };

  // Start upload and handle completion logic.
  const handleUploadComplete = async () => {
    if (uploading) return; // Avoid double triggers
    await handleUploadAll();
    // handled in effect below
  };

  // Handle what to do after upload completes.
  useEffect(() => {
    if (uploadResults && !uploading && !hasHandledCompletion) {
      setHasHandledCompletion(true);

      // Auto-close immediately if all uploads succeeded
      if (uploadResults.failed.length === 0) {
        cleanupPreviewURLs();
        if (onUploadComplete) onUploadComplete();
      }
      // If failures, remain on the summary screen for manual review/exit
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadResults, uploading, hasHandledCompletion]);

  // Manual exit for the failed upload summary
  const handleManualExit = () => {
    cleanupPreviewURLs();
    if (onUploadComplete) onUploadComplete();
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
        {/* Show upload results, and manual exit, only when uploadResults exist */}
        {uploadResults && hasHandledCompletion ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <BulkUploadResults uploadResults={uploadResults} />
            {uploadResults.failed.length > 0 ? (
              <>
                <div className="text-center mt-4 text-gray-700 text-sm">
                  Some uploads failed.<br />
                  Please review the failed files and try again or exit.
                </div>
                <button
                  className="mt-4 px-4 py-2 rounded bg-emerald-600 text-white shadow transition hover:bg-emerald-700 text-sm"
                  type="button"
                  onClick={handleManualExit}
                >
                  Done
                </button>
              </>
            ) : (
              <div className="text-center mt-4 text-gray-700 text-sm font-semibold">
                Upload complete! Redirecting…
              </div>
            )}
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
            onChooseDifferentFiles={onChooseDifferentFiles}
            onMetadataChange={handleMetadataChange}
          />
        )}
      </Card>
    </div>
  );
};

export default BulkUploadModal;
