import { Share } from '@capacitor/share';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { fetchImageAsBlob } from './imageUtils';
import { ShareablePhoto } from './types';
import { formatWhatsAppMessage, formatMultiplePhotosMessage } from './messageFormatting';

// Convert blob to base64 for Capacitor filesystem
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix to get pure base64
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Generate safe filename for the device
const generateSafeFilename = (photo: ShareablePhoto, index?: number): string => {
  const timestamp = Date.now();
  const indexSuffix = index !== undefined ? `_${index + 1}` : '';
  const safeName = (photo.title || 'photo').replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${safeName}${indexSuffix}_${timestamp}.jpg`;
};

// Save photo to device filesystem temporarily
const savePhotoToDevice = async (photo: ShareablePhoto, index?: number): Promise<string | null> => {
  try {
    console.log('Fetching photo blob for native sharing:', photo.imageUrl);
    const blob = await fetchImageAsBlob(photo.imageUrl);
    
    if (!blob) {
      console.error('Failed to fetch photo blob for:', photo.imageUrl);
      return null;
    }

    console.log('Successfully fetched blob, size:', blob.size, 'type:', blob.type);
    const base64Data = await blobToBase64(blob);
    const filename = generateSafeFilename(photo, index);
    
    // Ensure temp_share directory exists
    try {
      await Filesystem.mkdir({
        path: 'temp_share',
        directory: Directory.Cache,
        recursive: true
      });
    } catch (dirError) {
      console.log('Directory already exists or created:', dirError);
    }
    
    console.log('Saving photo to device filesystem:', filename);
    const result = await Filesystem.writeFile({
      path: `temp_share/${filename}`,
      data: base64Data,
      directory: Directory.Cache,
      encoding: Encoding.UTF8
    });

    console.log('File saved successfully, URI:', result.uri);
    return result.uri;
  } catch (error) {
    console.error('Error saving photo to device:', error);
    console.error('Photo URL that failed:', photo.imageUrl);
    return null;
  }
};

// Clean up temporary files
const cleanupTempFiles = async (filenames: string[]) => {
  try {
    for (const filename of filenames) {
      await Filesystem.deleteFile({
        path: `temp_share/${filename}`,
        directory: Directory.Cache
      });
    }
    console.log('Cleaned up temporary share files');
  } catch (error) {
    console.error('Error cleaning up temp files:', error);
  }
};

// Share single photo using native capabilities
export const sharePhotoNatively = async (photo: ShareablePhoto): Promise<boolean> => {
  try {
    const fileUri = await savePhotoToDevice(photo);
    
    if (!fileUri) {
      throw new Error('Failed to save photo to device');
    }

    const message = formatWhatsAppMessage(photo);
    
    await Share.share({
      title: `Share ${photo.title || 'Photo'}`,
      text: message,
      files: [fileUri],
    });

    // Clean up after a delay to ensure sharing is complete
    setTimeout(() => {
      cleanupTempFiles([generateSafeFilename(photo)]);
    }, 5000);

    return true;
  } catch (error) {
    console.error('Native photo sharing failed:', error);
    return false;
  }
};

// Share multiple photos using native capabilities
export const shareMultiplePhotosNatively = async (photos: ShareablePhoto[]): Promise<boolean> => {
  try {
    console.log(`Preparing ${photos.length} photos for native sharing`);
    
    // Save all photos to device filesystem
    const fileUris: string[] = [];
    const filenames: string[] = [];
    
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const fileUri = await savePhotoToDevice(photo, i);
      
      if (fileUri) {
        fileUris.push(fileUri);
        filenames.push(generateSafeFilename(photo, i));
      }
    }

    if (fileUris.length === 0) {
      throw new Error('No photos could be saved to device');
    }

    // Create message for multiple photos
    const message = formatMultiplePhotosMessage(photos.slice(0, fileUris.length));

    await Share.share({
      title: `Share ${fileUris.length} Photo${fileUris.length > 1 ? 's' : ''}`,
      text: message,
      files: fileUris,
    });

    // Clean up after a delay
    setTimeout(() => {
      cleanupTempFiles(filenames);
    }, 10000); // Longer delay for multiple files

    return true;
  } catch (error) {
    console.error('Native multiple photos sharing failed:', error);
    return false;
  }
};

// Check if native sharing is available
export const isNativeSharingAvailable = (): boolean => {
  try {
    return !!(window as any).Capacitor && !!(window as any).CapacitorPlugins?.Share && !!(window as any).CapacitorPlugins?.Filesystem;
  } catch {
    return false;
  }
};