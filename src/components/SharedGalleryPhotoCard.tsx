import { ShareablePhoto } from '@/utils/sharing/types';
import { Card, CardContent } from '@/components/ui/card';
import { getOptimizedImageUrl } from '@/utils/imageOptimization';

interface SharedGalleryPhotoCardProps {
  photo: ShareablePhoto;
}

const SharedGalleryPhotoCard = ({ photo }: SharedGalleryPhotoCardProps) => {
  return (
    <Card className="overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden">
        <img
          src={getOptimizedImageUrl(photo.imageUrl, { width: 640, quality: 80 })}
          alt={photo.title}
          className="w-full h-full object-contain object-center group-hover:scale-100 transition-transform duration-300"
          loading="lazy"
          decoding="async"
          sizes="(min-width:1280px) 20vw, (min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-800 truncate">{photo.title}</h3>
        {photo.price && (
          <p className="text-lg font-bold text-emerald-600 mt-1">
            ₹{photo.price.toLocaleString('en-IN')}
          </p>
        )}
        {photo.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{photo.description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default SharedGalleryPhotoCard;
