import { Photo } from '@/types/photo';
import SortableAdminPhotoCard from '@/components/SortableAdminPhotoCard';
import AdminCompactPhotoCard from './AdminCompactPhotoCard';
import { PhotoCardData } from '@/types/photo';

interface AdminPhotoGridViewProps {
  photos: Photo[];
  viewMode: 'grid' | 'compact';
  onPhotoEdit: (photo: Photo) => void;
  onPhotoDeleted: () => void;
}

const AdminPhotoGridView = ({ photos, viewMode, onPhotoEdit, onPhotoDeleted }: AdminPhotoGridViewProps) => {
  const transformPhotoData = (photo: Photo): PhotoCardData => ({
    id: photo.id,
    title: photo.title,
    description: photo.description || '',
    imageUrl: photo.image_url,
    createdAt: new Date(photo.created_at).toLocaleDateString(),
    price: photo.price,
  });

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1 sm:gap-4 transition-all duration-300">
        {photos.map((photo) => (
            <SortableAdminPhotoCard
              key={photo.id}
              photo={photo}
              onPhotoEdit={onPhotoEdit}
              onPhotoDeleted={onPhotoDeleted}
              deletingId={null}
              handleDelete={() => {}}
              handlePhotoLongPress={() => {}}
              handlePhotoClick={() => onPhotoEdit(photo)}
            />
        ))}
      </div>
    );
  }

  // Compact view - maximum density for mobile
  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-1 py-2 transition-all duration-300">
      {photos.map((photo) => (
        <AdminCompactPhotoCard
          key={photo.id}
          photo={transformPhotoData(photo)}
          onClick={() => onPhotoEdit(photo)}
        />
      ))}
    </div>
  );
};

export default AdminPhotoGridView;