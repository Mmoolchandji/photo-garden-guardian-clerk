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
import { useViewMode } from '@/contexts/ViewModeContext';

interface PhotoGridProps {}

const PhotoGrid = ({}: PhotoGridProps) => {
  const { viewMode } = useViewMode();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const { filters, updateFilters, clearAllFilters } = useURLFilters();
  const { 
    isSelectionMode,
    selectAll,
    clearSelection,
    selectedPhotoIds,
  } = usePhotoSelection();
  const { photos, loading, refetch } = usePhotoData(filters);

  const handleSelectAll = () => {
    if (selectedPhotoIds.size === photos.length) {
      clearSelection();
    } else {
      selectAll(photos.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        image_url: p.image_url,
        created_at: p.created_at,
        price: p.price,
        user_id: p.user_id,
        legacy: p.legacy,
      })));
    }
  };

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
        onSelectAll={handleSelectAll}
        isAllSelected={selectedPhotoIds.size === photos.length && photos.length > 0}
        isSelectionMode={isSelectionMode}
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
        isOpen={!!selectedPhoto && !isSelectionMode}
        onClose={() => setSelectedPhoto(null)}
        onPhotoUpdated={refetch}
      />
    </>
  );
};

export default PhotoGrid;