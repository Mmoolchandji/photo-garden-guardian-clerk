
import { Eye } from 'lucide-react';

const AdminPhotoEmptyState = () => (
  <div className="text-center py-12">
    <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">No photos found</h3>
    <p className="text-gray-500">
      No photos match your current filters.<br />
      Try adjusting your search or filter settings.
    </p>
  </div>
);

export default AdminPhotoEmptyState;
