
import { useState } from 'react';
import { Photo } from '@/types/photo';
import PhotoModal from './PhotoModal';
import BulkEditModal from './BulkEditModal';
import PhotoLoadingState from './PhotoLoadingState';
import PhotoEmptyState from './PhotoEmptyState';
import PhotoGridView from './PhotoGridView';
import SearchAndFilters from './SearchAndFilters';
import PhotoGridShareActions from './PhotoGridShareActions';
import PhotoGridHeader from './PhotoGridHeader';
import useURLFilters from '@/hooks/useURLFilters';
import { usePhotoSelection } from '@/contexts/PhotoSelectionContext';
import { usePhotoData } from '@/hooks/usePhotoData';
import { transformPhotoToCardData } from '@/utils/photoTransform';

interface PhotoGridProps {
  viewMode: 'grid' | 'list';
}

const PhotoGrid = ({ viewMode }: PhotoGridProps) => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const { filters, updateFilters, clearAllFilters } = useURLFilters();
  const { isSelectionMode } = usePhotoSelection();
  const { photos, loading, refetch } = usePhotoData(filters);

  if (loading) {
    return (
      <PhotoLoadingState
        filters={filters}
        updateFilters={updateFilters}
        clearAllFilters={clearAllFilters}
      />
    );
  }

  return (
    <>
      <SearchAndFilters
        filters={filters}
        onChange={updateFilters}
        onClearAll={clearAllFilters}
        photosCount={photos.length}
      />

      <PhotoGridHeader photosCount={photos.length} />

      {photos.length === 0 ? (
        <PhotoEmptyState />
      ) : (
        <PhotoGridView
          photos={photos}
          viewMode={viewMode}
          onPhotoClick={setSelectedPhoto}
        />
      )}

      <PhotoGridShareActions />

      {/* View Modal */}
      <PhotoModal
        photo={selectedPhoto ? transformPhotoToCardData(selectedPhoto) : null}
        isOpen={!!selectedPhoto && !isSelectionMode && !showEditModal}
        onClose={() => setSelectedPhoto(null)}
        onPhotoUpdated={refetch}
        onEdit={() => {
          if (selectedPhoto) {
            setShowEditModal(true);
          }
        }}
      />

      {/* Edit Modal */}
      {showEditModal && selectedPhoto && (
        <BulkEditModal
          open={showEditModal}
          photos={[selectedPhoto]}
          onClose={(reloadNeeded) => {
            setShowEditModal(false);
            if (reloadNeeded) {
              refetch();
            }
            setSelectedPhoto(null);
          }}
          onPhotoUpdated={refetch}
        />
      )}
    </>
  );
};

export default PhotoGrid;
