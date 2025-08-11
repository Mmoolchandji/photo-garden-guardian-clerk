
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileImage, Package, Globe } from 'lucide-react';
import { Photo } from '@/types/photo';
import { getRecommendedMethod } from './ShareMethodRecommendation';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface EnhancedShareOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: Photo[];
  onShareAsFiles: () => void;
  onShareBatched: () => void;
}

const EnhancedShareOptionsModal = ({ 
  isOpen, 
  onClose, 
  photos, 
  onShareAsFiles,
  onShareBatched
}: EnhancedShareOptionsModalProps) => {
  const photoCount = photos.length;
  const recommendedMethod = getRecommendedMethod(photoCount);

  const getMethodDetails = () => {
    if (photoCount <= 10) {
      return {
        title: "Perfect for file sharing",
        description: "Your photos will be shared as high-quality files directly to WhatsApp",
      };
    } else {
      return {
        title: "Batch file sharing available", 
        description: "Large collections will be split into smaller groups for file sharing",
      };
    }
  };

  const details = getMethodDetails();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5 text-emerald-600" />
            Share Your Saree Collection
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <div>{details.description}</div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{photoCount} photos selected</Badge>
              <Badge variant="outline">Method: {recommendedMethod}</Badge>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          <div className="grid gap-3">
            <Button
              onClick={onShareAsFiles}
              disabled={photoCount > 10}
              className="w-full justify-start h-auto p-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
            >
              <div className="flex items-start gap-3">
                <FileImage className="h-5 w-5 mt-1 text-white" />
                <div className="text-left">
                  <div className="font-medium text-white">📁 Share as Files</div>
                  <div className="text-sm text-emerald-100 mt-1">
                    {photoCount > 10
                      ? `Limited to 10 photos (you have ${photoCount})`
                      : "High-quality files directly in WhatsApp"
                    }
                  </div>
                </div>
              </div>
            </Button>

            <Button
              onClick={onShareBatched}
              disabled={photoCount <= 10 || photoCount > 50}
              variant="outline"
              className="w-full justify-start h-auto p-4"
            >
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 mt-1 text-gray-600" />
                <div className="text-left">
                  <div className="font-medium">📦 Share in Batches</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {photoCount <= 10
                      ? "Use file sharing for smaller collections"
                      : photoCount > 50
                        ? "Too many photos for batching (50 max)"
                        : `Split into ${Math.ceil(photoCount / 10)} parts of 10 photos each`
                    }
                  </div>
                </div>
              </div>
            </Button>

          </div>
        </div>

        <Separator />
        
        <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded">
          <strong>💡 Business Tip:</strong> File sharing provides the highest quality images for customers to see fabric details and colors accurately.
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedShareOptionsModal;
