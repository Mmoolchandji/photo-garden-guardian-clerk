
import { toast } from '@/hooks/use-toast';

export interface ShareablePhoto {
  id: string;
  title: string;
  imageUrl: string;
  price?: number;
}

// Enhanced mobile device detection
export const isMobileDevice = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    'android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 
    'iemobile', 'opera mini', 'mobile', 'windows phone'
  ];
  return mobileKeywords.some(keyword => userAgent.includes(keyword)) ||
         /mobi|android/i.test(userAgent) ||
         (window.innerWidth <= 768 && window.innerHeight <= 1024);
};

// Check iOS specifically for better app handling
export const isIOSDevice = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

// Enhanced file sharing capability detection
export const canShareFiles = (): boolean => {
  return 'share' in navigator && 
         'canShare' in navigator && 
         typeof navigator.canShare === 'function';
};

// Optimized message formatting with better encoding
export const formatWhatsAppMessage = (photo: ShareablePhoto): string => {
  let message = `✨ Check out this beautiful saree: *${photo.title}*`;
  
  if (photo.price) {
    message += `\n💰 Price: ₹${photo.price.toLocaleString('en-IN')}`;
  }
  
  message += '\n\n📸 View the complete collection at our gallery!';
  
  return message;
};

// Enhanced image fetching with timeout and better error handling
const fetchImageAsBlob = async (imageUrl: string): Promise<Blob | null> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
  
  try {
    const response = await fetch(imageUrl, {
      signal: controller.signal,
      mode: 'cors',
      cache: 'force-cache' // Use cached version if available
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    // Validate it's actually an image
    if (!blob.type.startsWith('image/')) {
      throw new Error('Fetched content is not an image');
    }
    
    return blob;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Error fetching image:', error);
    
    if (error.name === 'AbortError') {
      console.error('Image fetch timed out');
    }
    
    return null;
  }
};

// Enhanced Web Share API implementation
const shareViaWebShareAPI = async (photo: ShareablePhoto): Promise<boolean> => {
  try {
    console.log('Attempting Web Share API for photo:', photo.title);
    
    const imageBlob = await fetchImageAsBlob(photo.imageUrl);
    if (!imageBlob) {
      console.log('Failed to fetch image blob, falling back to URL sharing');
      return false;
    }

    // Create file with proper extension based on blob type
    const extension = imageBlob.type.split('/')[1] || 'jpg';
    const fileName = `${photo.title.replace(/[^a-zA-Z0-9]/g, '_')}.${extension}`;
    const file = new File([imageBlob], fileName, { type: imageBlob.type });
    
    const shareData = {
      title: photo.title,
      text: formatWhatsAppMessage(photo),
      files: [file],
    };

    // Check if sharing files is supported
    if (navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData);
      console.log('Successfully shared via Web Share API');
      return true;
    }
    
    console.log('File sharing not supported, trying text-only share');
    
    // Fallback to text-only sharing if file sharing isn't supported
    const textShareData = {
      title: photo.title,
      text: `${formatWhatsAppMessage(photo)}\n\n${photo.imageUrl}`,
    };
    
    if (navigator.canShare && navigator.canShare(textShareData)) {
      await navigator.share(textShareData);
      console.log('Successfully shared text via Web Share API');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Web Share API error:', error);
    
    // Handle specific error types
    if (error.name === 'AbortError') {
      console.log('User cancelled the share');
      return true; // Don't show error for user cancellation
    }
    
    return false;
  }
};

// Enhanced WhatsApp URL sharing with better app detection
const shareViaWhatsAppURL = (photo: ShareablePhoto): boolean => {
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

// Main sharing function with progressive fallback and loading states
export const shareToWhatsApp = async (photo: ShareablePhoto): Promise<void> => {
  console.log('Starting WhatsApp share for:', photo.title);
  
  try {
    // Show loading toast for better UX
    const loadingToast = toast({
      title: "Preparing to share...",
      description: "Setting up your WhatsApp share",
    });

    // Progressive fallback strategy
    if (isMobileDevice() && canShareFiles()) {
      console.log('Trying Web Share API on mobile device');
      const webShareSuccess = await shareViaWebShareAPI(photo);
      
      if (webShareSuccess) {
        loadingToast.dismiss();
        return;
      }
    }
    
    // Fallback to WhatsApp URL schemes
    console.log('Falling back to WhatsApp URL sharing');
    const urlShareSuccess = shareViaWhatsAppURL(photo);
    
    loadingToast.dismiss();
    
    if (urlShareSuccess) {
      // Show success message for URL sharing
      toast({
        title: "Opening WhatsApp",
        description: "Redirecting to WhatsApp to share your saree",
      });
    } else {
      throw new Error('All sharing methods failed');
    }
    
  } catch (error) {
    console.error('All WhatsApp sharing methods failed:', error);
    
    // Enhanced error handling with specific messages
    let errorMessage = "Sharing via WhatsApp is not supported on this device or browser.";
    let errorDescription = "Please try copying the image URL manually.";
    
    if (error.message?.includes('network')) {
      errorMessage = "Network error occurred";
      errorDescription = "Please check your internet connection and try again.";
    } else if (error.message?.includes('cors')) {
      errorMessage = "Image sharing temporarily unavailable";
      errorDescription = "You can still share the link via WhatsApp Web.";
    }
    
    toast({
      title: errorMessage,
      description: errorDescription,
      variant: "destructive",
    });
  }
};
