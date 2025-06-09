
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileImage, Link, Smartphone, Globe, AlertTriangle } from 'lucide-react';
import { Photo } from '@/types/photo';
import { WEB_SHARE_LIMITS } from '@/utils/sharing/webShareAPI';

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
  
  // Check if we're exceeding file sharing limits
  const exceedsFileLimit = photos.length > WEB_SHARE_LIMITS.MAX_FILES;
  const canShareAsFiles = filesSupported && !exceedsFileLimit;

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

        {exceedsFileLimit && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-amber-800">File sharing limitation</div>
                <div className="text-amber-700 mt-1">
                  Your device can only share up to {WEB_SHARE_LIMITS.MAX_FILES} files at once. 
                  With {photos.length} photos selected, we'll use link sharing instead.
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={onShareAsFiles}
            className="w-full justify-start h-auto p-4 bg-emerald-600 hover:bg-emerald-700"
            disabled={!canShareAsFiles}
          >
            <div className="flex items-start gap-3">
              <Smartphone className="h-5 w-5 mt-1 text-white" />
              <div className="text-left">
                <div className="font-medium text-white">📁 Share Photos as Files</div>
                <div className="text-sm text-emerald-100 mt-1">
                  {!filesSupported 
                    ? "Not supported on this device"
                    : exceedsFileLimit
                      ? `Limited to ${WEB_SHARE_LIMITS.MAX_FILES} files max`
                      : isMobile 
                        ? "Recommended for mobile devices" 
                        : "Share actual image files"
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
                  {exceedsFileLimit 
                    ? "Recommended for large selections" 
                    : "Works on all devices and browsers"
                  }
                </div>
              </div>
            </div>
          </Button>
        </div>

        <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded">
          <strong>Note:</strong> {exceedsFileLimit 
            ? `Selections over ${WEB_SHARE_LIMITS.MAX_FILES} photos automatically use link sharing due to platform limitations.`
            : "File sharing provides the best experience on mobile devices, while links work everywhere but require recipients to open each image separately."
          }
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareOptionsModal;
