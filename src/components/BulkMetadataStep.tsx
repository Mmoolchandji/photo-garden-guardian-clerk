
import { Upload, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import FabricSelector from './FabricSelector';
import StockStatusSelector from './StockStatusSelector';
import BulkUploadProgress from './BulkUploadProgress';
import BulkUploadResults from './BulkUploadResults';

interface FileWithMetadata {
  file: File;
  preview: string;
  title: string;
  description: string;
  fabric: string;
  price: string;
  stockStatus: string;
}

interface BulkMetadataStepProps {
  filesWithMetadata: FileWithMetadata[];
  currentIndex: number;
  uploading: boolean;
  uploadProgress: number;
  uploadResults: { success: number; failed: string[] } | null;
  onMetadataChange: (field: 'title' | 'description' | 'fabric' | 'price' | 'stockStatus', value: string) => void;
  onNextPhoto: () => void;
  onPrevPhoto: () => void;
  onUploadAll: () => void;
  onSetStep: (step: 'preview') => void;
}

const BulkMetadataStep = ({
  filesWithMetadata,
  currentIndex,
  uploading,
  uploadProgress,
  uploadResults,
  onMetadataChange,
  onNextPhoto,
  onPrevPhoto,
  onUploadAll,
  onSetStep
}: BulkMetadataStepProps) => {
  const handlePriceChange = (value: string) => {
    // Allow only numbers and decimal points
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      onMetadataChange('price', value);
    }
  };

  const currentFile = filesWithMetadata[currentIndex];

  if (!currentFile) return null;

  return (
    <ScrollArea className="h-full max-h-[70vh]">
      <div className="space-y-4 pr-4">
        {/* Photo Preview */}
        <div className="mb-4">
          <img
            src={currentFile.preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
          />
          <p className="text-sm text-gray-600 mt-2">
            {currentFile.file.name}
          </p>
        </div>

        {/* Upload Progress */}
        <BulkUploadProgress uploading={uploading} uploadProgress={uploadProgress} />

        {/* Upload Results */}
        <BulkUploadResults uploadResults={uploadResults} />

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

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4">
          <Button
            variant="outline"
            onClick={onPrevPhoto}
            disabled={currentIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <span className="text-sm text-gray-600">
            {currentIndex + 1} of {filesWithMetadata.length}
          </span>
          
          <Button
            variant="outline"
            onClick={onNextPhoto}
            disabled={currentIndex === filesWithMetadata.length - 1}
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button 
            onClick={onUploadAll}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            disabled={uploading}
          >
            {uploading ? (
              'Uploading...'
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload All Photos
              </>
            )}
          </Button>
          <Button 
            onClick={() => onSetStep('preview')}
            variant="outline"
            disabled={uploading}
          >
            Back to Preview
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
};

export default BulkMetadataStep;
