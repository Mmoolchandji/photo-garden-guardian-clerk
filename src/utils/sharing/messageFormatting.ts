
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

// IMPROVED: Individual photo message with guaranteed price handling
export const formatIndividualPhotoMessage = (photo: ShareablePhoto): string => {
  let message = `✨ *${photo.title}*`;
  
  // Always try to include price, with fallback handling
  if (photo.price && photo.price > 0) {
    message += `\n💰 Price: ₹${photo.price.toLocaleString('en-IN')}`;
  } else {
    // Fallback for photos without price
    message += `\n💫 Premium Quality Saree`;
  }
  
  // Add description if available
  if (photo.description && photo.description.trim()) {
    message += `\n📝 ${photo.description.trim()}`;
  }
  
  return message;
};

// IMPROVED: Enhanced combined message for Web Share API multi-file sharing
export const formatCombinedWebShareMessage = (photos: ShareablePhoto[]): string => {
  let message = `✨ *Beautiful Saree Collection* (${photos.length} photos)\n\n`;
  
  // Add each photo with its details
  photos.forEach((photo, index) => {
    message += `${index + 1}. *${photo.title}*`;
    
    // Include price with proper formatting
    if (photo.price && photo.price > 0) {
      message += `\n   💰 ₹${photo.price.toLocaleString('en-IN')}`;
    } else {
      message += `\n   💫 Premium Quality`;
    }
    
    // Add description if available (truncated for space)
    if (photo.description && photo.description.trim()) {
      const truncatedDesc = photo.description.trim().substring(0, 50);
      message += `\n   📝 ${truncatedDesc}${photo.description.length > 50 ? '...' : ''}`;
    }
    
    message += '\n\n';
  });
  
  message += '📸 *Complete collection with detailed photos attached!*\n';
  message += '🛒 Contact us for more details or to place your order.';
  
  return message;
};

// New function for formatting multiple photos message (URL sharing)
export const formatMultiplePhotosMessage = (photos: ShareablePhoto[]): string => {
  let message = `✨ Check out these beautiful sarees:\n\n`;
  
  photos.forEach((photo, index) => {
    message += `${index + 1}. *${photo.title}*`;
    if (photo.price && photo.price > 0) {
      message += ` - ₹${photo.price.toLocaleString('en-IN')}`;
    } else {
      message += ` - Premium Quality`;
    }
    message += '\n';
  });
  
  message += '\n📸 View our complete collection at our gallery!';
  
  return message;
};

// IMPROVED: Validation function to check if photo has required data for sharing
export const validatePhotoForSharing = (photo: ShareablePhoto): { isValid: boolean; missingData: string[] } => {
  const missingData: string[] = [];
  
  if (!photo.title || photo.title.trim().length === 0) {
    missingData.push('title');
  }
  
  if (!photo.imageUrl || photo.imageUrl.trim().length === 0) {
    missingData.push('image URL');
  }
  
  // Note: We don't require price as mandatory, but we handle it gracefully
  
  return {
    isValid: missingData.length === 0,
    missingData
  };
};

// IMPROVED: Batch validation for multiple photos
export const validatePhotosForSharing = (photos: ShareablePhoto[]): { 
  validPhotos: ShareablePhoto[]; 
  invalidPhotos: Array<{ photo: ShareablePhoto; missingData: string[] }>;
  hasValidPhotos: boolean;
} => {
  const validPhotos: ShareablePhoto[] = [];
  const invalidPhotos: Array<{ photo: ShareablePhoto; missingData: string[] }> = [];
  
  photos.forEach(photo => {
    const validation = validatePhotoForSharing(photo);
    if (validation.isValid) {
      validPhotos.push(photo);
    } else {
      invalidPhotos.push({ photo, missingData: validation.missingData });
    }
  });
  
  return {
    validPhotos,
    invalidPhotos,
    hasValidPhotos: validPhotos.length > 0
  };
};
