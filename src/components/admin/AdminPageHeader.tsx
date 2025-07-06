import { Link } from 'react-router-dom';
import { ArrowLeft, Camera, Plus, RefreshCw, LogOut, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Photo } from '@/types/photo';
import { useAdminPhotoSelection } from '@/contexts/AdminPhotoSelectionContext';

interface AdminPageHeaderProps {
  userEmail: string;
  onSignOut: () => void;
  photos: Photo[];
  loadingPhotos: boolean;
  onUploadPhoto: () => void;
  onRefresh: () => void;
}

const AdminPageHeader = ({
  userEmail,
  onSignOut,
  photos,
  loadingPhotos,
  onUploadPhoto,
  onRefresh,
}: AdminPageHeaderProps) => {
  const { 
    isSortingMode, 
    isSelectionMode, 
    enterSortingMode, 
    exitSortingMode 
  } = useAdminPhotoSelection();

  const handleSortingToggle = () => {
    if (isSortingMode) {
      exitSortingMode();
    } else {
      enterSortingMode();
    }
  };
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        {/* Desktop Header */}
        <div className="hidden sm:flex items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Camera className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500 truncate max-w-[200px]">{userEmail}</p>
            </div>
          </div>
          <div className="flex items-center justify-end space-x-2">
            <Button variant="outline" size="sm" className="flex items-center">
              <Camera className="h-4 w-4 mr-2" />
              <span>{photos.length}</span>
            </Button>
            <Button 
              variant={isSortingMode ? "default" : "outline"} 
              size="sm" 
              onClick={handleSortingToggle}
              disabled={isSelectionMode}
              className={isSortingMode ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              {isSortingMode ? "Done" : "Reorder"}
            </Button>
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={loadingPhotos || isSortingMode}>
              <RefreshCw className={`h-4 w-4 ${loadingPhotos ? 'animate-spin' : ''}`} />
            </Button>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700" 
              onClick={onUploadPhoto}
              disabled={isSortingMode}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                <Camera className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500 truncate max-w-[200px]">{userEmail}</p>
                </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
          <div className="mt-4 flex items-center justify-between gap-2">
            <Link to="/" className="flex-1">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Gallery
                </Button>
            </Link>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex items-center">
                    <Camera className="h-4 w-4 mr-2" />
                    <span>{photos.length}</span>
                </Button>
                <Button 
                  variant={isSortingMode ? "default" : "outline"} 
                  size="sm" 
                  onClick={handleSortingToggle}
                  disabled={isSelectionMode}
                  className={isSortingMode ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={onRefresh} disabled={loadingPhotos || isSortingMode}>
                    <RefreshCw className={`h-4 w-4 ${loadingPhotos ? 'animate-spin' : ''}`} />
                </Button>
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700" 
                  size="icon" 
                  onClick={onUploadPhoto}
                  disabled={isSortingMode}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminPageHeader;
