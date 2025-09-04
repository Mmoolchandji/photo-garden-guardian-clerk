
import { toast } from '@/hooks/use-toast';
import { ShareablePhoto } from './types';
import { isMobileDevice, canShareFiles, getNativeSharingCapabilities } from './deviceDetection';
import { shareMultipleViaWebShareAPI, shareViaWebShareAPI } from './webShareAPI';
import { shareMultipleViaWhatsAppURL, shareViaWhatsAppURL } from './whatsappURL';
import { shareBatchedToWhatsApp } from './batchedSharing';
import { shareGalleryToWhatsApp } from './gallerySharing';
import { sharePhotoNatively, shareMultiplePhotosNatively, isNativeSharingAvailable } from './nativeSharing';

// Re-export types and utilities
export type { ShareablePhoto };
export { isMobileDevice, isIOSDevice, canShareFiles, getNativeSharingCapabilities } from './deviceDetection';
export { formatWhatsAppMessage, formatMultiplePhotosMessage } from './messageFormatting';
export { shareBatchedToWhatsApp } from './batchedSharing';
export { shareGalleryToWhatsApp } from './gallerySharing';
export { sharePhotoNatively, shareMultiplePhotosNatively, isNativeSharingAvailable } from './nativeSharing';

// Enhanced main sharing function for multiple photos with hybrid approach
export const shareMultipleToWhatsApp = async (
  photos: ShareablePhoto[], 
  method: 'auto' | 'files' | 'batched' | 'gallery' = 'auto'
): Promise<void> => {
  console.log(`Starting WhatsApp share for ${photos.length} photos using method: ${method}`);
  
  try {
    const loadingToast = toast({
      title: "Preparing to share...",
      description: `Setting up ${photos.length} photos for WhatsApp share`,
    });

    let success = false;

    // Determine the sharing method
    let finalMethod = method;
    if (method === 'auto') {
      if (photos.length <= 10) {
        finalMethod = 'files';
      } else if (photos.length <= 25) {
        finalMethod = 'batched';
      } else {
        finalMethod = 'gallery';
      }
    }

    // Execute the chosen method
    switch (finalMethod) {
      case 'files':
        // Prioritize native sharing for mobile apps
        if (isNativeSharingAvailable() && photos.length <= 10) {
          console.log('Using native Capacitor sharing for files');
          success = await shareMultiplePhotosNatively(photos);
        }
        // Fallback to Web Share API
        if (!success && photos.length <= 10 && isMobileDevice() && canShareFiles()) {
          console.log('Using Web Share API for files');
          success = await shareMultipleViaWebShareAPI(photos);
        }
        // Final fallback to WhatsApp URL
        if (!success) {
          console.log('Falling back to WhatsApp URL sharing for files');
          success = shareMultipleViaWhatsAppURL(photos);
        }
        break;

      case 'batched':
        console.log('Using batched sharing');
        success = await shareBatchedToWhatsApp(photos, true);
        break;

      case 'gallery':
        console.log('Using gallery sharing');
        success = await shareGalleryToWhatsApp(photos);
        break;

      default:
        throw new Error('Invalid sharing method');
    }
    
    loadingToast.dismiss();
    
    if (!success) {
      throw new Error('All sharing methods failed');
    }
    
  } catch (error) {
    console.error('Hybrid sharing failed:', error);
    
    toast({
      title: "Sharing failed",
      description: "Unable to share photos. Please try a different method.",
      variant: "destructive",
    });
  }
};

// Main sharing function with progressive fallback and loading states
export const shareToWhatsApp = async (photo: ShareablePhoto): Promise<void> => {
  console.log('Starting WhatsApp share for:', photo.title);
  
  try {
    // Show loading toast for better UX
    const loadingToast = toast({
      title: "Preparing to share...",
      description: "Setting up your WhatsApp share",
    });

    // Progressive fallback strategy - prioritize native sharing
    if (isNativeSharingAvailable()) {
      console.log('Trying native Capacitor sharing');
      const nativeSuccess = await sharePhotoNatively(photo);
      
      if (nativeSuccess) {
        loadingToast.dismiss();
        toast({
          title: "Photo shared successfully",
          description: "Your saree photo has been shared via the native app",
        });
        return;
      }
    }
    
    // Fallback to Web Share API
    if (isMobileDevice() && canShareFiles()) {
      console.log('Trying Web Share API on mobile device');
      const webShareSuccess = await shareViaWebShareAPI(photo);
      
      if (webShareSuccess) {
        loadingToast.dismiss();
        return;
      }
    }
    
    // Fallback to WhatsApp URL schemes
    console.log('Falling back to WhatsApp URL sharing');
    const urlShareSuccess = shareViaWhatsAppURL(photo);
    
    loadingToast.dismiss();
    
    if (urlShareSuccess) {
      // Show success message for URL sharing
      toast({
        title: "Opening WhatsApp",
        description: "Redirecting to WhatsApp to share your saree",
      });
    } else {
      throw new Error('All sharing methods failed');
    }
    
  } catch (error) {
    console.error('All WhatsApp sharing methods failed:', error);
    
    // Enhanced error handling with specific messages
    let errorMessage = "Sharing via WhatsApp is not supported on this device or browser.";
    let errorDescription = "Please try copying the image URL manually.";
    
    if (error.message?.includes('network')) {
      errorMessage = "Network error occurred";
      errorDescription = "Please check your internet connection and try again.";
    } else if (error.message?.includes('cors')) {
      errorMessage = "Image sharing temporarily unavailable";
      errorDescription = "You can still share the link via WhatsApp Web.";
    }
    
    toast({
      title: errorMessage,
      description: errorDescription,
      variant: "destructive",
    });
  }
};
