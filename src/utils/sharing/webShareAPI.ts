
import { toast } from '@/hooks/use-toast';
import { ShareablePhoto } from './types';
import { canShareFilesStrict, isIOSDevice } from './deviceDetection';
import { formatWhatsAppMessage, formatMultiplePhotosMessage } from './messageFormatting';
import { fetchImageAsBlob } from './imageUtils';
import { compressImage } from '@/utils/imageCompression';

// Browser/platform limits for Web Share API
const WEB_SHARE_LIMITS = {
  MAX_FILES: 10, // Most browsers limit to ~10 files via Web Share API
  MAX_TOTAL_SIZE: 25 * 1024 * 1024, // 25MB total size limit for most platforms
  MAX_SINGLE_FILE_SIZE: 5 * 1024 * 1024, // 5MB per file limit (default)
};

// Determine platform-aware limits (conservative defaults)
const getPlatformLimits = () => {
  if (isIOSDevice()) {
    return {
      MAX_FILES: 10,
      MAX_TOTAL_SIZE: 25 * 1024 * 1024,
      MAX_SINGLE_FILE_SIZE: 10 * 1024 * 1024, // iOS often allows larger single files
    };
  }
  // Android/others: allow a bit more headroom
  return {
    MAX_FILES: 10,
    MAX_TOTAL_SIZE: 50 * 1024 * 1024,
    MAX_SINGLE_FILE_SIZE: 16 * 1024 * 1024,
  };
};

// Helper: iteratively compress a File to fit under target bytes
const compressFileToTarget = async (file: File, targetBytes: number): Promise<File | null> => {
  const steps = [
    { max: 1600, q: 0.85 },
    { max: 1280, q: 0.75 },
    { max: 1024, q: 0.7 },
    { max: 800, q: 0.65 },
  ];
  let current = file;
  for (const s of steps) {
    const compressed = await compressImage(current, { maxWidth: s.max, maxHeight: s.max, quality: s.q, format: 'jpeg' });
    current = compressed.compressedFile;
    if (current.size <= targetBytes) return current;
  }
  return current.size <= targetBytes ? current : null;
};

export const shareMultipleViaWebShareAPI = async (photos: ShareablePhoto[]): Promise<boolean> => {
  try {
    console.log('Attempting Web Share API for multiple photos:', photos.length);

    const LIMITS = getPlatformLimits();
    
    // Check if we exceed the browser's file count limit
    if (photos.length > LIMITS.MAX_FILES) {
      console.log(`Too many photos (${photos.length}) for Web Share API. Limit: ${LIMITS.MAX_FILES}`);
      return false; // Don't show toast here, let the caller handle it
    }
    
    // Verify Web Share API support before proceeding
    if (!navigator.share || !navigator.canShare) {
      console.log('Web Share API not supported');
      return false;
    }
    
    const files: File[] = [];
    const failedPhotos: ShareablePhoto[] = [];
    let totalSize = 0;
    
    // Show loading state for file preparation
    const loadingToast = toast({
      title: "Preparing files...",
      description: `Getting ${photos.length} photos ready for sharing`,
    });
    
    // Fetch all images as blobs with size checking and compression fallbacks
    for (const photo of photos) {
      try {
        const imageBlob = await fetchImageAsBlob(photo.imageUrl, { noCache: true });
        if (!imageBlob) {
          failedPhotos.push(photo);
          continue;
        }

        const extension = imageBlob.type.split('/')[1] || 'jpg';
        const fileName = `${photo.title.replace(/[^a-zA-Z0-9]/g, '_')}.${extension}`;
        let file = new File([imageBlob], fileName, { type: imageBlob.type });

        // Compress if single file exceeds limit
        if (file.size > LIMITS.MAX_SINGLE_FILE_SIZE) {
          console.log(`Photo ${photo.title} too large (${file.size}). Compressing...`);
          const compressed = await compressFileToTarget(file, LIMITS.MAX_SINGLE_FILE_SIZE);
          if (!compressed) {
            failedPhotos.push(photo);
            continue;
          }
          file = compressed;
        }
        
        // Ensure total size stays within limit
        if (totalSize + file.size > LIMITS.MAX_TOTAL_SIZE) {
          const remaining = Math.max(0, LIMITS.MAX_TOTAL_SIZE - totalSize);
          if (remaining <= 0) {
            console.log(`Total size limit reached. Skipping ${photo.title}`);
            failedPhotos.push(photo);
            continue;
          }
          console.log(`Compressing ${photo.title} to fit remaining budget: ${remaining} bytes`);
          const compressedFurther = await compressFileToTarget(file, Math.min(remaining, LIMITS.MAX_SINGLE_FILE_SIZE));
          if (!compressedFurther || totalSize + compressedFurther.size > LIMITS.MAX_TOTAL_SIZE) {
            console.log(`Could not fit ${photo.title} within total size limit`);
            failedPhotos.push(photo);
            continue;
          }
          file = compressedFurther;
        }

        files.push(file);
        totalSize += file.size;
      } catch (error) {
        console.error(`Failed to prepare ${photo.title}:`, error);
        failedPhotos.push(photo);
      }
    }

    loadingToast.dismiss();

    if (files.length === 0) {
      console.log('No images could be fetched for sharing');
      toast({
        title: "Unable to prepare files",
        description: "Could not prepare any photos for file sharing",
        variant: "destructive",
      });
      return false;
    }

    const shareData = {
      title: `${files.length} Beautiful Sarees`,
      text: '',
      files: files,
    };

    // Double-check if sharing files is supported with actual data
    if (!navigator.canShare(shareData)) {
      console.log('File sharing not supported with this data');
      return false;
    }

    // Attempt the share
    await navigator.share(shareData);
    console.log(`Successfully shared ${files.length} photos via Web Share API`);
    
    if (failedPhotos.length > 0) {
      toast({
        title: "Partial file sharing",
        description: `${files.length} photos shared as files. ${failedPhotos.length} couldn't be prepared.`,
      });
    }
    
    return true;
    
  } catch (error: any) {
    console.error('Multi-photo Web Share API error:', error);
    
    if (error.name === 'AbortError') {
      console.log('User cancelled the share');
      return true; // User cancellation is considered "successful" handling
    }
    
    // Handle specific Web Share API errors
    if (error.name === 'DataError') {
      console.log('Web Share API data error - likely file format or size issue');
      toast({
        title: "File sharing issue",
        description: "Some files couldn't be shared due to format or size limits",
        variant: "destructive",
      });
    } else if (error.name === 'NotAllowedError') {
      console.log('Web Share API not allowed - likely due to security restrictions');
      toast({
        title: "Sharing not allowed",
        description: "File sharing was blocked by your browser's security settings",
        variant: "destructive",
      });
    }
    
    return false;
  }
};

