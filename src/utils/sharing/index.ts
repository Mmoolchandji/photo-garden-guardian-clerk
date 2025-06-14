
import { toast } from '@/hooks/use-toast';
import { ShareablePhoto } from './types';
import { isMobileDevice, canShareFiles } from './deviceDetection';
import { shareMultipleViaWebShareAPI, shareViaWebShareAPI } from './webShareAPI';
import { shareMultipleViaWhatsAppURL, shareViaWhatsAppURL } from './whatsappURL';
import { shareBatchedToWhatsApp } from './batchedSharing';
import { shareGalleryToWhatsApp } from './gallerySharing';

// Re-export types and utilities
export type { ShareablePhoto };
export { isMobileDevice, isIOSDevice, canShareFiles } from './deviceDetection';
export { formatWhatsAppMessage, formatMultiplePhotosMessage, formatIndividualPhotoMessage } from './messageFormatting';
export { shareBatchedToWhatsApp } from './batchedSharing';
export { shareGalleryToWhatsApp } from './gallerySharing';

// Helper function to format file sizes
const formatFileSize = (bytes: number): string => {
  const mb = bytes / (1024 * 1024);
  return mb < 1 ? `${(bytes / 1024).toFixed(0)}KB` : `${mb.toFixed(1)}MB`;
};

// Calculate total size of photos for display
const calculateTotalSize = (photos: ShareablePhoto[]): number => {
  // Estimate average size per photo (assuming ~500KB per photo)
  return photos.length * 500 * 1024;
};

// Enhanced main sharing function for multiple photos with hybrid approach
export const shareMultipleToWhatsApp = async (
  photos: ShareablePhoto[], 
  method: 'auto' | 'files' | 'batched' | 'gallery' = 'auto'
): Promise<void> => {
  console.log(`Starting WhatsApp share for ${photos.length} photos using method: ${method}`);
  
  try {
    const totalSize = calculateTotalSize(photos);
    const loadingToast = toast({
      title: "🚀 Preparing your saree collection...",
      description: `Getting ${photos.length} photo${photos.length !== 1 ? 's' : ''} ready (${formatFileSize(totalSize)}) for WhatsApp sharing`,
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

    // Execute the chosen method with enhanced feedback
    switch (finalMethod) {
      case 'files':
        loadingToast.update({
          title: "📁 Sharing individual files...",
          description: `Preparing ${photos.length} photos with prices for direct file sharing`,
        });
        
        if (photos.length <= 10 && isMobileDevice() && canShareFiles()) {
          console.log('Using Web Share API for individual files');
          success = await shareMultipleViaWebShareAPI(photos);
        }
        if (!success) {
          console.log('Falling back to WhatsApp URL sharing for individual files');
          success = await shareMultipleViaWhatsAppURL(photos);
        }
        break;

      case 'batched':
        loadingToast.update({
          title: "📦 Creating batched shares...",
          description: `Organizing ${photos.length} photos into optimized batches with individual messages`,
        });
        console.log('Using batched sharing with individual messages');
        success = await shareBatchedToWhatsApp(photos, true);
        break;

      case 'gallery':
        loadingToast.update({
          title: "🖼️ Creating shareable gallery...",
          description: `Building a beautiful gallery page for ${photos.length} photos`,
        });
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

    // Enhanced success message based on method used
    const successMessages = {
      files: {
        title: "✅ Photos shared successfully!",
        description: `${photos.length} saree photos sent to WhatsApp with individual prices and details`
      },
      batched: {
        title: "✅ Batch sharing completed!",
        description: `${photos.length} photos organized and shared in optimized batches with prices`
      },
      gallery: {
        title: "✅ Gallery created and shared!",
        description: `Beautiful gallery with ${photos.length} photos shared via WhatsApp link`
      }
    };

    toast({
      title: successMessages[finalMethod].title,
      description: successMessages[finalMethod].description,
    });
    
  } catch (error) {
    console.error('Hybrid sharing failed:', error);
    
    // Enhanced error messages with helpful suggestions
    let errorTitle = "❌ Sharing failed";
    let errorDescription = "Unable to share photos. Please try a different method.";
    
    if (error.message?.includes('network')) {
      errorTitle = "🌐 Network error";
      errorDescription = "Check your internet connection and try again, or share fewer photos at once.";
    } else if (error.message?.includes('size')) {
      errorTitle = "📏 Files too large";
      errorDescription = `Try sharing fewer photos (currently ${photos.length}) or use gallery sharing instead.`;
    } else if (photos.length > 25) {
      errorTitle = "📚 Large collection detected";
      errorDescription = `${photos.length} photos is quite large. Try gallery sharing or select fewer photos.`;
    }
    
    toast({
      title: errorTitle,
      description: errorDescription,
      variant: "destructive",
    });
  }
};

// Enhanced single photo sharing with better feedback
export const shareToWhatsApp = async (photo: ShareablePhoto): Promise<void> => {
  console.log('Starting WhatsApp share for:', photo.title);
  
  try {
    // Show enhanced loading toast with photo details
    const loadingToast = toast({
      title: "🎀 Preparing saree share...",
      description: `Getting "${photo.title}" ready with price details for WhatsApp`,
    });

    // Progressive fallback strategy
    if (isMobileDevice() && canShareFiles()) {
      console.log('Trying Web Share API on mobile device');
      loadingToast.update({
        title: "📱 Using mobile file sharing...",
        description: "Preparing high-quality image file for direct sharing",
      });
      
      const webShareSuccess = await shareViaWebShareAPI(photo);
      
      if (webShareSuccess) {
        loadingToast.dismiss();
        toast({
          title: "✅ Saree shared successfully!",
          description: `"${photo.title}" sent to WhatsApp with price and image file`,
        });
        return;
      }
    }
    
    // Fallback to WhatsApp URL schemes
    console.log('Falling back to WhatsApp URL sharing');
    loadingToast.update({
      title: "🔗 Opening WhatsApp...",
      description: "Redirecting to WhatsApp with photo and price details",
    });
    
    const urlShareSuccess = shareViaWhatsAppURL(photo);
    
    loadingToast.dismiss();
    
    if (urlShareSuccess) {
      // Show success message for URL sharing
      toast({
        title: "🚀 Opening WhatsApp!",
        description: `Sharing "${photo.title}" with price details - WhatsApp should open shortly`,
      });
    } else {
      throw new Error('All sharing methods failed');
    }
    
  } catch (error) {
    console.error('All WhatsApp sharing methods failed:', error);
    
    // Enhanced error handling with specific messages and solutions
    let errorTitle = "❌ Unable to share saree";
    let errorDescription = "WhatsApp sharing isn't supported on this device.";
    
    if (error.message?.includes('network')) {
      errorTitle = "🌐 Network issue detected";
      errorDescription = "Check your internet connection and try again.";
    } else if (error.message?.includes('cors')) {
      errorTitle = "🔒 Image access restricted";
      errorDescription = "Try copying the image link manually or use a different sharing method.";
    } else if (!photo.imageUrl) {
      errorTitle = "🖼️ Missing image";
      errorDescription = "This photo doesn't have a valid image URL to share.";
    } else if (!photo.title) {
      errorTitle = "📝 Missing photo details";
      errorDescription = "This photo is missing title information needed for sharing.";
    }
    
    toast({
      title: errorTitle,
      description: errorDescription,
      variant: "destructive",
    });
  }
};
