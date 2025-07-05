
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import FabricSelector from './FabricSelector';
import StockStatusSelector from './StockStatusSelector';
import { X } from 'lucide-react';

interface FileWithMetadata {
  file: File;
  preview: string;
  title: string;
  description: string;
  fabric: string;
  price: string;
  stockStatus: string;
}

interface BulkMetadataFormProps {
  currentFile: FileWithMetadata;
  currentIndex: number;
  totalFiles: number;
  availableCustomFabrics?: string[];
  onMetadataChange: (field: 'title' | 'description' | 'fabric' | 'price' | 'stockStatus', value: string) => void;
  onAddCustomFabric?: (fabricName: string) => void;
  onRemoveFile: (index: number) => void;
  uploading: boolean;
}

const BulkMetadataForm = ({ 
  currentFile, 
  currentIndex,
  totalFiles,
  availableCustomFabrics = [],
  onMetadataChange,
  onAddCustomFabric,
  onRemoveFile,
  uploading
}: BulkMetadataFormProps) => {
  const handlePriceChange = (value: string) => {
    // Allow only numbers and decimal points
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      onMetadataChange('price', value);
    }
  };

  return (
    <div className="space-y-3">
      {/* Photo Preview */}
      <div className="mb-3 relative">
        <div className="relative">
          <img
            src={currentFile.preview}
            alt="Preview"
            className="w-full h-28 object-cover rounded-md transition-opacity duration-200"
          />
          {totalFiles > 1 && (
            <button
              onClick={() => onRemoveFile(currentIndex)}
              disabled={uploading}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-80 hover:opacity-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              aria-label="Remove photo"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1 truncate">
          {currentFile.file.name}
        </p>
      </div>

      {/* Metadata Form */}
      <div className="space-y-3">
        <div>
          <label htmlFor="title" className="block text-xs font-medium text-gray-600 mb-1">
            Title
          </label>
          <Input
            id="title"
            type="text"
            value={currentFile.title}
            onChange={(e) => onMetadataChange('title', e.target.value)}
            placeholder="Enter photo title..."
          />
        </div>

        <div>
          <label htmlFor="fabric" className="block text-xs font-medium text-gray-600 mb-1">
            Fabric Type
          </label>
          <FabricSelector
            value={currentFile.fabric}
            onChange={(value) => onMetadataChange('fabric', value)}
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-xs font-medium text-gray-600 mb-1">
            Price
          </label>
          <Input
            id="price"
            type="text"
            value={currentFile.price}
            onChange={(e) => handlePriceChange(e.target.value)}
            placeholder="Enter price..."
          />
        </div>

        <div>
          <label htmlFor="stock-status" className="block text-xs font-medium text-gray-600 mb-1">
            Stock Status
          </label>
          <StockStatusSelector
            value={currentFile.stockStatus}
            onChange={(value) => onMetadataChange('stockStatus', value)}
          />
        </div>
      </div>
    </div>
  );
};

export default BulkMetadataForm;
