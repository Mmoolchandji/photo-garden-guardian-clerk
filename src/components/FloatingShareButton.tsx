
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePhotoSelection } from '@/contexts/PhotoSelectionContext';

interface FloatingShareButtonProps {
  onShare: () => void;
}

const FloatingShareButton = ({ onShare }: FloatingShareButtonProps) => {
  const { selectedPhotos, totalSelectedSize, clearSelection } = usePhotoSelection();

  if (selectedPhotos.length === 0) return null;

  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(0)}KB` : `${mb.toFixed(1)}MB`;
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-full shadow-2xl border border-gray-200 p-2 flex items-center gap-3 min-w-[280px]">
        <Button
          onClick={clearSelection}
          variant="ghost"
          size="icon"
          className="rounded-full h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
        
        <div className="flex-1 text-sm">
          <div className="font-medium">
            {selectedPhotos.length} photo{selectedPhotos.length !== 1 ? 's' : ''} selected
          </div>
          <div className="text-xs text-gray-500">
            {formatSize(totalSelectedSize)}
          </div>
        </div>
        
        <Button
          onClick={onShare}
          className="bg-[#25D366] hover:bg-[#1DB954] text-white rounded-full px-4"
          size="sm"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Share on WhatsApp
        </Button>
      </div>
    </div>
  );
};

export default FloatingShareButton;
