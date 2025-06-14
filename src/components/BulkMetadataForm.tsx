
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import FabricSelector from './FabricSelector';
import StockStatusSelector from './StockStatusSelector';

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
  availableCustomFabrics?: string[];
  onMetadataChange: (field: 'title' | 'description' | 'fabric' | 'price' | 'stockStatus', value: string) => void;
  onAddCustomFabric?: (fabricName: string) => void;
}

const BulkMetadataForm = ({ 
  currentFile, 
  availableCustomFabrics = [],
  onMetadataChange,
  onAddCustomFabric 
}: BulkMetadataFormProps) => {
  const handlePriceChange = (value: string) => {
    // Allow only numbers and decimal points
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      onMetadataChange('price', value);
    }
  };

  return (
    <div className="space-y-4">
      {/* Photo Preview */}
      <div className="mb-4">
        <img
          src={currentFile.preview}
          alt="Preview"
          className="w-full h-32 object-cover rounded-lg"
        />
        <p className="text-sm text-gray-600 mt-2">
          {currentFile.file.name}
        </p>
      </div>

      {/* Metadata Form */}
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title (optional)
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
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <Textarea
            id="description"
            value={currentFile.description}
            onChange={(e) => onMetadataChange('description', e.target.value)}
            placeholder="Add a description for your photo..."
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="fabric" className="block text-sm font-medium text-gray-700 mb-1">
            Fabric Type (optional)
          </label>
          <FabricSelector
            value={currentFile.fabric}
            onChange={(value) => onMetadataChange('fabric', value)}
            availableCustomFabrics={availableCustomFabrics}
            onAddCustomFabric={onAddCustomFabric}
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Price (optional)
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
          <label htmlFor="stock-status" className="block text-sm font-medium text-gray-700 mb-1">
            Stock Status (optional)
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