// Enhanced Web Share API implementation
export const shareViaWebShareAPI = async (photo: ShareablePhoto): Promise<boolean> => {
  try {
    console.log('Attempting Web Share API for photo:', photo.title);

    const LIMITS = getPlatformLimits();
    
    // Verify Web Share API support
    if (!navigator.share || !navigator.canShare) {
      console.log('Web Share API not supported');
      return false;
    }
    
    const imageBlob = await fetchImageAsBlob(photo.imageUrl, { noCache: true });
    if (!imageBlob) {
      console.log('Failed to fetch image blob, falling back to URL sharing');
      return false;
    }

    const extension = imageBlob.type.split('/')[1] || 'jpg';
    const fileName = `${photo.title.replace(/[^a-zA-Z0-9]/g, '_')}.${extension}`;
    let file = new File([imageBlob], fileName, { type: imageBlob.type });

    // Check file size for single photo and compress if needed
    if (file.size > LIMITS.MAX_SINGLE_FILE_SIZE) {
      console.log(`Photo too large for file sharing (${file.size}). Compressing...`);
      const compressed = await compressFileToTarget(file, LIMITS.MAX_SINGLE_FILE_SIZE);
      if (!compressed) {
        console.log('Compression could not reduce size enough');
        return false;
      }
      file = compressed;
    }
    
    const shareData = {
      title: photo.title,
      text: formatWhatsAppMessage(photo),
      files: [file],
    };

    // Check if sharing files is supported
    if (!navigator.canShare(shareData)) {
      console.log('File sharing not supported, trying text-only share');
      
      // Fallback to text-only sharing if file sharing isn't supported
      const textShareData = {
        title: photo.title,
        text: `${formatWhatsAppMessage(photo)}\n\n${photo.imageUrl}`,
      };
      
      if (navigator.canShare(textShareData)) {
        await navigator.share(textShareData);
        console.log('Successfully shared text via Web Share API');
        return true;
      }
      
      return false;
    }
    
    await navigator.share(shareData);
    console.log('Successfully shared via Web Share API');
    return true;
    
  } catch (error: any) {
    console.error('Web Share API error:', error);
    
    // Handle specific error types
    if (error.name === 'AbortError') {
      console.log('User cancelled the share');
      return true; // Don't show error for user cancellation
    }
    
    return false;
  }
};

// Export the limits for use in other components
export { WEB_SHARE_LIMITS };
