
import { useState } from 'react';
import { Photo } from '@/types/photo';
import FloatingShareButton from './FloatingShareButton';
import EnhancedShareOptionsModal from './EnhancedShareOptionsModal';
import { usePhotoSelection } from '@/contexts/PhotoSelectionContext';
import { shareMultipleToWhatsApp, shareBatchedToWhatsApp, shareGalleryToWhatsApp } from '@/utils/sharing';
import { transformPhotosToShareable } from '@/utils/photoTransform';

const PhotoGridShareActions = () => {
  const [showShareModal, setShowShareModal] = useState(false);
  const { selectedPhotos } = usePhotoSelection();

  const handleMultiShare = () => {
    if (selectedPhotos.length === 0) return;
    setShowShareModal(true);
  };

  const handleShareAsFiles = async () => {
    const shareablePhotos = transformPhotosToShareable(selectedPhotos);
    setShowShareModal(false);
    await shareMultipleToWhatsApp(shareablePhotos, 'files');
  };

  const handleShareBatched = async () => {
    const shareablePhotos = transformPhotosToShareable(selectedPhotos);
    setShowShareModal(false);
    await shareBatchedToWhatsApp(shareablePhotos, true);
  };

  const handleShareAsGallery = async () => {
    const shareablePhotos = transformPhotosToShareable(selectedPhotos);
    setShowShareModal(false);
    await shareGalleryToWhatsApp(shareablePhotos);
  };

  return (
    <>
      <FloatingShareButton onShare={handleMultiShare} />
      <EnhancedShareOptionsModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        photos={selectedPhotos}
        onShareAsFiles={handleShareAsFiles}
        onShareBatched={handleShareBatched}
        onShareAsGallery={handleShareAsGallery}
      />
    </>
  );
};

export default PhotoGridShareActions;
