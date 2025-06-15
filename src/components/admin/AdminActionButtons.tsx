
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminActionButtonsProps {
  loadingPhotos: boolean;
  onUploadPhoto: () => void;
  onRefresh: () => void;
}

const AdminActionButtons = ({ loadingPhotos, onUploadPhoto, onRefresh }: AdminActionButtonsProps) => (
  <div className="flex flex-wrap gap-4 mb-8">
    <Button
      className="bg-emerald-600 hover:bg-emerald-700"
      onClick={onUploadPhoto}
    >
      <Plus className="h-4 w-4 mr-2" />
      Add New Photo
    </Button>
    <Button
      variant="outline"
      onClick={onRefresh}
      disabled={loadingPhotos}
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${loadingPhotos ? 'animate-spin' : ''}`} />
      Refresh
    </Button>
  </div>
);

export default AdminActionButtons;
