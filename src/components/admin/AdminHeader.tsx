
import { Link } from 'react-router-dom';
import { ArrowLeft, Camera, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminHeaderProps {
  userEmail: string;
  onSignOut: () => void;
}

const AdminHeader = ({ userEmail, onSignOut }: AdminHeaderProps) => (
  <header className="bg-white border-b border-gray-200">
    <div className="container mx-auto px-4 py-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:space-x-4">
          <Link to="/" className="self-start">
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
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Your Personal Gallery</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3 self-end md:self-center">
          <Button variant="outline" size="sm" className="flex-shrink-0">
            <User className="h-4 w-4 mr-2" />
            <span className="truncate max-w-xs">{userEmail}</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={onSignOut} className="flex-shrink-0">
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  </header>
);

export default AdminHeader;
