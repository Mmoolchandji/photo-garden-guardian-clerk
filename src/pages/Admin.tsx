import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { usePhotoData } from '@/hooks/usePhotoData';
import useURLFilters from '@/hooks/useURLFilters';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminStatsCards from '@/components/admin/AdminStatsCards';
import AdminActionButtons from '@/components/admin/AdminActionButtons';
import AdminPhotoManager from '@/components/admin/AdminPhotoManager';
import { AdminPhotoSelectionProvider } from '@/contexts/AdminPhotoSelectionContext';

const Admin = () => {
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [showUpload, setShowUpload] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const { filters } = useURLFilters();
  const { photos, loading: loadingPhotos, refetch } = usePhotoData(filters);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You've been signed out successfully.",
      });
      navigate('/auth');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePhotoEdit = (photo) => {
    setEditingPhoto(photo);
  };

  const handlePhotoDeleted = () => {
    // PhotoData hook will auto-refresh due to filter dependency
  };

  const handleDataRefresh = () => {
    refetch();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null; // Will redirect to auth page

  return (
    <AdminPhotoSelectionProvider>
      <div className="min-h-screen bg-gray-50">
        <AdminHeader userEmail={user.email} onSignOut={handleSignOut} />
        <div className="container mx-auto px-4 py-8">
          <AdminStatsCards photos={photos} />
          <AdminActionButtons
            loadingPhotos={loadingPhotos}
            onUploadPhoto={() => setShowUpload(true)}
            onRefresh={() => {
              // Force refetch by updating filters (idempotent)
              const { filters, updateFilters } = useURLFilters();
              updateFilters({ ...filters });
            }}
          />
          <AdminPhotoManager
            onPhotoEdit={handlePhotoEdit}
            onPhotoDeleted={handlePhotoDeleted}
            showUpload={showUpload}
            setShowUpload={setShowUpload}
            editingPhoto={editingPhoto}
            setEditingPhoto={setEditingPhoto}
            onDataRefresh={handleDataRefresh}
          />
        </div>
      </div>
    </AdminPhotoSelectionProvider>
  );
};

export default Admin;
