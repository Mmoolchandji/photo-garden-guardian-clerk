
import { toast } from '@/hooks/use-toast';
import { ShareablePhoto } from './types';
import { isMobileDevice, canShareFiles } from './deviceDetection';
import { shareMultipleViaWebShareAPI, shareViaWebShareAPI } from './webShareAPI';
import { shareMultipleViaWhatsAppURL, shareViaWhatsAppURL } from './whatsappURL';

// Re-export types and utilities
export type { ShareablePhoto };
export { isMobileDevice, isIOSDevice, canShareFiles } from './deviceDetection';
export { formatWhatsAppMessage, formatMultiplePhotosMessage } from './messageFormatting';

// Main sharing function for multiple photos
export const shareMultipleToWhatsApp = async (photos: ShareablePhoto[], shareAsFiles: boolean = true): Promise<void> => {
  console.log('Starting WhatsApp share for multiple photos:', photos.length);
  
  try {
    const loadingToast = toast({
      title: "Preparing to share...",
      description: `Setting up ${photos.length} photos for WhatsApp share`,
    });

    if (shareAsFiles && isMobileDevice() && canShareFiles()) {
      console.log('Trying Web Share API for multiple photos on mobile device');
      const webShareSuccess = await shareMultipleViaWebShareAPI(photos);
      
      if (webShareSuccess) {
        loadingToast.dismiss();
        return;
      }
    }
    
    console.log('Falling back to WhatsApp URL sharing for multiple photos');
    const urlShareSuccess = shareMultipleViaWhatsAppURL(photos);
    
    loadingToast.dismiss();
    
    if (urlShareSuccess) {
      toast({
        title: "Opening WhatsApp",
        description: `Redirecting to WhatsApp to share ${photos.length} photos`,
      });
    } else {
      throw new Error('All sharing methods failed');
    }
    
  } catch (error) {
    console.error('All WhatsApp sharing methods failed for multiple photos:', error);
    
    toast({
      title: "Sharing failed",
      description: "Unable to share multiple photos. Please try sharing them individually.",
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

    // Progressive fallback strategy
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
