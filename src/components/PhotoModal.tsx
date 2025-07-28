
import { X, Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PhotoCardData } from '@/types/photo';
import WhatsAppShareButton from './WhatsAppShareButton';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useEffect, useState } from 'react';

interface PhotoModalProps {
  photos: PhotoCardData[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onPhotoUpdated?: () => void;
}

const PhotoModal = ({ photos, currentIndex, isOpen, onClose }: PhotoModalProps) => {
  const [api, setApi] = useState(null);

  useEffect(() => {
    if (isOpen && api) {
      api.scrollTo(currentIndex, true);
    }
  }, [isOpen, currentIndex, api]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white sm:rounded-2xl w-full h-full sm:max-w-4xl sm:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col sm:flex-row" onClick={(e) => e.stopPropagation()}>
        <Carousel setApi={setApi} className="w-full h-full">
          <CarouselContent>
            {photos.map((photo) => (
              <CarouselItem key={photo.id}>
                <div className="w-full h-full flex flex-col sm:flex-row">
                  <div className="relative w-full sm:w-1/2 h-auto">
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="p-4 sm:p-6 flex-1 overflow-y-auto w-full sm:w-1/2">
                    <div className="flex flex-col h-full">
                      <div className="flex-grow">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{photo.title}</h2>
                        <div className="flex items-center text-sm text-gray-500 my-4">
                          <Calendar className="h-4 w-4 mr-2" />
                          Added on {photo.createdAt}
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-4">{photo.description}</p>
                      </div>
                      <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2">
                        <WhatsAppShareButton
                          photo={{
                            id: photo.id,
                            title: photo.title,
                            imageUrl: photo.imageUrl,
                            price: photo.price,
                          }}
                        />
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
        </Carousel>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full sm:top-4 sm:right-4 sm:h-10 sm:w-10 h-8 w-8"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PhotoModal;
