
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import FileSelectionCard from './FileSelectionCard';
import PhotoPreviewCard from './PhotoPreviewCard';
import PhotoMetadataForm from './PhotoMetadataForm';
import CompressionToggle from './CompressionToggle';

interface PhotoUploadContainerProps {
  step: 'file-selection' | 'metadata';
  file: File | null;
  imagePreview: string;
  uploading: boolean;
  title: string;
  description: string;
  fabric: string;
  price: string;
  stockStatus: string;
  enableCompression: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContinueToMetadata: () => void;
  onUploadNow: () => void;
  onChooseDifferentFile: () => void;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onFabricChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onStockStatusChange: (value: string) => void;
  onCompressionToggle: (enabled: boolean) => void;
  onUpload: () => void;
  onBack: () => void;
  onCancel: () => void;
  generateTitleFromFilename: (filename: string) => string;
}

const PhotoUploadContainer = ({
  step,
  file,
  imagePreview,
  uploading,
  title,
  description,
  fabric,
  price,
  stockStatus,
  enableCompression,
  onFileChange,
  onContinueToMetadata,
  onUploadNow,
  onChooseDifferentFile,
  onTitleChange,
  onDescriptionChange,
  onFabricChange,
  onPriceChange,
  onStockStatusChange,
  onCompressionToggle,
  onUpload,
  onBack,
  onCancel,
  generateTitleFromFilename,
}: PhotoUploadContainerProps) => {
  if (step === 'file-selection') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="flex-shrink-0 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="px-3 text-lg font-semibold text-gray-900 dark:text-gray-100">Add New Photo</CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!file ? (
            <>
              <FileSelectionCard onFileChange={onFileChange} />
              <CompressionToggle 
                enabled={enableCompression}
                onToggle={onCompressionToggle}
              />
            </>
          ) : (
            <PhotoPreviewCard
              file={file}
              imagePreview={imagePreview}
              uploading={uploading}
              onContinueToMetadata={onContinueToMetadata}
              onUploadNow={onUploadNow}
              onChooseDifferentFile={onChooseDifferentFile}
            />
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex-shrink-0 p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="px-3 text-lg font-semibold text-gray-900 dark:text-gray-100">Add Photo Details</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className='p-4 pt-0'>
        <PhotoMetadataForm
          file={file!}
          imagePreview={imagePreview}
          title={title}
          description={description}
          fabric={fabric}
          price={price}
          stockStatus={stockStatus}
          uploading={uploading}
          onTitleChange={onTitleChange}
          onDescriptionChange={onDescriptionChange}
          onFabricChange={onFabricChange}
          onPriceChange={onPriceChange}
          onStockStatusChange={onStockStatusChange}
          onUpload={onUpload}
          onBack={onBack}
          generateTitleFromFilename={generateTitleFromFilename}
        />
      </CardContent>
    </Card>
  );
};

export default PhotoUploadContainer;
