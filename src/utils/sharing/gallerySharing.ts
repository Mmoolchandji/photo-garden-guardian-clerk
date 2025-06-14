import { ShareablePhoto } from './types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface GalleryOptions {
  title?: string;
  expirationHours?: number;
  includeBusinessInfo?: boolean;
  watermark?: boolean;
}

const DEFAULT_GALLERY_OPTIONS: GalleryOptions = {
  title: 'Saree Collection',
  expirationHours: 48,
  includeBusinessInfo: true,
  watermark: false,
};

// Generate a unique gallery ID
const generateGalleryId = (): string => {
  return `gallery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Create a shareable gallery and return the URL
export const createShareableGallery = async (
  photos: ShareablePhoto[],
  options: Partial<GalleryOptions> = {}
): Promise<string | null> => {
  const config = { ...DEFAULT_GALLERY_OPTIONS, ...options };
  
  try {
    toast({
      title: "Creating gallery...",
      description: `Preparing ${photos.length} photos for sharing`,
    });
    
    const galleryId = generateGalleryId();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + config.expirationHours);
    
    // Store gallery data in Supabase with proper JSON conversion
    const { error } = await supabase
      .from('shared_galleries')
      .insert({
        id: galleryId,
        title: config.title,
        photos: photos as any, // Convert to JSON-compatible format
        expires_at: expiresAt.toISOString(),
        include_business_info: config.includeBusinessInfo,
        watermark: config.watermark,
      });

    if (error) {
      console.error('Database error creating gallery:', error);
      throw error;
    }
    
    const galleryUrl = `${window.location.origin}/gallery/${galleryId}`;
    
    toast({
      title: "Gallery created successfully! 🎉",
      description: `${photos.length} photos ready to share`,
    });
    
    return galleryUrl;
    
  } catch (error) {
    console.error('Gallery creation error:', error);
    toast({
      title: "Gallery creation failed",
      description: "Unable to create shareable gallery. Please try a different method.",
      variant: "destructive",
    });
    return null;
  }
};

// Share gallery URL to WhatsApp
export const shareGalleryToWhatsApp = async (
  photos: ShareablePhoto[],
  options: Partial<GalleryOptions> = {}
): Promise<boolean> => {
  try {
    const galleryUrl = await createShareableGallery(photos, options);
    
    if (!galleryUrl) {
      return false;
    }
    
    const message = `✨ Check out my beautiful saree collection!\n\n🎨 ${photos.length} varieties available\n💎 Premium quality fabrics\n📱 View gallery: ${galleryUrl}\n\n📞 Contact for prices and availability!`;
    
    const encodedMessage = encodeURIComponent(message);
    
    // Check if mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Try native app first
      window.location.href = `whatsapp://send?text=${encodedMessage}`;
      
      // Fallback to WhatsApp Web after delay
      setTimeout(() => {
        window.open(`https://web.whatsapp.com/send?text=${encodedMessage}`, '_blank');
      }, 2000);
    } else {
      // Desktop - go directly to WhatsApp Web
      window.open(`https://web.whatsapp.com/send?text=${encodedMessage}`, '_blank');
    }
    
    toast({
      title: "Gallery shared to WhatsApp! 📱",
      description: "Recipients can view all photos in the gallery",
    });
    
    return true;
    
  } catch (error) {
    console.error('Gallery sharing error:', error);
    toast({
      title: "Gallery sharing failed",
      description: "Unable to share gallery. Please try again.",
      variant: "destructive",
    });
    return false;
  }
};
