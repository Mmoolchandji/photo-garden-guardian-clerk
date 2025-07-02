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
}

const BulkActionToolbar = ({ onPhotosDeleted }: BulkActionToolbarProps) => {
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
    } catch (error: unknown) {
      console.error('Bulk delete error:', error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        title: "Delete failed",
        description: errorMessage || "Failed to delete photos. Please try again.",
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
      <div className="fixed bottom-0 left-0 right-0 sm:bottom-6 sm:left-1/2 sm:transform sm:-translate-x-1/2 z-50">
        <div className="bg-white border-t sm:border sm:rounded-lg sm:shadow-lg px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between sm:justify-start sm:space-x-4">
          <div className="text-sm font-medium text-gray-900">
            {getSelectedCount()} photo{getSelectedCount() > 1 ? 's' : ''} selected
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden sm:block h-4 w-px bg-gray-300" />

            {/* Edit Selected button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkEditStart}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              disabled={isDeleting}
            >
              <Edit3 className="h-5 w-5 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Edit Selected</span>
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
                  <Trash2 className="h-5 w-5 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Delete Selected</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="w-[90vw] max-w-[400px] sm:max-w-lg">
                <AlertDialogHeader className="p-4 sm:p-6">
                  <AlertDialogTitle className="flex items-center justify-center space-x-2 text-lg sm:text-xl">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <span>Delete {getSelectedCount()} Photo{getSelectedCount() > 1 ? 's' : ''}?</span>
                  </AlertDialogTitle>
                  <AlertDialogDescription className="px-4 pb-4 text-sm sm:px-6 sm:pb-6 sm:text-base">
                    This action cannot be undone. This will permanently delete the selected 
                    photo{getSelectedCount() > 1 ? 's' : ''} from your gallery and remove 
                    {getSelectedCount() > 1 ? ' them' : ' it'} from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-4 sm:p-6">
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
              <X className="h-5 w-5 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Cancel</span>
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
            }
          }}
          photos={selectedPhotos}
          onPhotoUpdated={onPhotosDeleted}
        />
      )}
    </>
  );
};

export default BulkActionToolbar;
