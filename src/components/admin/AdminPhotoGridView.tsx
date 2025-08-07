import { Photo } from '@/types/photo';
import SortableAdminPhotoCard from '@/components/SortableAdminPhotoCard';

interface AdminPhotoGridViewProps {
  photos: Photo[];
  viewMode: 'grid' | 'compact';
  onPhotoEdit: (photo: Photo) => void;
  onPhotoDeleted: () => void;
  deletingId: string | null;
  handleDelete: (photo: Photo) => void;
  handlePhotoLongPress: (photo: Photo) => void;
  handlePhotoClick: (photo: Photo) => void;
}

const AdminPhotoGridView = ({
  photos,
  viewMode,
  onPhotoEdit,
  onPhotoDeleted,
  deletingId,
  handleDelete,
  handlePhotoLongPress,
  handlePhotoClick,
}: AdminPhotoGridViewProps) => {
  const gridClasses = viewMode === 'grid'
    ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1 sm:gap-4'
    : 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-1 py-2';

  return (
    <div className={`grid ${gridClasses} transition-[transform,box-shadow] duration-300 content-visibility-auto`}>
      {photos.map((photo) => (
        <SortableAdminPhotoCard
          key={photo.id}
          photo={photo}
          onPhotoEdit={onPhotoEdit}
          onPhotoDeleted={onPhotoDeleted}
          deletingId={deletingId}
          handleDelete={handleDelete}
          handlePhotoLongPress={handlePhotoLongPress}
          handlePhotoClick={handlePhotoClick}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
};

export default AdminPhotoGridView;
