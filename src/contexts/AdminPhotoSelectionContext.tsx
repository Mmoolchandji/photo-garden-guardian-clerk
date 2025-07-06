import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface Photo {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  created_at: string;
  user_id: string;
  legacy?: boolean;
}

interface AdminPhotoSelectionContextType {
  selectedPhotoIds: Set<string>;
  isSelectionMode: boolean;
  isSortingMode: boolean;
  selectedPhotos: Photo[];
  selectPhoto: (photo: Photo) => void;
  deselectPhoto: (photoId: string) => void;
  togglePhoto: (photo: Photo) => void;
  selectAll: (photos: Photo[]) => void;
  clearSelection: () => void;
  enterSelectionMode: () => void;
  exitSelectionMode: () => void;
  enterSortingMode: () => void;
  exitSortingMode: () => void;
  isPhotoSelected: (photoId: string) => boolean;
  getSelectedCount: () => number;
}

const AdminPhotoSelectionContext = createContext<AdminPhotoSelectionContextType | undefined>(undefined);

interface AdminPhotoSelectionProviderProps {
  children: ReactNode;
}

export const AdminPhotoSelectionProvider = ({ children }: AdminPhotoSelectionProviderProps) => {
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isSortingMode, setIsSortingMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Photo[]>([]);

  const selectPhoto = (photo: Photo) => {
    setSelectedPhotoIds(prev => new Set(prev).add(photo.id));
    setSelectedPhotos(prev => {
      const exists = prev.find(p => p.id === photo.id);
      return exists ? prev : [...prev, photo];
    });
  };

  const deselectPhoto = (photoId: string) => {
    setSelectedPhotoIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(photoId);
      return newSet;
    });
    setSelectedPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const togglePhoto = (photo: Photo) => {
    if (selectedPhotoIds.has(photo.id)) {
      deselectPhoto(photo.id);
    } else {
      selectPhoto(photo);
    }
  };

  const selectAll = (photos: Photo[]) => {
    setSelectedPhotoIds(new Set(photos.map(p => p.id)));
    setSelectedPhotos([...photos]);
  };

  const clearSelection = () => {
    setSelectedPhotoIds(new Set());
    setSelectedPhotos([]);
  };

  const enterSelectionMode = () => {
    setIsSelectionMode(true);
    setIsSortingMode(false); // Exit sorting mode when entering selection mode
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    clearSelection();
  };

  const enterSortingMode = () => {
    setIsSortingMode(true);
    setIsSelectionMode(false); // Exit selection mode when entering sorting mode
    clearSelection(); // Clear any selections
  };

  const exitSortingMode = () => {
    setIsSortingMode(false);
  };

  const isPhotoSelected = (photoId: string) => {
    return selectedPhotoIds.has(photoId);
  };

  const getSelectedCount = () => {
    return selectedPhotoIds.size;
  };

  // Auto-exit selection mode when no photos are selected
  React.useEffect(() => {
    if (isSelectionMode && selectedPhotoIds.size === 0) {
      setIsSelectionMode(false);
    }
  }, [selectedPhotoIds.size, isSelectionMode]);

  const value: AdminPhotoSelectionContextType = {
    selectedPhotoIds,
    isSelectionMode,
    isSortingMode,
    selectedPhotos,
    selectPhoto,
    deselectPhoto,
    togglePhoto,
    selectAll,
    clearSelection,
    enterSelectionMode,
    exitSelectionMode,
    enterSortingMode,
    exitSortingMode,
    isPhotoSelected,
    getSelectedCount,
  };

  return (
    <AdminPhotoSelectionContext.Provider value={value}>
      {children}
    </AdminPhotoSelectionContext.Provider>
  );
};

export const useAdminPhotoSelection = () => {
  const context = useContext(AdminPhotoSelectionContext);
  if (context === undefined) {
    throw new Error('useAdminPhotoSelection must be used within an AdminPhotoSelectionProvider');
  }
  return context;
};
