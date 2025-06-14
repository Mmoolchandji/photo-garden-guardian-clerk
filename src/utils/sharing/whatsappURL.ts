
import { ShareablePhoto } from './types';
import { isMobileDevice } from './deviceDetection';
import { formatWhatsAppMessage, formatIndividualPhotoMessage } from './messageFormatting';

// Helper function to add delay between shares
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Enhanced WhatsApp URL sharing for multiple photos with individual messages
export const shareMultipleViaWhatsAppURL = async (photos: ShareablePhoto[], customMessage?: string): Promise<boolean> => {
  try {
    console.log('Starting individual WhatsApp URL sharing for', photos.length, 'photos');
    
    let successCount = 0;
    
    // Share each photo individually with its own message
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      
      try {
        // Add delay between shares (except for first photo)
        if (i > 0) {
          await delay(2000); // 2 second delay between shares
        }
        
        // Use individual message (price only) or custom message
        const message = customMessage || formatIndividualPhotoMessage(photo);
        const fullMessage = `${message}\n\n${photo.imageUrl}`;
        const encodedMessage = encodeURIComponent(fullMessage);
        
        let whatsappURL: string;
        
        if (isMobileDevice()) {
          whatsappURL = `whatsapp://send?text=${encodedMessage}`;
          console.log(`Opening WhatsApp native app for photo ${i + 1}: ${photo.title}`);
          window.location.href = whatsappURL;
          
          // Short delay to allow app to open
          await delay(1500);
        } else {
          whatsappURL = `https://web.whatsapp.com/send?text=${encodedMessage}`;
          console.log(`Opening WhatsApp Web for photo ${i + 1}: ${photo.title}`);
          window.open(whatsappURL, '_blank');
          
          // Short delay between windows
          await delay(1000);
        }
        
        successCount++;
        
      } catch (error) {
        console.error(`Failed to share ${photo.title} via WhatsApp URL:`, error);
      }
    }
    
    console.log(`Successfully initiated sharing for ${successCount} of ${photos.length} photos individually`);
    return successCount > 0;
    
  } catch (error) {
    console.error('WhatsApp URL individual sharing error:', error);
    return false;
  }
};

// Enhanced WhatsApp URL sharing with better app detection
export const shareViaWhatsAppURL = (photo: ShareablePhoto): boolean => {
  try {
    const message = formatWhatsAppMessage(photo);
    const fullMessage = `${message}\n\n${photo.imageUrl}`;
    const encodedMessage = encodeURIComponent(fullMessage);
    
    let whatsappURL: string;
    
    if (isMobileDevice()) {
      // For mobile, prioritize native app
      whatsappURL = `whatsapp://send?text=${encodedMessage}`;
      
      // Use location.href for better app detection on mobile
      console.log('Opening WhatsApp native app on mobile');
      window.location.href = whatsappURL;
      
      // Fallback to WhatsApp Web if native app doesn't open (after delay)
      setTimeout(() => {
        console.log('Fallback to WhatsApp Web');
        window.open(`https://web.whatsapp.com/send?text=${encodedMessage}`, '_blank');
      }, 2000);
    } else {
      // For desktop, go directly to WhatsApp Web
      whatsappURL = `https://web.whatsapp.com/send?text=${encodedMessage}`;
      console.log('Opening WhatsApp Web on desktop');
      window.open(whatsappURL, '_blank');
    }
    
    return true;
  } catch (error) {
    console.error('WhatsApp URL sharing error:', error);
    return false;
  }
};
