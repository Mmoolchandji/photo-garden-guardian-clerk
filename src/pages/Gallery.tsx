import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, AlertTriangle, ExternalLink, Camera } from 'lucide-react';
import { ShareablePhoto } from '@/utils/sharing/types';
import SharedGalleryPhotoCard from '@/components/SharedGalleryPhotoCard';

interface SharedGallery {
  id: string;
  title: string;
  photos: ShareablePhoto[];
  created_at: string;
  expires_at: string;
  include_business_info: boolean;
  watermark: boolean;
}

const Gallery = () => {
  const { galleryId } = useParams<{ galleryId: string }>();

  const { data: gallery, isLoading, error } = useQuery({
    queryKey: ['gallery', galleryId],
    queryFn: async () => {
      if (!galleryId) throw new Error('Gallery ID is required');
      
      const { data, error } = await supabase
        .from('shared_galleries')
        .select('*')
        .eq('id', galleryId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Gallery not found');
      
      // Convert the JSON photos to ShareablePhoto array with proper type casting
      const gallery: SharedGallery = {
        ...data,
        photos: (data.photos as unknown) as ShareablePhoto[]
      };
      
      return gallery;
    },
    enabled: !!galleryId,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isExpired = gallery && new Date(gallery.expires_at) < new Date();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (error || !gallery) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center p-8">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Gallery Not Found</h1>
            <p className="text-gray-600 mb-6">
              This shared photo link is no longer available or is invalid.
            </p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Visit Our Store
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center p-8">
            <Clock className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Gallery Expired</h1>
            <p className="text-gray-600 mb-2">
              This shared gallery link has expired.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Expired on: {formatDate(gallery.expires_at)}
            </p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Visit Our Store
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
                {gallery.title}
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(gallery.created_at)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>Expires: {formatDate(gallery.expires_at)}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 px-2 py-1 rounded-full font-medium">
                  <Camera className="h-4 w-4" />
                  <span>{gallery.photos.length} Photos</span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="flex-shrink-0"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit Store
            </Button>
          </div>
        </div>
      </header>

      {/* Gallery Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {gallery.photos.map((photo) => (
            <SharedGalleryPhotoCard key={photo.id} photo={photo} />
          ))}
        </div>
      </main>

      {/* Business Info Footer */}
      {gallery.include_business_info && (
        <footer className="bg-gray-800 dark:bg-black text-white mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
            <h3 className="text-xl font-semibold mb-2">Interested in our collection?</h3>
            <p className="text-gray-300 mb-6">
              Contact us for pricing, availability, and custom orders!
            </p>
            <Button
              onClick={() => window.location.href = '/'}
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Visit Our Store
            </Button>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Gallery;
