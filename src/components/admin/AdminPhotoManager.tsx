
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AdminPhotoGrid from '@/components/AdminPhotoGrid';
import PhotoUpload from '@/components/PhotoUpload';
import PhotoEdit from '@/components/PhotoEdit';
import InPageBulkUploadView from '@/components/InPageBulkUploadView';
import SearchAndFilters, { FilterState } from '@/components/SearchAndFilters';
import AdminPhotoEmptyState from '@/components/AdminPhotoEmptyState';
import useURLFilters from '@/hooks/useURLFilters';
import { usePhotoData } from '@/hooks/usePhotoData';
import { Photo } from '@/types/photo';

interface AdminPhotoManagerProps {
  onPhotoEdit: (photo: Photo) => void;
  onPhotoDeleted: () => void;
  showUpload: boolean;
  setShowUpload: (show: boolean) => void;
  editingPhoto: Photo | null;
  setEditingPhoto: (photo: Photo | null) => void;
}

const AdminPhotoManager = ({
  onPhotoEdit,
  onPhotoDeleted,
  showUpload,
  setShowUpload,
  editingPhoto,
  setEditingPhoto,
}: AdminPhotoManagerProps) => {
  // State for bulk upload mode
  const [bulkUploadFiles, setBulkUploadFiles] = useState<File[]>([]);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  // Filter state for admin panel (persisted in URL)
  const { filters, updateFilters, clearAllFilters } = useURLFilters();
  const { photos, loading: loadingPhotos } = usePhotoData(filters);

  const handlePhotoUploaded = () => {
    setShowUpload(false);
    // Reset bulk upload state
    setBulkUploadFiles([]);
    setShowBulkUpload(false);
  };

  const handlePhotoUpdated = () => setEditingPhoto(null);

  // Handle bulk upload initiation from PhotoUpload component
  const handleBulkUploadInitiated = (files: File[]) => {
    setBulkUploadFiles(files);
    setShowBulkUpload(true);
    setShowUpload(false); // Hide the single upload UI
  };

  // Handlers for bulk upload actions
  const handleBulkUploadComplete = () => {
    setShowBulkUpload(false);
    setBulkUploadFiles([]);
  };

  const handleBulkUploadCancel = () => {
    setShowBulkUpload(false);
    setBulkUploadFiles([]);
  };

  const handleChooseDifferentFiles = () => {
    setShowBulkUpload(false);
    setBulkUploadFiles([]);
    setShowUpload(true); // Go back to file selection
  };

  // Display bulk upload view
  if (showBulkUpload && bulkUploadFiles.length > 0) {
    return (
      <div className="container mx-auto py-4">
        <InPageBulkUploadView
          files={bulkUploadFiles}
          onUploadComplete={handleBulkUploadComplete}
          onCancel={handleBulkUploadCancel}
          onChooseDifferentFiles={handleChooseDifferentFiles}
        />
      </div>
    );
  }

  // Display single upload view
  if (showUpload) {
    return (
      <div className="container mx-auto py-4 flex items-center justify-center">
        <PhotoUpload 
          onPhotoUploaded={handlePhotoUploaded}
          onCancel={() => setShowUpload(false)}
          onBulkUploadInitiated={handleBulkUploadInitiated}
        />
      </div>
    );
  }

  if (editingPhoto) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <PhotoEdit 
          photo={editingPhoto}
          onPhotoUpdated={handlePhotoUpdated}
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
