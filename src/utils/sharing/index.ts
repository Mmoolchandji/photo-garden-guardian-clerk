
import { toast } from '@/hooks/use-toast';
import { ShareablePhoto } from './types';
import { isMobileDevice, canShareFiles, getNativeSharingCapabilities } from './deviceDetection';
import { shareMultipleViaWebShareAPI, shareViaWebShareAPI } from './webShareAPI';
import { shareMultipleViaWhatsAppURL, shareViaWhatsAppURL } from './whatsappURL';
import { shareBatchedToWhatsApp } from './batchedSharing';
import { shareGalleryToWhatsApp } from './gallerySharing';
import { sharePhotoNatively, shareMultiplePhotosNatively, isNativeSharingAvailable } from './nativeSharing';
import { debugLog, debugError } from './debugLogger';

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

// Main sharing function with progressive fallback and comprehensive debugging
export const shareToWhatsApp = async (photo: ShareablePhoto): Promise<void> => {
  debugLog('🚀 Starting WhatsApp share', { 
    title: photo.title, 
    imageUrl: photo.imageUrl,
    capabilities: getNativeSharingCapabilities()
  });
  
  try {
    // Show loading toast for better UX
    const loadingToast = toast({
      title: "Preparing to share...",
      description: "Setting up your WhatsApp share",
    });

    // Progressive fallback strategy - prioritize native sharing for mobile apps
    if (isNativeSharingAvailable()) {
      debugLog('🔄 Attempting native Capacitor sharing');
      
      try {
        const nativeSuccess = await sharePhotoNatively(photo);
        
        if (nativeSuccess) {
          loadingToast.dismiss();
          debugLog('✅ Native sharing successful');
          toast({
            title: "Photo shared successfully",
            description: "Your saree photo has been shared via the native app",
          });
          return;
        } else {
          debugError('❌ Native sharing failed, trying fallbacks');
        }
      } catch (nativeError) {
        debugError('❌ Native sharing threw an error', nativeError);
      }
    } else {
      debugLog('ℹ️ Native sharing not available');
    }
    
    // Fallback to Web Share API on mobile devices
    if (isMobileDevice() && canShareFiles()) {
      debugLog('🔄 Attempting Web Share API on mobile device');
      
      try {
        const webShareSuccess = await shareViaWebShareAPI(photo);
        
        if (webShareSuccess) {
          loadingToast.dismiss();
          debugLog('✅ Web Share API successful');
          toast({
            title: "Photo shared successfully",
            description: "Your photo has been shared",
          });
          return;
        } else {
          debugError('❌ Web Share API failed, trying URL fallback');
        }
      } catch (webShareError) {
        debugError('❌ Web Share API threw an error', webShareError);
      }
    } else {
      debugLog('ℹ️ Web Share API not available or not on mobile');
    }
    
    // Final fallback to WhatsApp URL schemes
    debugLog('🔄 Falling back to WhatsApp URL sharing');
    try {
      const urlShareSuccess = shareViaWhatsAppURL(photo);
      
      loadingToast.dismiss();
      
      if (urlShareSuccess) {
        debugLog('✅ URL sharing initiated');
        toast({
          title: "Opening WhatsApp",
          description: "Redirecting to WhatsApp to share your saree",
        });
        return;
      } else {
        debugError('❌ URL sharing failed');
        throw new Error('All sharing methods failed');
      }
    } catch (urlError) {
      debugError('❌ URL sharing threw an error', urlError);
      throw urlError;
    }
    
  } catch (error) {
    debugError('❌ All WhatsApp sharing methods failed', error);
    
    // Enhanced error handling with specific messages
    let errorMessage = "Unable to share photo";
    let errorDescription = "Please try again or use a different sharing method.";
    
    const errorString = error?.toString?.() || '';
    
    if (errorString.includes('network') || errorString.includes('fetch')) {
      errorMessage = "Network error occurred";
      errorDescription = "Please check your internet connection and try again.";
    } else if (errorString.includes('cors') || errorString.includes('CORS')) {
      errorMessage = "Image sharing temporarily unavailable";
      errorDescription = "You can try sharing the link instead.";
    } else if (errorString.includes('AbortError') || errorString.includes('timeout')) {
      errorMessage = "Request timed out";
      errorDescription = "Please try again with a stable internet connection.";
    }
    
    toast({
      title: errorMessage,
      description: errorDescription,
      variant: "destructive",
    });
  }
};
