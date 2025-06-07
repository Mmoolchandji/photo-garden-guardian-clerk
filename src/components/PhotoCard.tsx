
import { Calendar, Eye } from 'lucide-react';
import { PhotoCardData } from '@/types/photo';
import WhatsAppShareButton from './WhatsAppShareButton';

interface PhotoCardProps {
  photo: PhotoCardData;
  onClick: () => void;
}

const PhotoCard = ({ photo, onClick }: PhotoCardProps) => {
  return (
    <div
      className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative overflow-hidden">
        <img
          src={photo.imageUrl}
          alt={photo.title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 right-3 flex space-x-2">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Eye className="h-4 w-4 text-gray-700" />
          </div>
          <WhatsAppShareButton
            photo={{
              id: photo.id,
              title: photo.title,
              imageUrl: photo.imageUrl,
              price: photo.price,
            }}
            variant="icon"
          />
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
          {photo.title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {photo.description}
        </p>
        <div className="flex items-center text-xs text-gray-400">
          <Calendar className="h-3 w-3 mr-1" />
          {photo.createdAt}
        </div>
      </div>
    </div>
  );
};

export default PhotoCard;
