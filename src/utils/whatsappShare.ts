
import { toast } from '@/hooks/use-toast';

export interface ShareablePhoto {
  id: string;
  title: string;
  imageUrl: string;
  price?: number;
}

// Detect if device supports native file sharing
export const canShareFiles = (): boolean => {
  return 'share' in navigator && 'canShare' in navigator;
};

// Detect if it's a mobile device
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Format message for WhatsApp
export const formatWhatsAppMessage = (photo: ShareablePhoto): string => {
  let message = `Check out this beautiful saree: ${photo.title}`;
  
  if (photo.price) {
    message += `\nPrice: ₹${photo.price}`;
  }
  
  return message;
};

// Convert image URL to blob for file sharing
const fetchImageAsBlob = async (imageUrl: string): Promise<Blob | null> => {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }
    return await response.blob();
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
};

// Share via Web Share API (mobile file sharing)
const shareViaWebShareAPI = async (photo: ShareablePhoto): Promise<boolean> => {
  try {
    const imageBlob = await fetchImageAsBlob(photo.imageUrl);
    if (!imageBlob) {
      return false;
    }

    const file = new File([imageBlob], `${photo.title}.jpg`, { type: 'image/jpeg' });
    const shareData = {
      title: photo.title,
      text: formatWhatsAppMessage(photo),
      files: [file],
    };

    if (navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Web Share API error:', error);
    return false;
  }
};

// Share via WhatsApp URL scheme (fallback)
const shareViaWhatsAppURL = (photo: ShareablePhoto): boolean => {
  try {
    const message = formatWhatsAppMessage(photo);
    const fullMessage = `${message}\n\n${photo.imageUrl}`;
    const encodedMessage = encodeURIComponent(fullMessage);
    
    const whatsappURL = isMobileDevice() 
      ? `whatsapp://send?text=${encodedMessage}`
      : `https://web.whatsapp.com/send?text=${encodedMessage}`;
    
    window.open(whatsappURL, '_blank');
    return true;
  } catch (error) {
    console.error('WhatsApp URL sharing error:', error);
    return false;
  }
};

// Main sharing function with progressive fallback
export const shareToWhatsApp = async (photo: ShareablePhoto): Promise<void> => {
  // Try file sharing first on mobile devices
  if (isMobileDevice() && canShareFiles()) {
    const success = await shareViaWebShareAPI(photo);
    if (success) {
      return;
    }
  }
  
  // Fallback to URL sharing
  const success = shareViaWhatsAppURL(photo);
  
  if (!success) {
    toast({
      title: "Sharing Not Available",
      description: "Sharing via WhatsApp is not supported on this device or browser.",
      variant: "destructive",
    });
  }
};
