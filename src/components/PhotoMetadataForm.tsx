
import { Upload, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import FabricSelector from './FabricSelector';
import StockStatusSelector from './StockStatusSelector';

interface PhotoMetadataFormProps {
  file: File;
  imagePreview: string;
  title: string;
  description: string;
  fabric: string;
  price: string;
  stockStatus: string;
  uploading: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onFabricChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onStockStatusChange: (value: string) => void;
  onUpload: () => void;
  onBack: () => void;
  generateTitleFromFilename: (filename: string) => string;
}

const PhotoMetadataForm = ({
  file,
  imagePreview,
  title,
  description,
  fabric,
  price,
  stockStatus,
  uploading,
  onTitleChange,
  onDescriptionChange,
  onFabricChange,
  onPriceChange,
  onStockStatusChange,
  onUpload,
  onBack,
  generateTitleFromFilename
}: PhotoMetadataFormProps) => {
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimal points
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      onPriceChange(value);
    }
  };

  return (
  <div
    className="w-full max-w-lg mx-auto bg-white rounded-lg shadow-md p-4 sm:p-6"
  >
    <div className="mb-4 w-full">
      <img
        src={imagePreview}
        alt="Preview"
        className="w-full h-32 object-cover rounded-lg"
      />
      <p className="text-sm text-gray-600 mt-2">{file.name}</p>
    </div>
    <form onSubmit={(e) => { e.preventDefault(); onUpload(); }} className="space-y-4 w-full">
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
        </div>

        <div className="relative">
  <label htmlFor="fabric" className="block text-sm font-medium text-gray-700 mb-1">
    Fabric Type (optional)
  </label>
  <FabricSelector
    value={fabric}
    onChange={onFabricChange}
  />
</div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Price (optional)
          </label>
          <Input
            id="price"
            type="text"
            value={price}
            onChange={handlePriceChange}
            placeholder="Enter price..."
          />
        </div>

        <div>
          <label htmlFor="stock-status" className="block text-sm font-medium text-gray-700 mb-1">
            Stock Status (optional)
          </label>
          <StockStatusSelector
            value={stockStatus}
            onChange={onStockStatusChange}
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
    </div>
  );
};

export default PhotoMetadataForm;
