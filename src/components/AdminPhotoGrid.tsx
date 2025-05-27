
import { useState } from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Photo {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  created_at: string;
}

interface AdminPhotoGridProps {
  photos: Photo[];
  onPhotoEdit: (photo: Photo) => void;
  onPhotoDeleted: () => void;
}

const AdminPhotoGrid = ({ photos, onPhotoEdit, onPhotoDeleted }: AdminPhotoGridProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

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
    } catch (error: any) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="relative">
            <img
              src={photo.image_url}
              alt={photo.title}
              className="w-full h-48 object-cover"
            />
          </div>
          
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-1 truncate">
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
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPhotoEdit(photo)}
                className="flex-1"
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(photo)}
                disabled={deletingId === photo.id}
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                {deletingId === photo.id ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminPhotoGrid;
