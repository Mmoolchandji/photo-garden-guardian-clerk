
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BulkMetadataActionsProps {
  uploading: boolean;
  onUploadAll: () => void;
  onSetStep: (step: 'preview') => void;
}

const BulkMetadataActions = ({
  uploading,
  onUploadAll,
  onSetStep
}: BulkMetadataActionsProps) => {
  return (
    <div className="flex space-x-3">
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
  );
};

export default BulkMetadataActions;
