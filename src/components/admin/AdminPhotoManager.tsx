
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AdminPhotoGrid from '@/components/AdminPhotoGrid';
import PhotoUpload from '@/components/PhotoUpload';
import PhotoEdit from '@/components/PhotoEdit';
import SearchAndFilters, { FilterState } from '@/components/SearchAndFilters';
import AdminPhotoEmptyState from '@/components/AdminPhotoEmptyState';
import useURLFilters from '@/hooks/useURLFilters';
import { usePhotoData } from '@/hooks/usePhotoData';

interface AdminPhotoManagerProps {
  onPhotoEdit: (photo: any) => void;
  onPhotoDeleted: () => void;
  onPhotoUpdated: () => void;
  onPhotosUpdated: () => void;
  showUpload: boolean;
  setShowUpload: (show: boolean) => void;
  editingPhoto: any;
  setEditingPhoto: (photo: any) => void;
}

const AdminPhotoManager = ({
  onPhotoEdit,
  onPhotoDeleted,
  onPhotoUpdated,
  onPhotosUpdated,
  showUpload,
  setShowUpload,
  editingPhoto,
  setEditingPhoto,
}: AdminPhotoManagerProps) => {
  // Filter state for admin panel (persisted in URL)
  const { filters, updateFilters, clearAllFilters } = useURLFilters();
  const { photos, loading: loadingPhotos } = usePhotoData(filters);

  const handlePhotoUploaded = () => {
    setShowUpload(false);
    onPhotosUpdated(); // Refresh after upload
  };

  const handlePhotoEditUpdated = () => {
    onPhotoUpdated(); // This will close modal and refresh
  };

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
          onPhotoUpdated={handlePhotoEditUpdated}
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
                <AdminPhotoGrid
                  photos={photos}
                  onPhotoEdit={onPhotoEdit}
                  onPhotoDeleted={onPhotoDeleted}
                  onPhotosUpdated={onPhotosUpdated}
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
