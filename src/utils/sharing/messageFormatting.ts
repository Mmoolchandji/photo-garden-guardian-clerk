
import { ShareablePhoto } from './types';

// Enhanced message formatting with better encoding
export const formatWhatsAppMessage = (photo: ShareablePhoto): string => {
  let message = `✨ Check out this beautiful saree: *${photo.title}*`;
  
  if (photo.price) {
    message += `\n💰 Price: ₹${photo.price.toLocaleString('en-IN')}`;
  }
  
  message += '\n\n📸 View the complete collection at our gallery!';
  
  return message;
};

// New function for formatting multiple photos message
export const formatMultiplePhotosMessage = (photos: ShareablePhoto[]): string => {
  let message = `✨ Check out these beautiful sarees:\n\n`;
  
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
