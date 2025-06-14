import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, AlertTriangle, ExternalLink } from 'lucide-react';
import { ShareablePhoto } from '@/utils/sharing/types';

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{gallery.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Shared: {formatDate(gallery.created_at)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Expires: {formatDate(gallery.expires_at)}
                </div>
                <div className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium">
                  {gallery.photos.length} Photos
                </div>
              </div>
            </div>
            <Button 
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Visit Store
            </Button>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {gallery.photos.map((photo, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square relative">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{photo.title}</h3>
                {photo.price && (
                  <p className="text-emerald-600 font-bold text-lg">
                    ₹{photo.price.toLocaleString('en-IN')}
                  </p>
                )}
                {photo.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{photo.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Business Info Footer */}
      {gallery.include_business_info && (
        <div className="bg-white border-t mt-12">
          <div className="max-w-6xl mx-auto px-4 py-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Interested in our collection?</h3>
            <p className="text-gray-600 mb-4">Contact us for pricing, availability, and custom orders!</p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Visit Our Store
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
