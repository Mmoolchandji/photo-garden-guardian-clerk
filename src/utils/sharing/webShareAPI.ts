
import { toast } from '@/hooks/use-toast';
import { ShareablePhoto } from './types';
import { canShareFiles } from './deviceDetection';
import { formatWhatsAppMessage, formatIndividualPhotoMessage } from './messageFormatting';
import { fetchImageAsBlob } from './imageUtils';

// Browser/platform limits for Web Share API
const WEB_SHARE_LIMITS = {
  MAX_FILES: 10, // Most browsers limit to ~10 files via Web Share API
  MAX_TOTAL_SIZE: 25 * 1024 * 1024, // 25MB total size limit for most platforms
  MAX_SINGLE_FILE_SIZE: 5 * 1024 * 1024, // 5MB per file limit
};

// Create a combined message for multiple photos in Web Share API
const formatCombinedWebShareMessage = (photos: ShareablePhoto[]): string => {
  let message = `✨ Beautiful Saree Collection (${photos.length} photos)\n\n`;
  
  photos.forEach((photo, index) => {
    message += `${index + 1}. *${photo.title}*`;
    if (photo.price) {
      message += ` - ₹${photo.price.toLocaleString('en-IN')}`;
    }
    message += '\n';
  });
  
  message += '\n📸 View our complete collection at our gallery!';
  
  return message;
};

// Fixed multi-photo Web Share API implementation - shares all files at once
export const shareMultipleViaWebShareAPI = async (photos: ShareablePhoto[]): Promise<boolean> => {
  try {
    console.log('Attempting Web Share API for multiple photos (combined share):', photos.length);
    
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
    
    const loadingToast = toast({
      title: "Preparing files...",
      description: `Getting ${photos.length} photos ready for sharing`,
    });
    
    const files: File[] = [];
    let totalSize = 0;
    const failedPhotos: string[] = [];
    
    // Fetch all images and create files
    for (const photo of photos) {
      try {
        const imageBlob = await fetchImageAsBlob(photo.imageUrl);
        if (!imageBlob) {
          console.log(`Failed to fetch image for ${photo.title}`);
          failedPhotos.push(photo.title);
          continue;
        }
        
        // Check individual file size
        if (imageBlob.size > WEB_SHARE_LIMITS.MAX_SINGLE_FILE_SIZE) {
          console.log(`Photo ${photo.title} too large: ${imageBlob.size} bytes`);
          failedPhotos.push(photo.title);
          continue;
        }
        
        // Check total size
        if (totalSize + imageBlob.size > WEB_SHARE_LIMITS.MAX_TOTAL_SIZE) {
          console.log(`Adding ${photo.title} would exceed total size limit`);
          failedPhotos.push(photo.title);
          continue;
        }
        
        const extension = imageBlob.type.split('/')[1] || 'jpg';
        const fileName = `${photo.title.replace(/[^a-zA-Z0-9]/g, '_')}.${extension}`;
        const file = new File([imageBlob], fileName, { type: imageBlob.type });
        
        files.push(file);
        totalSize += imageBlob.size;
        
      } catch (error) {
        console.error(`Failed to process ${photo.title}:`, error);
        failedPhotos.push(photo.title);
      }
    }
    
    loadingToast.dismiss();
    
    if (files.length === 0) {
      console.log('No photos could be prepared for sharing');
      toast({
        title: "No photos to share",
        description: "All photos failed to load or were too large.",
        variant: "destructive",
      });
      return false;
    }
    
    // Show warning if some photos failed
    if (failedPhotos.length > 0) {
      toast({
        title: `${failedPhotos.length} photos couldn't be included`,
        description: `Sharing ${files.length} photos instead. Failed: ${failedPhotos.slice(0, 3).join(', ')}${failedPhotos.length > 3 ? '...' : ''}`,
      });
    }
    
    // Filter photos to only include successfully processed ones
    const successfulPhotos = photos.filter(photo => !failedPhotos.includes(photo.title));
    
    // Create combined share data with all files
    const shareData = {
      title: `Saree Collection (${files.length} photos)`,
      text: formatCombinedWebShareMessage(successfulPhotos),
      files: files,
    };
    
    // Check if sharing multiple files is supported
    if (!navigator.canShare(shareData)) {
      console.log('Multiple file sharing not supported, trying text-only share');
      
      // Fallback to text-only sharing if file sharing isn't supported
      const textShareData = {
        title: shareData.title,
        text: shareData.text,
      };
      
      if (navigator.canShare(textShareData)) {
        await navigator.share(textShareData);
        console.log('Successfully shared text via Web Share API');
        toast({
          title: "Shared collection info! 📝",
          description: "Photos shared as text. Recipients can view images via gallery link.",
        });
        return true;
      }
      
      return false;
    }
    
    // Share all files at once
    await navigator.share(shareData);
    console.log('Successfully shared multiple files via Web Share API');
    
    toast({
      title: "Photos shared! 🎉",
      description: `${files.length} photos shared with prices included`,
    });
    
    return true;
    
  } catch (error) {
    console.error('Multi-photo Web Share API error:', error);
    
    // Handle specific error types
    if (error.name === 'AbortError') {
      console.log('User cancelled the share');
      return true; // Don't show error for user cancellation
    }
    
    return false;
  }
};

// Enhanced Web Share API implementation for single photo
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
