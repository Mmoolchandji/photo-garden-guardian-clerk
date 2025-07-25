
import { Upload, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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

interface BulkPreviewStepProps {
  filesWithMetadata: FileWithMetadata[];
  currentIndex: number;
  uploading: boolean;
  uploadProgress: number;
  uploadResults: { success: number; failed: string[] } | null;
  onNextPhoto: () => void;
  onPrevPhoto: () => void;
  onSetStep: (step: 'metadata') => void;
  onUploadAll: () => void;
  onChooseDifferentFiles: () => void;
  onRemoveFile: (index: number) => void;
}

const BulkPreviewStep = ({
  filesWithMetadata,
  currentIndex,
  uploading,
  uploadProgress,
  uploadResults,
  onNextPhoto,
  onPrevPhoto,
  onSetStep,
  onUploadAll,
  onChooseDifferentFiles,
  onRemoveFile
}: BulkPreviewStepProps) => {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 pr-4">
        {/* Carousel Preview */}
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevPhoto}
              disabled={filesWithMetadata.length <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600">
              {currentIndex + 1} of {filesWithMetadata.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onNextPhoto}
              disabled={filesWithMetadata.length <= 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {filesWithMetadata[currentIndex] && (
            <div className="text-center relative group">
              <div className="relative">
                <img
                  src={filesWithMetadata[currentIndex].preview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg mb-3 transition-opacity duration-200"
                />
                {filesWithMetadata.length > 1 && (
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
              <p className="text-sm text-gray-600 font-medium">
                {filesWithMetadata[currentIndex].file.name}
              </p>
              <p className="text-xs text-gray-400">
                {(filesWithMetadata[currentIndex].file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}
        </div>

        {/* Upload Progress */}
        <BulkUploadProgress uploading={uploading} uploadProgress={uploadProgress} />

        {/* Upload Results */}
        <BulkUploadResults uploadResults={uploadResults} />

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button 
            onClick={() => onSetStep('metadata')}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            disabled={uploading}
          >
            Add Details
          </Button>
          <Button 
            onClick={onUploadAll}
            variant="outline"
            className="flex-1"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Now'}
          </Button>
        </div>
        
        <Button 
          onClick={onChooseDifferentFiles}
          variant="ghost"
          className="w-full"
          disabled={uploading}
        >
          Choose Different Files
        </Button>
      </div>
    </ScrollArea>
  );
};

export default BulkPreviewStep;
