
import { Card, CardContent } from '@/components/ui/card';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import PhotoUploadContainer from './PhotoUploadContainer';

interface PhotoUploadProps {
  onPhotoUploaded: () => void;
  onCancel: () => void;
  onBulkUploadInitiated?: (files: File[]) => void; // New callback for parent to handle bulk uploads
}

const PhotoUpload = ({ 
  onPhotoUploaded, 
  onCancel,
  onBulkUploadInitiated 
}: PhotoUploadProps) => {
  const {
    // State
    step,
    title,
    description,
    fabric,
    price,
    stockStatus,
    file,
    files,
    uploading,
    imagePreview,
    uploadMode, // Using uploadMode instead of showBulkModal
    user,
    enableCompression,
    
    // Setters
    setTitle,
    setDescription,
    setFabric,
    setPrice,
    setStockStatus,
    setEnableCompression,
    
    // Handlers
    handleFileChange,
    handleUpload,
    handleCancel,
    handleContinueToMetadata,
    handleBackToFileSelection,
    handleBulkUploadComplete,
    handleChooseDifferentFiles,
    generateTitleFromFilename,
  } = usePhotoUpload(onPhotoUploaded, onCancel);

  // Ensure user is authenticated
  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">Please sign in to upload photos.</p>
        </CardContent>
      </Card>
    );
  }

  // If in bulk mode, notify the parent to handle bulk uploads
  if (uploadMode === 'bulk' && onBulkUploadInitiated) {
    // Call the callback with the selected files
    onBulkUploadInitiated(files);
  }

  // Only render the single upload UI when in single mode or idle
  // The bulk upload UI will be handled by the parent component
  return (
    <PhotoUploadContainer
      step={step}
      file={file}
      imagePreview={imagePreview}
      uploading={uploading}
      title={title}
      description={description}
      fabric={fabric}
      price={price}
      stockStatus={stockStatus}
      enableCompression={enableCompression}
      onFileChange={handleFileChange}
      onContinueToMetadata={handleContinueToMetadata}
      onUploadNow={() => handleUpload(true)}
      onChooseDifferentFile={() => {
        // Clean up and reset
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
        }
        // Reset state is handled in the hook
        handleBackToFileSelection();
      }}
      onTitleChange={setTitle}
      onDescriptionChange={setDescription}
      onFabricChange={setFabric}
      onPriceChange={setPrice}
      onStockStatusChange={setStockStatus}
      onCompressionToggle={setEnableCompression}
      onUpload={() => handleUpload()}
      onBack={handleBackToFileSelection}
      onCancel={handleCancel}
      generateTitleFromFilename={generateTitleFromFilename}
    />
  );
};

export default PhotoUpload;
