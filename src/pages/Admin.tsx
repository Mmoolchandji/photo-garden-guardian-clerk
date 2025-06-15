
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, ArrowLeft, User, Plus, Settings, Grid, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { AdminPhotoSelectionProvider } from '@/contexts/AdminPhotoSelectionContext';
import PhotoUpload from '@/components/PhotoUpload';
import PhotoEdit from '@/components/PhotoEdit';
import AdminPhotoGrid from '@/components/AdminPhotoGrid';
import SearchAndFilters, { FilterState } from '@/components/SearchAndFilters';
import useURLFilters from '@/hooks/useURLFilters';
import { usePhotoData } from '@/hooks/usePhotoData';
import AdminPhotoEmptyState from '@/components/AdminPhotoEmptyState';

const Admin = () => {
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Filters state for admin panel (persisted in URL)
  const { filters, updateFilters, clearAllFilters } = useURLFilters();
  const { photos, loading: loadingPhotos } = usePhotoData(filters);

  const [showUpload, setShowUpload] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

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

  const handlePhotoUploaded = () => {
    setShowUpload(false);
    // The usePhotoData hook will auto-refresh due to filter dependency
  };

  const handlePhotoUpdated = () => {
    setEditingPhoto(null);
    // The usePhotoData hook will auto-refresh due to filter dependency
  };

  const handlePhotoDeleted = () => {
    // The usePhotoData hook will auto-refresh due to filter dependency
  };

  const handlePhotoEdit = (photo) => {
    setEditingPhoto(photo);
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

  if (!user) {
    return null; // Will redirect to auth page
  }

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
          onPhotoUpdated={handlePhotoUpdated}
          onCancel={() => setEditingPhoto(null)}
        />
      </div>
    );
  }

  return (
    <AdminPhotoSelectionProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link to="/">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Gallery
                  </Button>
                </Link>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Camera className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-sm text-gray-500">Your Personal Gallery</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  {user.email}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Your Photos</CardTitle>
                <Camera className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{photos.length}</div>
                <p className="text-xs text-gray-500">
                  {photos.length === 0 ? 'Ready to add your first photo' : 'Photos in your gallery'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Legacy Photos</CardTitle>
                <Grid className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{photos.filter(p => p.legacy).length}</div>
                <p className="text-xs text-gray-500">Photos from before user accounts</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                <Settings className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-gray-500">Storage tracking coming soon</p>
              </CardContent>
            </Card>
          </div>

          {/* --- FILTER PANEL: Position between stats and grid as requested --- */}
          <div className="mb-8">
            <SearchAndFilters
              filters={filters}
              onChange={updateFilters}
              onClearAll={clearAllFilters}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => setShowUpload(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Photo
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                // Force refetch by updating filters (idempotent)
                updateFilters({ ...filters });
              }}
              disabled={loadingPhotos}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loadingPhotos ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Photos Management */}
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
                      onPhotoEdit={handlePhotoEdit}
                      onPhotoDeleted={handlePhotoDeleted}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminPhotoSelectionProvider>
  );
};

export default Admin;

// NOTE: This file is now over 300 lines. For maintainability, please consider asking to refactor it into smaller focused files.
