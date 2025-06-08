
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileImage, Link, Smartphone, Globe } from 'lucide-react';
import { Photo } from '@/types/photo';

interface ShareOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: Photo[];
  onShareAsFiles: () => void;
  onShareAsLinks: () => void;
}

const ShareOptionsModal = ({ 
  isOpen, 
  onClose, 
  photos, 
  onShareAsFiles, 
  onShareAsLinks 
}: ShareOptionsModalProps) => {
  // Auto-detect the best sharing method
  const canShareFiles = () => {
    if (!navigator.canShare) return false;
    
    try {
      // Test with a dummy file to check support
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      return navigator.canShare({ files: [testFile] });
    } catch {
      return false;
    }
  };

  const filesSupported = canShareFiles();
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5 text-emerald-600" />
            How would you like to share these photos?
          </DialogTitle>
          <DialogDescription>
            Choose the best sharing method for your device. {photos.length} photo{photos.length !== 1 ? 's' : ''} selected.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Button
            onClick={onShareAsFiles}
            className="w-full justify-start h-auto p-4 bg-emerald-600 hover:bg-emerald-700"
            disabled={!filesSupported}
          >
            <div className="flex items-start gap-3">
              <Smartphone className="h-5 w-5 mt-1 text-white" />
              <div className="text-left">
                <div className="font-medium text-white">📁 Share Photos as Files</div>
                <div className="text-sm text-emerald-100 mt-1">
                  {filesSupported 
                    ? isMobile 
                      ? "Recommended for mobile devices" 
                      : "Share actual image files"
                    : "Not supported on this device"
                  }
                </div>
              </div>
            </div>
          </Button>

          <Button
            onClick={onShareAsLinks}
            variant="outline"
            className="w-full justify-start h-auto p-4"
          >
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 mt-1 text-gray-600" />
              <div className="text-left">
                <div className="font-medium">🔗 Share Image Links Instead</div>
                <div className="text-sm text-gray-500 mt-1">
                  Safe on all devices and browsers
                </div>
              </div>
            </div>
          </Button>
        </div>

        <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded">
          <strong>Note:</strong> Files sharing provides the best experience on mobile devices, 
          while links work everywhere but require recipients to open each image separately.
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareOptionsModal;
