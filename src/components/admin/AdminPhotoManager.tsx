
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AdminPhotoGrid from '@/components/AdminPhotoGrid';
import PhotoUpload from '@/components/PhotoUpload';
import PhotoEdit from '@/components/PhotoEdit';
import SearchAndFilters, { FilterState } from '@/components/SearchAndFilters';
import AdminPhotoEmptyState from '@/components/AdminPhotoEmptyState';
import useURLFilters from '@/hooks/useURLFilters';

interface AdminPhotoManagerProps {
  onPhotoEdit: (photo: any) => void;
  onPhotoDeleted: () => void;
  showUpload: boolean;
  setShowUpload: (show: boolean) => void;
  editingPhoto: any;
  setEditingPhoto: (photo: any) => void;
  onPhotoUpdated: () => void;
  onPhotosUpdated: () => void;
  photos: any[];
  loadingPhotos: boolean;
}

const AdminPhotoManager = ({
  onPhotoEdit,
  onPhotoDeleted,
  showUpload,
  setShowUpload,
  editingPhoto,
  setEditingPhoto,
  onPhotoUpdated,
  onPhotosUpdated,
  photos,
  loadingPhotos,
}: AdminPhotoManagerProps) => {
  // Filter state for admin panel (persisted in URL)
  const { filters, updateFilters, clearAllFilters } = useURLFilters();

  const handlePhotoUploaded = () => setShowUpload(false);
  const handlePhotoEditDone = () => onPhotoUpdated();
  const handleBulkEditDone = () => onPhotosUpdated();

  // Modal logic moved here for reusability
  if (showUpload) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <PhotoUpload 
          onPhotoUploaded={handlePhotoUploaded}
          onCancel={() => setShowUpload(false)}
        />
      </div>
    );
  }

  if (editingPhoto) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <PhotoEdit 
          photo={editingPhoto}
          onPhotoUpdated={handlePhotoEditDone}
          onCancel={() => setEditingPhoto(null)}
        />
      </div>
    );
  }

  return (
    <>
      {/* Filter panel */}
      <div className="mb-8">
        <SearchAndFilters
          filters={filters}
          onChange={updateFilters}
          onClearAll={clearAllFilters}
        />
      </div>

      {/* Photos grid & empty state */}
      <Card>
        <CardHeader>
          <CardTitle>Your Photo Gallery Management</CardTitle>
          <CardDescription>
            Manage your personal photos - edit details, delete, or add new ones
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingPhotos ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your photos...</p>
            </div>
          ) : (
            <>
              {photos.length === 0 ? (
                <AdminPhotoEmptyState />
              ) : (
                // Forward onPhotoEdit/onPhotoDeleted/onPhotosUpdated to AdminPhotoGrid
                <AdminPhotoGrid
                  photos={photos}
                  onPhotoEdit={onPhotoEdit}
                  onPhotoDeleted={onPhotoDeleted}
                  onPhotosUpdated={handleBulkEditDone}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default AdminPhotoManager;
