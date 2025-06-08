
import { ShareablePhoto } from './types';
import { isMobileDevice } from './deviceDetection';
import { formatWhatsAppMessage, formatMultiplePhotosMessage } from './messageFormatting';

// Enhanced WhatsApp URL sharing for multiple photos
export const shareMultipleViaWhatsAppURL = (photos: ShareablePhoto[]): boolean => {
  try {
    const message = formatMultiplePhotosMessage(photos);
    
    // Add image URLs at the end
    const imageUrls = photos.map(photo => photo.imageUrl).join('\n');
    const fullMessage = `${message}\n\n${imageUrls}`;
    const encodedMessage = encodeURIComponent(fullMessage);
    
    let whatsappURL: string;
    
    if (isMobileDevice()) {
      whatsappURL = `whatsapp://send?text=${encodedMessage}`;
      console.log('Opening WhatsApp native app on mobile for multiple photos');
      window.location.href = whatsappURL;
      
      setTimeout(() => {
        console.log('Fallback to WhatsApp Web for multiple photos');
        window.open(`https://web.whatsapp.com/send?text=${encodedMessage}`, '_blank');
      }, 2000);
    } else {
      whatsappURL = `https://web.whatsapp.com/send?text=${encodedMessage}`;
      console.log('Opening WhatsApp Web on desktop for multiple photos');
      window.open(whatsappURL, '_blank');
    }
    
    return true;
  } catch (error) {
    console.error('WhatsApp URL sharing error for multiple photos:', error);
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
