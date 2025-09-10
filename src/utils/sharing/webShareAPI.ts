
import { toast } from '@/hooks/use-toast';
import { ShareablePhoto } from './types';
import { canShareFiles } from './deviceDetection';
import { formatWhatsAppMessage, formatMultiplePhotosMessage } from './messageFormatting';
import { fetchImageAsBlob } from './imageUtils';

// Browser/platform limits for Web Share API
const WEB_SHARE_LIMITS = {
  MAX_FILES: 10, // Most browsers limit to ~10 files via Web Share API
  MAX_TOTAL_SIZE: 25 * 1024 * 1024, // 25MB total size limit for most platforms
  MAX_SINGLE_FILE_SIZE: 5 * 1024 * 1024, // 5MB per file limit
};

// Enhanced multi-photo Web Share API implementation with better limit handling
export const shareMultipleViaWebShareAPI = async (photos: ShareablePhoto[]): Promise<boolean> => {
  try {
    console.log('Attempting Web Share API for multiple photos:', photos.length);
    
    // Check if we exceed the browser's file count limit
    if (photos.length > WEB_SHARE_LIMITS.MAX_FILES) {
      console.log(`Too many photos (${photos.length}) for Web Share API. Limit: ${WEB_SHARE_LIMITS.MAX_FILES}`);
      return false; // Don't show toast here, let the caller handle it
    }
    
    // Verify Web Share API support before proceeding
    if (!navigator.share || !navigator.canShare) {
      console.log('Web Share API not supported');
      return false;
    }
    
    const files: File[] = [];
    const failedPhotos: ShareablePhoto[] = [];
    let totalSize = 0;
    
    // Show loading state for file preparation
    const loadingToast = toast({
      title: "Preparing files...",
      description: `Getting ${photos.length} photos ready for sharing`,
    });
    
    // Fetch all images as blobs with size checking
    for (const photo of photos) {
      try {
        const imageBlob = await fetchImageAsBlob(photo.imageUrl);
        if (imageBlob) {
          // Check individual file size
          if (imageBlob.size > WEB_SHARE_LIMITS.MAX_SINGLE_FILE_SIZE) {
            console.log(`Photo ${photo.title} too large: ${imageBlob.size} bytes`);
            failedPhotos.push(photo);
            continue;
          }
          
          // Check total size
          if (totalSize + imageBlob.size > WEB_SHARE_LIMITS.MAX_TOTAL_SIZE) {
            console.log(`Total size would exceed limit. Current: ${totalSize}, Adding: ${imageBlob.size}`);
            failedPhotos.push(photo);
            continue;
          }
          
          const extension = imageBlob.type.split('/')[1] || 'jpg';
          const fileName = `${photo.title.replace(/[^a-zA-Z0-9]/g, '_')}.${extension}`;
          const file = new File([imageBlob], fileName, { type: imageBlob.type });
          files.push(file);
          totalSize += imageBlob.size;
        } else {
          failedPhotos.push(photo);
        }
      } catch (error) {
        console.error(`Failed to prepare ${photo.title}:`, error);
        failedPhotos.push(photo);
      }
    }

    loadingToast.dismiss();

    if (files.length === 0) {
      console.log('No images could be fetched for sharing');
      toast({
        title: "Unable to prepare files",
        description: "Could not prepare any photos for file sharing",
        variant: "destructive",
      });
      return false;
    }

    const shareData = {
      title: `${photos.length} Beautiful Sarees`,
      text: '',
      files: files,
    };

    // Double-check if sharing files is supported with actual data
    if (!navigator.canShare(shareData)) {
      console.log('File sharing not supported with this data');
      return false;
    }

    // Attempt the share
    await navigator.share(shareData);
    console.log(`Successfully shared ${files.length} photos via Web Share API`);
    
    if (failedPhotos.length > 0) {
      toast({
        title: "Partial file sharing",
        description: `${files.length} photos shared as files. ${failedPhotos.length} couldn't be prepared.`,
      });
    }
    
    return true;
    
  } catch (error) {
    console.error('Multi-photo Web Share API error:', error);
    
    if (error.name === 'AbortError') {
      console.log('User cancelled the share');
      return true; // User cancellation is considered "successful" handling
    }
    
    // Handle specific Web Share API errors
    if (error.name === 'DataError') {
      console.log('Web Share API data error - likely file format or size issue');
      toast({
        title: "File sharing issue",
        description: "Some files couldn't be shared due to format or size limits",
        variant: "destructive",
      });
    } else if (error.name === 'NotAllowedError') {
      console.log('Web Share API not allowed - likely due to security restrictions');
      toast({
        title: "Sharing not allowed",
        description: "File sharing was blocked by your browser's security settings",
        variant: "destructive",
      });
    }
    
    return false;
  }
};

// Enhanced Web Share API implementation
export const shareViaWebShareAPI = async (photo: ShareablePhoto): Promise<boolean> => {
  try {
    console.log('Attempting Web Share API for photo:', photo.title);
    
    // Verify Web Share API support
    if (!navigator.share || !navigator.canShare) {
      console.log('Web Share API not supported');
      return false;
    }
    
    console.log('🔄 [Web Share API] Fetching image blob for:', photo.imageUrl);
    const imageBlob = await fetchImageAsBlob(photo.imageUrl);
    if (!imageBlob) {
      console.log('❌ [Web Share API] Failed to fetch image blob, falling back to URL sharing');
      return false;
    }
    console.log('✅ [Web Share API] Image blob fetched successfully - Size:', imageBlob.size);

    // Check file size for single photo
    if (imageBlob.size > WEB_SHARE_LIMITS.MAX_SINGLE_FILE_SIZE) {
      console.log(`Photo too large for file sharing: ${imageBlob.size} bytes`);
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
    if (!navigator.canShare(shareData)) {
      console.log('File sharing not supported, trying text-only share');
      
      // Fallback to text-only sharing if file sharing isn't supported
      const textShareData = {
        title: photo.title,
        text: `${formatWhatsAppMessage(photo)}\n\n${photo.imageUrl}`,
      };
      
      if (navigator.canShare(textShareData)) {
        await navigator.share(textShareData);
        console.log('Successfully shared text via Web Share API');
        return true;
      }
      
      return false;
    }
    
    await navigator.share(shareData);
    console.log('Successfully shared via Web Share API');
    return true;
    
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

// Export the limits for use in other components
export { WEB_SHARE_LIMITS };
