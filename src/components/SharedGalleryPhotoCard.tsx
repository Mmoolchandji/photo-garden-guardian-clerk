import { ShareablePhoto } from '@/utils/sharing/types';
import { Card, CardContent } from '@/components/ui/card';

interface SharedGalleryPhotoCardProps {
  photo: ShareablePhoto;
}

const SharedGalleryPhotoCard = ({ photo }: SharedGalleryPhotoCardProps) => {
  return (
      <Card className="overflow-hidden group transition-[transform,box-shadow] duration-300 hover:shadow-xl hover:-translate-y-1 content-visibility-auto">
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden">
          <img
            src={photo.imageUrl}
            alt={photo.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            decoding="async"
            width={600}
            height={600}
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
