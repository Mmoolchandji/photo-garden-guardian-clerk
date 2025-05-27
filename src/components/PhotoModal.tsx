
import { X, Calendar, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Photo {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
}

interface PhotoModalProps {
  photo: Photo | null;
  isOpen: boolean;
  onClose: () => void;
}

const PhotoModal = ({ photo, isOpen, onClose }: PhotoModalProps) => {
  if (!isOpen || !photo) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="relative">
          <img
            src={photo.imageUrl}
            alt={photo.title}
            className="w-full h-64 md:h-96 object-cover"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm hover:bg-white"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{photo.title}</h2>
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Calendar className="h-4 w-4 mr-2" />
                Added on {photo.createdAt}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
          
          <p className="text-gray-700 leading-relaxed">{photo.description}</p>
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;
