
import { toast } from '@/hooks/use-toast';
import { ShareablePhoto } from './types';
import { canShareFiles } from './deviceDetection';
import { formatWhatsAppMessage, formatMultiplePhotosMessage } from './messageFormatting';
import { fetchImageAsBlob } from './imageUtils';

// Enhanced multi-photo Web Share API implementation
export const shareMultipleViaWebShareAPI = async (photos: ShareablePhoto[]): Promise<boolean> => {
  try {
    console.log('Attempting Web Share API for multiple photos:', photos.length);
    
    const files: File[] = [];
    const failedPhotos: ShareablePhoto[] = [];
    
    // Fetch all images as blobs
    for (const photo of photos) {
      const imageBlob = await fetchImageAsBlob(photo.imageUrl);
      if (imageBlob) {
        const extension = imageBlob.type.split('/')[1] || 'jpg';
        const fileName = `${photo.title.replace(/[^a-zA-Z0-9]/g, '_')}.${extension}`;
        const file = new File([imageBlob], fileName, { type: imageBlob.type });
        files.push(file);
      } else {
        failedPhotos.push(photo);
      }
    }

    if (files.length === 0) {
      console.log('No images could be fetched for sharing');
      return false;
    }

    const shareData = {
      title: `${photos.length} Beautiful Sarees`,
      text: formatMultiplePhotosMessage(photos),
      files: files,
    };

    // Check if sharing files is supported
    if (navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData);
      console.log('Successfully shared multiple photos via Web Share API');
      
      if (failedPhotos.length > 0) {
        toast({
          title: "Partial success",
          description: `${files.length} photos shared successfully. ${failedPhotos.length} failed to load.`,
        });
      }
      
      return true;
    }
    
    console.log('File sharing not supported, trying text-only share');
    return false;
    
  } catch (error) {
    console.error('Multi-photo Web Share API error:', error);
    
    if (error.name === 'AbortError') {
      console.log('User cancelled the share');
      return true;
    }
    
    return false;
  }
};

// Enhanced Web Share API implementation
export const shareViaWebShareAPI = async (photo: ShareablePhoto): Promise<boolean> => {
  try {
    console.log('Attempting Web Share API for photo:', photo.title);
    
    const imageBlob = await fetchImageAsBlob(photo.imageUrl);
    if (!imageBlob) {
      console.log('Failed to fetch image blob, falling back to URL sharing');
      return false;
    }

    // Create file with proper extension based on blob type
    const extension = imageBlob.type.split('/')[1] || 'jpg';
    const fileName = `${photo.title.replace(/[^a-zA-Z0-9]/g, '_')}.${extension}`;
    const file = new File([imageBlob], fileName, { type: imageBlob.type });
    
    const shareData = {
      title: photo.title,
      text: formatWhatsAppMessage(photo),
      files: [file],
    };

    // Check if sharing files is supported
    if (navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData);
      console.log('Successfully shared via Web Share API');
      return true;
    }
    
    console.log('File sharing not supported, trying text-only share');
    
    // Fallback to text-only sharing if file sharing isn't supported
    const textShareData = {
      title: photo.title,
      text: `${formatWhatsAppMessage(photo)}\n\n${photo.imageUrl}`,
    };
    
    if (navigator.canShare && navigator.canShare(textShareData)) {
      await navigator.share(textShareData);
      console.log('Successfully shared text via Web Share API');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Web Share API error:', error);
    
    // Handle specific error types
    if (error.name === 'AbortError') {
      console.log('User cancelled the share');
      return true; // Don't show error for user cancellation
    }
    
    return false;
  }
};
