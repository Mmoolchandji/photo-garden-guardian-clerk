import { ShareablePhoto } from './types';
import { isMobileDevice, isIOSDevice, isStandalonePWA, canShareFiles, canShareFilesStrict } from './deviceDetection';
import { formatWhatsAppMessage, formatMultiplePhotosMessage } from './messageFormatting';
import { shareMultipleViaWebShareAPI, shareViaWebShareAPI } from './webShareAPI';
import { shareBatchedToWhatsApp } from './batchedSharing';
import { toast } from '@/hooks/use-toast';

// Re-export types and utilities
export type { ShareablePhoto } from './types';
export { isMobileDevice, isIOSDevice, isStandalonePWA, canShareFiles, canShareFilesStrict } from './deviceDetection';
export { formatWhatsAppMessage, formatMultiplePhotosMessage } from './messageFormatting';
export { shareBatchedToWhatsApp } from './batchedSharing';

export const shareMultipleToWhatsApp = async (
  photos: ShareablePhoto[]
): Promise<boolean> => {
  if (photos.length === 0) return false;

  console.log(`Sharing ${photos.length} photos via WhatsApp using file sharing`);
  
  toast({
    title: "Preparing to share...",
    description: `Getting ${photos.length} photos ready for WhatsApp`,
  });

  try {
    // Only use Web Share API for actual file sharing
    if (!canShareFilesStrict()) {
      toast({
        title: "File sharing not supported",
        description: "Your device doesn't support sharing image files. Please save images and share manually.",
        variant: "destructive",
      });
      return false;
    }

    return await shareMultipleViaWebShareAPI(photos);
  } catch (error) {
    console.error('File sharing failed:', error);
    
    toast({
      title: "Sharing failed",
      description: "Unable to share image files. Please try saving images manually.",
      variant: "destructive",
    });
    
    return false;
  }
};

export const shareToWhatsApp = async (photo: ShareablePhoto): Promise<boolean> => {
  console.log('Sharing single photo to WhatsApp');
  
  toast({
    title: "Preparing to share...",
    description: "Getting your photo ready for WhatsApp",
  });

  try {
    // Only use Web Share API for actual file sharing
    if (!canShareFiles()) {
      toast({
        title: "File sharing not supported",
        description: "Your device doesn't support sharing image files. Please save the image and share manually.",
        variant: "destructive",
      });
      return false;
    }

    console.log('Attempting Web Share API for file sharing');
    const webShareResult = await shareViaWebShareAPI(photo);
    
    if (webShareResult) {
      return true;
    }
    
    toast({
      title: "Sharing failed", 
      description: "Unable to share image file. Please try saving the image manually.",
      variant: "destructive",
    });
    return false;
    
  } catch (error) {
    console.error('Single photo sharing error:', error);
    
    // Enhanced error handling
    let errorMessage = "Unable to share photo file. Please try again.";
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = "Network error. Please check your connection and try again.";
    } else if (error instanceof Error && error.message.includes('CORS')) {
      errorMessage = "Image access error. Please try refreshing the page.";
    }
    
    toast({
      title: "File sharing failed",
      description: errorMessage,
      variant: "destructive",
    });
    
    return false;
  }
};