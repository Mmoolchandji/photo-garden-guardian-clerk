import { useState } from 'react';
import { Trash2, X, AlertTriangle, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAdminPhotoSelection } from '@/contexts/AdminPhotoSelectionContext';
import BulkEditModal from './BulkEditModal';

interface BulkActionToolbarProps {
  onPhotosDeleted: () => void;
  onPhotosUpdated: () => void;
}

const BulkActionToolbar = ({ onPhotosDeleted, onPhotosUpdated }: BulkActionToolbarProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { toast } = useToast();
  const {
    selectedPhotos,
    getSelectedCount,
    exitSelectionMode,
    clearSelection
  } = useAdminPhotoSelection();

  const handleBulkDelete = async () => {
    if (selectedPhotos.length === 0) return;

    setIsDeleting(true);

    try {
      // Extract photo IDs and file paths for deletion
      const photoIds = selectedPhotos.map(photo => photo.id);
      const filePaths = selectedPhotos.map(photo => {
        const url = new URL(photo.image_url);
        const pathParts = url.pathname.split('/');
        return pathParts.slice(-2).join('/'); // Get 'photos/filename.ext'
      });

      // Delete from database first
      const { error: dbError } = await supabase
        .from('photos')
        .delete()
        .in('id', photoIds);

      if (dbError) {
        throw dbError;
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('photos')
        .remove(filePaths);

      if (storageError) {
        console.warn('Storage deletion error:', storageError);
        // Don't throw here as the database deletion was successful
      }

      toast({
        title: "Photos deleted successfully!",
        description: `${selectedPhotos.length} photo${selectedPhotos.length > 1 ? 's' : ''} removed from your gallery.`,
      });

      // Clear selection and exit selection mode
      clearSelection();
      exitSelectionMode();
      onPhotosDeleted();
    } catch (error: any) {
      console.error('Bulk delete error:', error);
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete photos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkEditStart = () => {
    setShowEditModal(true);
  };

  if (getSelectedCount() === 0) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-6 py-4 flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="text-sm font-medium text-gray-900">
              {getSelectedCount()} photo{getSelectedCount() > 1 ? 's' : ''} selected
            </div>
            
            <div className="h-4 w-px bg-gray-300" />

            {/* Edit Selected button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkEditStart}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              disabled={isDeleting}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Selected
            </Button>

            {/* Existing Delete code */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isDeleting}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <span>Delete {getSelectedCount()} Photo{getSelectedCount() > 1 ? 's' : ''}?</span>
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the selected 
                    photo{getSelectedCount() > 1 ? 's' : ''} from your gallery and remove 
                    {getSelectedCount() > 1 ? ' them' : ' it'} from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBulkDelete}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Photos'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            {/* Cancel/Exit */}
            <Button
              variant="ghost"
              size="sm"
              onClick={exitSelectionMode}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </div>
      {/* Bulk Edit Modal */}
      {showEditModal && (
        <BulkEditModal
          open={showEditModal}
          onClose={(refresh) => {
            setShowEditModal(false);
            if (refresh) {
              clearSelection();
              exitSelectionMode();
              onPhotosDeleted();
              onPhotosUpdated();
            }
          }}
          photos={selectedPhotos}
          onPhotosUpdated={onPhotosUpdated}
        />
      )}
    </>
  );
};

export default BulkActionToolbar;
