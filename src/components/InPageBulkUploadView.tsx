import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useBulkUploadLogic } from '@/hooks/useBulkUploadLogic';
import BulkUploadHeader from './BulkUploadHeader';
import BulkUploadContent from './BulkUploadContent';
import BulkUploadResults from './BulkUploadResults';
import { Button } from './ui/button'; // Added for "Done" button styling

interface InPageBulkUploadViewProps {
  files: File[];
  onUploadComplete: () => void;
  onCancel: () => void;
  onChooseDifferentFiles: () => void;
}

const InPageBulkUploadView = ({
  files,
  onUploadComplete,
  onCancel,
  onChooseDifferentFiles,
}: InPageBulkUploadViewProps) => {
  // ALL hook calls must be at the TOP, before any conditions or returns.
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

  useEffect(() => {
    // This effect's logic will only run if uploadResults, uploading, etc. meet conditions.
    // The hook call itself is unconditional.
    if (user && !hasHandledCompletion && uploadResults && !uploading) {
      setHasHandledCompletion(true);
      // Logic for post-upload completion
    }
  }, [user, uploadResults, uploading, hasHandledCompletion]);

  // Early return for unauthenticated users AFTER all hooks are declared.
  if (!user) {
    return (
      <Card className="w-full max-w-lg mx-auto my-8">
        <div className="p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">Please sign in to upload photos.</p>
        </div>
      </Card>
    );
  }

  // Component logic continues here, assured that 'user' is defined.
  const cleanupPreviewURLs = () => {
    filesWithMetadata.forEach((fileData) => {
      if (fileData.preview) {
        URL.revokeObjectURL(fileData.preview);
      }
    });
  };

  const handleCancelCleanup = () => {
    cleanupPreviewURLs();
    onCancel();
  };

  const handleUploadAndComplete = async () => {
    if (uploading) return;
    await handleUploadAll();
  };

  const handleExitView = () => {
    cleanupPreviewURLs();
    onUploadComplete?.(); // Signal completion to parent
  };

  const allFailed = uploadResults &&
    uploadResults.success === 0 &&
    uploadResults.failed.length === files.length;

  const renderSummaryMessage = () => {
    if (!uploadResults) return null;
    if (allFailed) {
      return (
        <div className="text-center mt-4 text-red-600 dark:text-red-400 text-sm font-semibold">
          All uploads failed.
          <br />
          Please check your connection and try again.
        </div>
      );
    }
    if (uploadResults.failed.length > 0) {
      return (
        <div className="text-center mt-4 text-gray-700 dark:text-gray-300 text-sm">
          Some uploads failed.
          <br />
          Please review the failed files below.
        </div>
      );
    }
    return (
      <div className="text-center mt-4 text-gray-700 dark:text-gray-300 text-sm font-semibold">
        Uploads processed!
      </div>
    );
  };

  return (
    // Removed modal fixed positioning and backdrop. This Card will be part of the page flow.
    // Added my-8 for some margin when in page. Responsive width with max-w-2xl.
    <Card className="w-full max-w-2xl mx-auto my-8 flex flex-col shadow-xl dark:bg-gray-800">
      <BulkUploadHeader
        step={step}
        fileCount={files.length}
        currentIndex={currentIndex}
        onCancel={handleCancelCleanup} // Use cleanup version
      />
      {uploadResults && hasHandledCompletion ? (
        // Results View
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
          <BulkUploadResults uploadResults={uploadResults} />
          {renderSummaryMessage()}
          <Button
            className="mt-6"
            variant="default"
            onClick={handleExitView}
            data-testid="in-page-bulk-upload-done"
          >
            Done
          </Button>
        </div>
      ) : (
        // Upload/Metadata View
        <BulkUploadContent
          step={step}
          filesWithMetadata={filesWithMetadata}
          currentIndex={currentIndex}
          uploading={uploading}
          uploadProgress={uploadProgress}
          uploadResults={uploadResults} // Pass this down, might be null initially
          onNextPhoto={nextPhoto}
          onPrevPhoto={prevPhoto}
          onSetStep={setStep}
          onUploadAll={handleUploadAndComplete}
          onChooseDifferentFiles={() => {
            cleanupPreviewURLs();
            onChooseDifferentFiles();
          }}
          onMetadataChange={handleMetadataChange}
          isModal={false} // Indicate it's not in a modal for potential style adjustments
        />
      )}
    </Card>
  );
};

export default InPageBulkUploadView;
