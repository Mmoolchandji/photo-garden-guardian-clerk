
import { Card, CardContent } from '@/components/ui/card';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import BulkUploadModal from './BulkUploadModal';
import PhotoUploadContainer from './PhotoUploadContainer';

interface PhotoUploadProps {
  onPhotoUploaded: () => void;
  onCancel: () => void;
}

const PhotoUpload = ({ onPhotoUploaded, onCancel }: PhotoUploadProps) => {
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
    showBulkModal,
    user,
    
    // Setters
    setTitle,
    setDescription,
    setFabric,
    setPrice,
    setStockStatus,
    
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

  // Show bulk upload modal if multiple files are selected
  if (showBulkModal) {
    return (
      <BulkUploadModal
        files={files}
        onUploadComplete={handleBulkUploadComplete}
        onCancel={handleCancel}
        onChooseDifferentFiles={handleChooseDifferentFiles}
      />
    );
  }

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
      onUpload={() => handleUpload()}
      onBack={handleBackToFileSelection}
      onCancel={handleCancel}
      generateTitleFromFilename={generateTitleFromFilename}
    />
  );
};

export default PhotoUpload;
