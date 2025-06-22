
import { useState } from 'react';
import { Camera, Grid, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PhotoGrid from '@/components/PhotoGrid';
import ValueProposition from '@/components/ValueProposition';
import DemoGallery from '@/components/DemoGallery';
import { PhotoSelectionProvider } from '@/contexts/PhotoSelectionContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const Index = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { user, authReady } = useAuth();

  return (
    <PhotoSelectionProvider>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Camera className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">Photo Garden</h1>
                  <p className="text-sm text-emerald-600">Keeper</p>
                </div>
              </div>
              
              <nav className="flex items-center space-x-2">
                {user && (
                  <Button 
                    variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Grid className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Grid</span>
                  </Button>
                )}
                
                <Link to={user ? "/admin" : "/auth"}>
                  <Button variant="outline" size="sm" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                    <User className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">{user ? 'Admin' : 'Sign In'}</span>
                  </Button>
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Show different content based on authentication status */}
        {authReady && !user ? (
          <>
            {/* Value Proposition for unauthenticated users */}
            <ValueProposition />
            
            {/* Demo Gallery */}
            <DemoGallery />
          </>
        ) : (
          <>
            {/* Hero Section - only for authenticated users */}
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
          </>
        )}

        {/* Enhanced Footer */}
        <footer className="bg-gray-900 text-white py-12 px-4 mt-16">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-emerald-600 rounded-lg">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">Photo Garden Keeper</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  Professional photo management for saree businesses. Upload, organize, tag, and share your beautiful collection with ease.
                </p>
                <p className="text-sm text-gray-500">
                  Built for fashion retailers who value beautiful presentation and efficient inventory management.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Features</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>Photo Upload & Organization</li>
                  <li>Fabric & Price Tagging</li>
                  <li>WhatsApp Sharing</li>
                  <li>Stock Management</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>Getting Started Guide</li>
                  <li>Best Practices</li>
                  <li>Customer Support</li>
                  <li>Business Tips</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 pt-6 text-center">
              <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                <span>© 2024 Photo Garden Keeper • All rights reserved</span>
                <div className="flex space-x-6 mt-4 md:mt-0">
                  <span>Privacy Policy</span>
                  <span>•</span>
                  <span>Terms of Service</span>
                  <span>•</span>
                  <span>Contact Us</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </PhotoSelectionProvider>
  );
};

export default Index;
