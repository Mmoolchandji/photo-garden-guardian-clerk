
import { usePhotoSelection } from '@/contexts/PhotoSelectionContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

interface PhotoGridHeaderProps {
  photosCount: number;
}

const PhotoGridHeader = ({ photosCount }: PhotoGridHeaderProps) => {
  const { isSelectionMode } = usePhotoSelection();
  const { user, authReady } = useAuth();

  if (!authReady) {
    return (
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Loading Session...
        </h3>
        <p className="text-gray-600">
          Restoring your session, please wait...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to Photo Garden
        </h3>
        <p className="text-gray-600">
          Please sign in to view and manage your personal photo gallery.
        </p>
      </div>
    );
  }

  // return (
  //   <>
  //   <div className="mb-0 p-4">
  //     <h3 className="text-2xl font-bold text-gray-900 mb-2">
  //       {/* {isSelectionMode ? 'Select Photos' : 'Your Personal Gallery'} */}
  //     </h3>
  //     <p className="text-gray-600">
  //       {/* {isSelectionMode && ` • Long press to start selection mode`} */}
  //     </p>
  //   </div>
  //   </>
  // );
};

export default PhotoGridHeader;
