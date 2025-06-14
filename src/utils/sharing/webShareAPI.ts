
import { toast } from '@/hooks/use-toast';
import { ShareablePhoto } from './types';
import { canShareFiles } from './deviceDetection';
import { formatWhatsAppMessage, formatIndividualPhotoMessage, delay } from './messageFormatting';
import { fetchImageAsBlob } from './imageUtils';

// Browser/platform limits for Web Share API
const WEB_SHARE_LIMITS = {
  MAX_FILES: 10, // Most browsers limit to ~10 files via Web Share API
  MAX_TOTAL_SIZE: 25 * 1024 * 1024, // 25MB total size limit for most platforms
  MAX_SINGLE_FILE_SIZE: 5 * 1024 * 1024, // 5MB per file limit
};

// Enhanced multi-photo Web Share API implementation with individual messages
export const shareMultipleViaWebShareAPI = async (photos: ShareablePhoto[]): Promise<boolean> => {
  try {
    console.log('Attempting Web Share API for multiple photos:', photos.length);
    
    // Check if we exceed the browser's file count limit
    if (photos.length > WEB_SHARE_LIMITS.MAX_FILES) {
      console.log(`Too many photos (${photos.length}) for Web Share API. Limit: ${WEB_SHARE_LIMITS.MAX_FILES}`);
      return false;
    }
    
    // Verify Web Share API support before proceeding
    if (!navigator.share || !navigator.canShare) {
      console.log('Web Share API not supported');
      return false;
    }
    
    // Show loading state for file preparation
    const loadingToast = toast({
      title: "Preparing files...",
      description: `Getting ${photos.length} photos ready for sharing`,
    });
    
    // Share each photo individually with its own message
    let successCount = 0;
    const failedPhotos: ShareablePhoto[] = [];
    
    for (const [index, photo] of photos.entries()) {
      try {
        const imageBlob = await fetchImageAsBlob(photo.imageUrl);
        if (!imageBlob) {
          failedPhotos.push(photo);
          continue;
        }
        
        // Check individual file size
        if (imageBlob.size > WEB_SHARE_LIMITS.MAX_SINGLE_FILE_SIZE) {
          console.log(`Photo ${photo.title} too large: ${imageBlob.size} bytes`);
          failedPhotos.push(photo);
          continue;
        }
        
        const extension = imageBlob.type.split('/')[1] || 'jpg';
        const fileName = `${photo.title.replace(/[^a-zA-Z0-9]/g, '_')}.${extension}`;
        const file = new File([imageBlob], fileName, { type: imageBlob.type });
        
        const shareData = {
          title: photo.title,
          text: formatIndividualPhotoMessage(photo),
          files: [file],
        };

        // Check if sharing files is supported
        if (!navigator.canShare(shareData)) {
          console.log('File sharing not supported for this photo');
          failedPhotos.push(photo);
          continue;
        }

        // Attempt the share for this individual photo
        await navigator.share(shareData);
        console.log(`Successfully shared photo ${index + 1}: ${photo.title}`);
        successCount++;
        
        // Add delay between shares to avoid rate limiting (except for last photo)
        if (index < photos.length - 1) {
          await delay(1500); // 1.5 second delay between shares
        }
        
      } catch (error) {
        console.error(`Failed to share ${photo.title}:`, error);
        
        if (error.name === 'AbortError') {
          console.log('User cancelled the share');
          break; // Stop if user cancels
        }
        
        failedPhotos.push(photo);
      }
    }

    loadingToast.dismiss();

    if (successCount === 0) {
      console.log('No images could be shared');
      return false;
    }

    // Show success message
    if (successCount === photos.length) {
      toast({
        title: "All photos shared! 🎉",
        description: `Successfully shared ${successCount} photos individually to WhatsApp`,
      });
    } else {
      toast({
        title: "Partial sharing completed",
        description: `${successCount} of ${photos.length} photos shared successfully`,
      });
    }
    
    return true;
    
  } catch (error) {
    console.error('Multi-photo Web Share API error:', error);
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
    
    const imageBlob = await fetchImageAsBlob(photo.imageUrl);
    if (!imageBlob) {
      console.log('Failed to fetch image blob, falling back to URL sharing');
      return false;
    }

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
