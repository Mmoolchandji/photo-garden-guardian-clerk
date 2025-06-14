
import { Camera, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const PhotoEmptyState = () => {
  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <Camera className="h-10 w-10 text-emerald-600" />
          </div>
        </div>
        <h4 className="text-2xl font-bold text-gray-900 mb-4">
          Create Your Personal Photo Garden
        </h4>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Start building your professional saree collection today. Upload, organize, 
          and share beautiful photos of your inventory with smart tagging and instant sharing features.
        </p>
        <Link to="/auth">
          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
            Sign In to Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PhotoEmptyState;
