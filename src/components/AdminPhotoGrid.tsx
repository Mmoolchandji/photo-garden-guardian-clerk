
import { useState } from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdminPhotoSelection } from '@/contexts/AdminPhotoSelectionContext';
import { useLongPress } from '@/hooks/useLongPress';
import { Photo } from '@/types/photo';
import BulkActionToolbar from './BulkActionToolbar';

interface AdminPhotoGridProps {
  photos: Photo[];
  onPhotoEdit: (photo: Photo) => void;
  onPhotoDeleted: () => void;
}

const AdminPhotoGrid = ({ photos, onPhotoEdit, onPhotoDeleted }: AdminPhotoGridProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  const {
    isSelectionMode,
    selectedPhotoIds,
    isPhotoSelected,
    togglePhoto,
    selectAll,
    clearSelection,
    getSelectedCount,
    enterSelectionMode,
    exitSelectionMode
  } = useAdminPhotoSelection();

  const handleDelete = async (photo: Photo) => {
    if (!confirm(`Are you sure you want to delete "${photo.title}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(photo.id);

    try {
      // Delete from database first
      const { error: dbError } = await supabase
        .from('photos')
        .delete()
        .eq('id', photo.id);

      if (dbError) {
        throw dbError;
      }

      // Extract file path from URL and delete from storage
      const url = new URL(photo.image_url);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(-2).join('/'); // Get 'photos/filename.ext'

      const { error: storageError } = await supabase.storage
        .from('photos')
        .remove([filePath]);

      if (storageError) {
        console.warn('Storage deletion error:', storageError);
        // Don't throw here as the database deletion was successful
      }

      toast({
        title: "Photo deleted successfully!",
        description: "The photo has been removed from your gallery.",
      });

      onPhotoDeleted();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSelectAll = () => {
    if (selectedPhotoIds.size === photos.length) {
      clearSelection();
    } else {
      selectAll(photos);
    }
  };

  // Long press/tap to start selection mode and select, tap to toggle select/deselect
  const handlePhotoLongPress = (photo: Photo) => {
    if (!isSelectionMode) {
      enterSelectionMode();
      togglePhoto(photo);
    }
  };

  const handlePhotoClick = (photo: Photo) => {
    if (isSelectionMode) {
      togglePhoto(photo);
    }
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No photos yet</h3>
        <p className="text-gray-500">Start building your gallery by adding your first photo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selection Header */}
      <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">
        <div className="flex items-center space-x-3">
          <Checkbox
            checked={photos.length > 0 && selectedPhotoIds.size === photos.length}
            onCheckedChange={handleSelectAll}
            className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
          />
          <label className="text-sm font-medium text-gray-700">
            Select All ({photos.length} photos)
          </label>
        </div>
        
        {isSelectionMode && (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {getSelectedCount()} of {photos.length} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={exitSelectionMode}
            >
              Cancel Selection
            </Button>
          </div>
        )}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <AdminPhotoCard
            key={photo.id}
            photo={photo}
            onPhotoEdit={onPhotoEdit}
            onPhotoDeleted={onPhotoDeleted}
            deletingId={deletingId}
            handleDelete={handleDelete}
            handlePhotoLongPress={handlePhotoLongPress}
            handlePhotoClick={handlePhotoClick}
          />
        ))}
      </div>
    </div>
  );
};

interface AdminPhotoCardProps {
  photo: Photo;
  onPhotoEdit: (photo: Photo) => void;
  onPhotoDeleted: () => void;
  deletingId: string | null;
  handleDelete: (photo: Photo) => void;
  handlePhotoLongPress: (photo: Photo) => void;
  handlePhotoClick: (photo: Photo) => void;
}

const AdminPhotoCard = ({
  photo,
  onPhotoEdit,
  deletingId,
  handleDelete,
  handlePhotoLongPress,
  handlePhotoClick,
}: AdminPhotoCardProps) => {
  const { isPhotoSelected, isSelectionMode } = useAdminPhotoSelection();
  const isSelected = isPhotoSelected(photo.id);

  const longPressHandlers = useLongPress({
    onLongPress: () => handlePhotoLongPress(photo),
    onClick: () => handlePhotoClick(photo),
    delay: 500,
  });

  return (
    <div
      {...longPressHandlers}
      className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer select-none ${
        isSelected
          ? 'border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50 scale-[1.02]'
          : 'border-gray-200 hover:scale-[1.01]'
      }`}
      style={{ touchAction: 'manipulation' }}
    >
      <div className="relative">
        <img
          src={photo.image_url}
          alt={photo.title}
          className="w-full h-48 object-cover"
          draggable={false}
        />
        {isSelected && (
          <div className="absolute inset-0 bg-emerald-500/20 animate-fade-in" />
        )}
      </div>
      <div className="p-4">
        <h3
          className={`font-semibold mb-1 truncate transition-colors ${
            isSelected ? 'text-emerald-600' : 'text-gray-900'
          }`}
        >
          {photo.title}
        </h3>
        {photo.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {photo.description}
          </p>
        )}
        <div className="text-xs text-gray-400 mb-3">
          {new Date(photo.created_at).toLocaleDateString()}
        </div>
        {!isSelectionMode && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onPhotoEdit(photo);
              }}
              className="flex-1"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(photo);
              }}
              disabled={deletingId === photo.id}
              className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              {deletingId === photo.id ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPhotoGrid;
