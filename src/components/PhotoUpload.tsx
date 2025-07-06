
import { Card, CardContent } from '@/components/ui/card';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import FileSelectionCard from './FileSelectionCard';

interface PhotoUploadProps {
  onPhotoUploaded: () => void;
  onCancel: () => void;
  onBulkUploadInitiated?: (files: File[]) => void; // New callback for parent to handle bulk uploads
}

const PhotoUpload = ({
  onPhotoUploaded,
  onCancel,
  onBulkUploadInitiated,
}: PhotoUploadProps) => {
  const {
    // State
    file,
    files,
    uploadMode,
    user,
    fileInputRef,

    // Handlers
    handleFileChange,
    handleCancel,
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

  // If in bulk or single mode, notify the parent to handle the upload
  if ((uploadMode === 'bulk' || (uploadMode === 'single' && file)) && onBulkUploadInitiated) {
    const filesToUpload = uploadMode === 'bulk' ? files : [file as File];
    // Call the callback with the selected files
    onBulkUploadInitiated(filesToUpload);
    return null; // Don't render the single upload UI
  }

  return (
    <FileSelectionCard
      onFileChange={handleFileChange}
    />
  );
};

export default PhotoUpload;
