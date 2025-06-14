
import { ShareablePhoto } from './types';
import { isMobileDevice } from './deviceDetection';
import { formatWhatsAppMessage, formatIndividualPhotoMessage } from './messageFormatting';

// Helper function to add delay between shares
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Optimized WhatsApp URL sharing for multiple photos with individual messages
export const shareMultipleViaWhatsAppURL = async (photos: ShareablePhoto[], customMessage?: string): Promise<boolean> => {
  try {
    console.log('Starting optimized WhatsApp URL sharing for', photos.length, 'photos');
    
    let successCount = 0;
    const isMobile = isMobileDevice();
    
    // Optimize delays based on device type
    const shareDelay = isMobile ? 800 : 500; // Reduced delays for better UX
    const appOpenDelay = isMobile ? 1000 : 0; // Reduced mobile app open delay
    
    // Share each photo individually with its own price message
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      
      try {
        // Add delay between shares (except for first photo)
        if (i > 0) {
          console.log(`Waiting ${shareDelay}ms before sharing photo ${i + 1}`);
          await delay(shareDelay);
        }
        
        // Use individual message with price or custom message
        const message = customMessage || formatIndividualPhotoMessage(photo);
        
        // Validate that message contains meaningful content
        if (!message || message.trim().length === 0) {
          console.warn(`Empty message for photo ${photo.title}, skipping`);
          continue;
        }
        
        const fullMessage = `${message}\n\n${photo.imageUrl}`;
        const encodedMessage = encodeURIComponent(fullMessage);
        
        let whatsappURL: string;
        
        if (isMobile) {
          whatsappURL = `whatsapp://send?text=${encodedMessage}`;
          console.log(`Opening WhatsApp native app for photo ${i + 1}: ${photo.title} - ${message}`);
          
          // Use location.href for better app detection on mobile
          window.location.href = whatsappURL;
          
          // Short delay to allow app to open
          if (appOpenDelay > 0) {
            await delay(appOpenDelay);
          }
        } else {
          whatsappURL = `https://web.whatsapp.com/send?text=${encodedMessage}`;
          console.log(`Opening WhatsApp Web for photo ${i + 1}: ${photo.title} - ${message}`);
          
          // Open in new tab for desktop
          window.open(whatsappURL, '_blank');
        }
        
        successCount++;
        console.log(`Successfully initiated share ${i + 1}/${photos.length}: ${photo.title}`);
        
      } catch (error) {
        console.error(`Failed to share ${photo.title} via WhatsApp URL:`, error);
        // Continue with next photo instead of stopping
      }
    }
    
    console.log(`Successfully initiated sharing for ${successCount} of ${photos.length} photos individually`);
    
    // Consider success if at least one photo was shared
    const isSuccess = successCount > 0;
    
    if (isSuccess && successCount < photos.length) {
      console.warn(`Partial success: ${successCount}/${photos.length} photos shared`);
    }
    
    return isSuccess;
    
  } catch (error) {
    console.error('WhatsApp URL individual sharing error:', error);
    return false;
  }
};

// Enhanced single photo WhatsApp URL sharing with better error handling
export const shareViaWhatsAppURL = (photo: ShareablePhoto): boolean => {
  try {
    const message = formatWhatsAppMessage(photo);
    
    // Validate message content
    if (!message || message.trim().length === 0) {
      console.error('Empty message generated for photo:', photo.title);
      return false;
    }
    
    const fullMessage = `${message}\n\n${photo.imageUrl}`;
    const encodedMessage = encodeURIComponent(fullMessage);
    
    let whatsappURL: string;
    
    if (isMobileDevice()) {
      // For mobile, prioritize native app
      whatsappURL = `whatsapp://send?text=${encodedMessage}`;
      
      console.log('Opening WhatsApp native app on mobile with message:', message);
      window.location.href = whatsappURL;
      
      // Optimized fallback timing - reduced from 2000ms to 1500ms
      setTimeout(() => {
        console.log('Fallback to WhatsApp Web');
        window.open(`https://web.whatsapp.com/send?text=${encodedMessage}`, '_blank');
      }, 1500);
    } else {
      // For desktop, go directly to WhatsApp Web
      whatsappURL = `https://web.whatsapp.com/send?text=${encodedMessage}`;
      console.log('Opening WhatsApp Web on desktop with message:', message);
      window.open(whatsappURL, '_blank');
    }
    
    return true;
  } catch (error) {
    console.error('WhatsApp URL sharing error:', error);
    return false;
  }
};
