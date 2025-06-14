
import { ShareablePhoto } from './types';
import { isMobileDevice } from './deviceDetection';
import { formatWhatsAppMessage, formatMultiplePhotosMessage, formatIndividualPhotoMessage, delay } from './messageFormatting';

// Enhanced WhatsApp URL sharing for multiple photos with individual messages
export const shareMultipleViaWhatsAppURL = async (photos: ShareablePhoto[], customMessage?: string): Promise<boolean> => {
  try {
    console.log(`Starting individual URL sharing for ${photos.length} photos`);
    
    // If custom message is provided, use traditional approach
    if (customMessage) {
      const message = customMessage;
      const imageUrls = photos.map(photo => photo.imageUrl).join('\n');
      const fullMessage = `${message}\n\n${imageUrls}`;
      const encodedMessage = encodeURIComponent(fullMessage);
      
      return shareToWhatsApp(encodedMessage);
    }
    
    // Share each photo individually with its own message
    let successCount = 0;
    
    for (const [index, photo] of photos.entries()) {
      try {
        const individualMessage = formatIndividualPhotoMessage(photo);
        const fullMessage = `${individualMessage}\n\n${photo.imageUrl}`;
        const encodedMessage = encodeURIComponent(fullMessage);
        
        const success = shareToWhatsApp(encodedMessage);
        if (success) {
          successCount++;
          console.log(`Successfully initiated share ${index + 1}: ${photo.title}`);
        }
        
        // Add delay between shares to avoid overwhelming WhatsApp (except for last photo)
        if (index < photos.length - 1) {
          await delay(2000); // 2 second delay between shares
        }
        
      } catch (error) {
        console.error(`Failed to share ${photo.title}:`, error);
      }
    }
    
    console.log(`Individual URL sharing completed: ${successCount}/${photos.length} photos`);
    return successCount > 0;
    
  } catch (error) {
    console.error('WhatsApp URL sharing error for multiple photos:', error);
    return false;
  }
};

// Helper function to open WhatsApp with message
const shareToWhatsApp = (encodedMessage: string): boolean => {
  try {
    if (isMobileDevice()) {
      const whatsappURL = `whatsapp://send?text=${encodedMessage}`;
      console.log('Opening WhatsApp native app on mobile');
      window.location.href = whatsappURL;
      
      setTimeout(() => {
        console.log('Fallback to WhatsApp Web');
        window.open(`https://web.whatsapp.com/send?text=${encodedMessage}`, '_blank');
      }, 2000);
    } else {
      const whatsappURL = `https://web.whatsapp.com/send?text=${encodedMessage}`;
      console.log('Opening WhatsApp Web on desktop');
      window.open(whatsappURL, '_blank');
    }
    
    return true;
  } catch (error) {
    console.error('WhatsApp URL opening error:', error);
    return false;
  }
};

// Enhanced WhatsApp URL sharing with better app detection
export const shareViaWhatsAppURL = (photo: ShareablePhoto): boolean => {
  try {
    const message = formatWhatsAppMessage(photo);
    const fullMessage = `${message}\n\n${photo.imageUrl}`;
    const encodedMessage = encodeURIComponent(fullMessage);
    
    return shareToWhatsApp(encodedMessage);
    
  } catch (error) {
    console.error('WhatsApp URL sharing error:', error);
    return false;
  }
};
