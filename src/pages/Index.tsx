
import { useState } from 'react';
import { Camera, User, LayoutGrid, LayoutList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IconSwitch } from '@/components/ui/icon-switch';
import PhotoGrid from '@/components/PhotoGrid';
import ValueProposition from '@/components/ValueProposition';
import DemoGallery from '@/components/DemoGallery';
import { PhotoSelectionProvider } from '@/contexts/PhotoSelectionContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const Index = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');
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
                  <IconSwitch
                    checked={viewMode === 'compact'}
                    onCheckedChange={(checked) => setViewMode(checked ? 'compact' : 'grid')}
                    iconOn={<LayoutList className="h-4 w-4 text-emerald-600" />}
                    iconOff={<LayoutGrid className="h-4 w-4 text-gray-600" />}
                    aria-label="Toggle view mode"
                  />
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
            {/* Photo Gallery with Search & Filters */}
            <section className="py-4 px-4">
              <div className="container mx-auto px-0 py-0 md:px-4 md:py-4">
                <PhotoGrid viewMode={viewMode} />
              </div>
            </section>
          </>
        )}

        {/* Enhanced Footer */}
        <footer className="bg-gray-900 text-white py-12 px-4">
          <div className="container mx-auto text-center md:text-left">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
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
            
            <div className="border-t border-gray-800 pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                <span>© 2024 Photo Garden Keeper • All rights reserved</span>
                <div className="flex space-x-4 mt-4 md:mt-0">
                  <a href="#" className="hover:text-white">Privacy Policy</a>
                  <a href="#" className="hover:text-white">Terms of Service</a>
                  <a href="#" className="hover:text-white">Contact Us</a>
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
