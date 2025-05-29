
import { Upload, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface PhotoMetadataFormProps {
  file: File;
  imagePreview: string;
  title: string;
  description: string;
  uploading: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onUpload: () => void;
  onBack: () => void;
  generateTitleFromFilename: (filename: string) => string;
}

const PhotoMetadataForm = ({
  file,
  imagePreview,
  title,
  description,
  uploading,
  onTitleChange,
  onDescriptionChange,
  onUpload,
  onBack,
  generateTitleFromFilename
}: PhotoMetadataFormProps) => {
  return (
    <>
      <div className="mb-4">
        <img
          src={imagePreview}
          alt="Preview"
          className="w-full h-32 object-cover rounded-lg"
        />
        <p className="text-sm text-gray-600 mt-2">{file.name}</p>
      </div>
      
      <form onSubmit={(e) => { e.preventDefault(); onUpload(); }} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title (optional)
          </label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={`e.g., "${generateTitleFromFilename(file.name)}"`}
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to auto-generate from filename
          </p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Add a description for your photo..."
            rows={3}
          />
        </div>

        <div className="flex space-x-3">
          <Button 
            type="submit" 
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            disabled={uploading}
          >
            {uploading ? (
              'Uploading...'
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Photo
              </>
            )}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onBack}
            disabled={uploading}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </form>
    </>
  );
};

export default PhotoMetadataForm;
