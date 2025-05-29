
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PhotoPreviewCardProps {
  file: File;
  imagePreview: string;
  uploading: boolean;
  onContinueToMetadata: () => void;
  onUploadNow: () => void;
  onChooseDifferentFile: () => void;
}

const PhotoPreviewCard = ({ 
  file, 
  imagePreview, 
  uploading, 
  onContinueToMetadata, 
  onUploadNow, 
  onChooseDifferentFile 
}: PhotoPreviewCardProps) => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <img
          src={imagePreview}
          alt="Preview"
          className="w-full h-48 object-cover rounded-lg mb-3"
        />
        <p className="text-sm text-gray-600 font-medium">{file.name}</p>
        <p className="text-xs text-gray-400">
          {(file.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>
      
      <div className="flex space-x-3">
        <Button 
          onClick={onContinueToMetadata}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
        >
          Add Details
        </Button>
        <Button 
          onClick={onUploadNow}
          variant="outline"
          className="flex-1"
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Now'}
        </Button>
      </div>
      
      <Button 
        onClick={onChooseDifferentFile}
        variant="ghost"
        className="w-full"
      >
        Choose Different File
      </Button>
    </div>
  );
};

export default PhotoPreviewCard;
