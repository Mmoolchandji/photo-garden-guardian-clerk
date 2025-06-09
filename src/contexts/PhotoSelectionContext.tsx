
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Photo } from '@/types/photo';
import { WEB_SHARE_LIMITS } from '@/utils/sharing/webShareAPI';

interface PhotoSelectionContextType {
  selectedPhotos: Photo[];
  isSelectionMode: boolean;
  totalSelectedSize: number;
  addPhoto: (photo: Photo) => void;
  removePhoto: (photoId: string) => void;
  togglePhoto: (photo: Photo) => void;
  clearSelection: () => void;
  selectAll: (photos: Photo[]) => void;
  enterSelectionMode: () => void;
  exitSelectionMode: () => void;
  isPhotoSelected: (photoId: string) => boolean;
  canAddMore: () => boolean;
  exceedsFileShareLimit: () => boolean;
}

const PhotoSelectionContext = createContext<PhotoSelectionContextType | undefined>(undefined);

// Use more realistic limits based on common platform constraints
const MAX_PHOTOS = 99; // Keep high limit for link sharing
const MAX_SIZE_BYTES = WEB_SHARE_LIMITS.MAX_TOTAL_SIZE; // Use the Web Share API limit

// Estimate image size (rough calculation based on typical image compression)
const estimateImageSize = (imageUrl: string): number => {
  // Rough estimate: assume average compressed image is ~500KB
  // In a real app, you might want to fetch actual file sizes
  return 500 * 1024; // 500KB per image
};

export const PhotoSelectionProvider = ({ children }: { children: ReactNode }) => {
  const [selectedPhotos, setSelectedPhotos] = useState<Photo[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const totalSelectedSize = selectedPhotos.reduce((total, photo) => {
    return total + estimateImageSize(photo.image_url);
  }, 0);

  const addPhoto = (photo: Photo) => {
    if (selectedPhotos.length >= MAX_PHOTOS) return;
    if (totalSelectedSize + estimateImageSize(photo.image_url) > MAX_SIZE_BYTES) return;
    
    setSelectedPhotos(prev => [...prev, photo]);
  };

  const removePhoto = (photoId: string) => {
    setSelectedPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const togglePhoto = (photo: Photo) => {
    if (isPhotoSelected(photo.id)) {
      removePhoto(photo.id);
    } else {
      addPhoto(photo);
    }
  };

  const clearSelection = () => {
    setSelectedPhotos([]);
    setIsSelectionMode(false);
  };

  const selectAll = (photos: Photo[]) => {
    const photosToSelect = [];
    let currentSize = 0;
    
    for (const photo of photos) {
      if (photosToSelect.length >= MAX_PHOTOS) break;
      const photoSize = estimateImageSize(photo.image_url);
      if (currentSize + photoSize > MAX_SIZE_BYTES) break;
      
      photosToSelect.push(photo);
      currentSize += photoSize;
    }
    
    setSelectedPhotos(photosToSelect);
  };

  const enterSelectionMode = () => {
    setIsSelectionMode(true);
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    clearSelection();
  };

  const isPhotoSelected = (photoId: string) => {
    return selectedPhotos.some(p => p.id === photoId);
  };

  const canAddMore = () => {
    return selectedPhotos.length < MAX_PHOTOS && 
           totalSelectedSize < MAX_SIZE_BYTES;
  };

  const exceedsFileShareLimit = () => {
    return selectedPhotos.length > WEB_SHARE_LIMITS.MAX_FILES;
  };

  return (
    <PhotoSelectionContext.Provider value={{
      selectedPhotos,
      isSelectionMode,
      totalSelectedSize,
      addPhoto,
      removePhoto,
      togglePhoto,
      clearSelection,
      selectAll,
      enterSelectionMode,
      exitSelectionMode,
      isPhotoSelected,
      canAddMore,
      exceedsFileShareLimit,
    }}>
      {children}
    </PhotoSelectionContext.Provider>
  );
};

export const usePhotoSelection = () => {
  const context = useContext(PhotoSelectionContext);
  if (context === undefined) {
    throw new Error('usePhotoSelection must be used within a PhotoSelectionProvider');
  }
  return context;
};
