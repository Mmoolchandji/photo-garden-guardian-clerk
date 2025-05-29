
import { useRef } from 'react';
import { Upload, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FileSelectionCardProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileSelectionCard = ({ onFileChange }: FileSelectionCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="text-center">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-emerald-400 transition-colors">
        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Select photo(s)</h3>
        <p className="text-gray-500 mb-4">Choose one or multiple image files to upload to your gallery</p>
        <Button 
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={handleBrowseClick}
        >
          <Upload className="h-4 w-4 mr-2" />
          Browse Files
        </Button>
        <Input
          ref={fileInputRef}
          type="file"
          onChange={onFileChange}
          accept="image/*"
          multiple
          className="hidden"
        />
        <p className="text-xs text-gray-400 mt-2">
          Select multiple files for bulk upload (max 20 files)
        </p>
      </div>
    </div>
  );
};

export default FileSelectionCard;
