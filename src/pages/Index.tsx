
import { useState } from 'react';
import { Camera, Grid, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PhotoGrid from '@/components/PhotoGrid';
import { Link } from 'react-router-dom';

const Index = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Camera className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Photo Garden</h1>
                <p className="text-sm text-emerald-600">Keeper</p>
              </div>
            </div>
            
            <nav className="flex items-center space-x-4">
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setViewMode('grid')}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Grid className="h-4 w-4 mr-2" />
                Grid
              </Button>
              
              <Link to="/admin">
                <Button variant="outline" size="sm" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                  <User className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Curated Garden
            <span className="text-emerald-600 block">Photography</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Discover the beauty of nature through carefully curated garden photography. 
            Each image tells a story of growth, beauty, and the wonder of the natural world.
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
              Fresh Content
            </span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
              High Quality
            </span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
              Curated Collection
            </span>
          </div>
        </div>
      </section>

      {/* Photo Gallery with Search & Filters */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <PhotoGrid viewMode={viewMode} />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 mt-16">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-2 bg-emerald-600 rounded-lg">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold">Photo Garden Keeper</h3>
          </div>
          <p className="text-gray-400 mb-6">
            Preserving the beauty of nature, one photograph at a time.
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <span>© 2024 Photo Garden Keeper</span>
            <span>•</span>
            <span>All rights reserved</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
