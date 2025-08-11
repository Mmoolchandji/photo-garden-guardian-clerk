
import { useState } from 'react';
import { Photo } from '@/types/photo';
import FloatingShareButton from './FloatingShareButton';
import EnhancedShareOptionsModal from './EnhancedShareOptionsModal';
import { usePhotoSelection } from '@/contexts/PhotoSelectionContext';
import { shareMultipleToWhatsApp, shareBatchedToWhatsApp } from '@/utils/sharing';
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
    await shareMultipleToWhatsApp(shareablePhotos);
  };

  const handleShareBatched = async () => {
    const shareablePhotos = transformPhotosToShareable(selectedPhotos);
    setShowShareModal(false);
    await shareBatchedToWhatsApp(shareablePhotos, true);
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
      />
    </>
  );
};

export default PhotoGridShareActions;
