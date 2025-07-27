import { PhotoCardData } from '@/types/photo';

interface AdminCompactPhotoCardProps {
  photo: PhotoCardData;
  onClick: () => void;
}

const AdminCompactPhotoCard = ({ photo, onClick }: AdminCompactPhotoCardProps) => {
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-md overflow-hidden border-2 border-transparent hover:border-gray-300 transition-all duration-200 cursor-pointer select-none"
    >
      <div className="relative overflow-hidden">
        <img
          src={photo.imageUrl}
          alt={photo.title}
          className="w-full h-auto aspect-[3/4] object-cover transition-transform duration-300 group-hover:scale-105"
          draggable={false}
        />
        
        {/* Price overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5 bg-gradient-to-t from-black/50 to-transparent">
          <p className="text-xs font-medium text-white truncate">
            ₹{photo.price}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminCompactPhotoCard;