
import { MessageCircle, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePhotoSelection } from '@/contexts/PhotoSelectionContext';

interface FloatingShareButtonProps {
  onShare: () => void;
}

const FloatingShareButton = ({ onShare }: FloatingShareButtonProps) => {
  const { selectedPhotos, totalSelectedSize, clearSelection, exceedsFileShareLimit } = usePhotoSelection();

  if (selectedPhotos.length === 0) return null;

  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(0)}KB` : `${mb.toFixed(1)}MB`;
  };

  const showFileShareWarning = exceedsFileShareLimit();

  return (
    <div className="mx-4 fixed bottom-0 left-0 right-0 sm:bottom-6 sm:left-1/2 sm:transform sm:-translate-x-1/2 z-50 p-2 sm:p-0">
      <div className="bg-white rounded-full shadow-2xl border border-gray-200 p-2 flex items-center gap-2 w-full sm:min-w-[280px] sm:w-auto mx-auto max-w-md">
        <Button
          onClick={clearSelection}
          variant="ghost"
          size="icon"
          className="rounded-full h-8 w-8 flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
        
        <div className="flex-1 text-sm leading-tight">
          <div className="font-medium flex items-center gap-1">
            {selectedPhotos.length} photo{selectedPhotos.length !== 1 ? 's' : ''} selected
            {showFileShareWarning && (
              <AlertTriangle className="h-3 w-3 text-amber-500" />
            )}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {formatSize(totalSelectedSize)}
            {showFileShareWarning && (
              <span className="text-amber-600 ml-1">• Link sharing only</span>
            )}
          </div>
        </div>
        
        <Button
          onClick={onShare}
          className="bg-[#25D366] hover:bg-[#1DB954] text-white rounded-full px-3 sm:px-4"
          size="sm"
        >
          <MessageCircle className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Share on WhatsApp</span>
          <span className="inline sm:hidden">Share</span>
        </Button>
      </div>
    </div>
  );
};

export default FloatingShareButton;
