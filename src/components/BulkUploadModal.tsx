
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
  const [countdown, setCountdown] = useState(AUTO_CLOSE_DELAY_SEC);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

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
    // (auto-exit is handled by useEffect below)
  };

  // Auto-close modal after uploads when all done
  useEffect(() => {
    // Only run when uploads are done and results exist, and haven't handled yet
    if (
      uploadResults &&
      !uploading &&
      !hasHandledCompletion
    ) {
      setHasHandledCompletion(true);
      setCountdown(AUTO_CLOSE_DELAY_SEC);
      // start countdown
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current as NodeJS.Timeout);
            // Ensure the state reflects up-to-date preview URLs
            cleanupPreviewURLs();
            onUploadComplete?.(); // triggers parent to close & refresh
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    // Cleanup timer if modal unmounts/reruns
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadResults, uploading, hasHandledCompletion]); // omit onUploadComplete cleanupPreviewURLs from deps on purpose

  // Allow early manual close by user during countdown
  const handleManualExit = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    cleanupPreviewURLs();
    onUploadComplete?.();
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
        {/* Show upload results, and exit/auto-close info, when upload is complete */}
        {uploadResults && hasHandledCompletion ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <BulkUploadResults uploadResults={uploadResults} />
            <div className="text-center mt-4 text-gray-700 text-sm">
              Upload complete!<br />
              Returning to dashboard in{' '}
              <span className="font-bold">{countdown}</span>
              {countdown === 1 ? ' second' : ' seconds'}...
            </div>
            <button
              className="mt-4 px-4 py-2 rounded bg-emerald-600 text-white shadow transition hover:bg-emerald-700 text-sm"
              type="button"
              onClick={handleManualExit}
            >
              Done now
            </button>
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
