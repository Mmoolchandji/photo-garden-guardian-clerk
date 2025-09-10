import { Share } from '@capacitor/share';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { fetchImageAsBlob } from './imageUtils';
import { ShareablePhoto } from './types';
import { formatWhatsAppMessage, formatMultiplePhotosMessage } from './messageFormatting';
import { debugLog, debugError } from './debugLogger';

// Convert file URI to content URI for Android compatibility
const convertToContentUri = async (fileUri: string): Promise<string | null> => {
  try {
    debugLog('🔄 Converting file URI to content URI', { fileUri });
    
    // Check if we're on Android and in a Capacitor app
    const isAndroid = (window as any).Capacitor?.getPlatform() === 'android';
    
    if (!isAndroid || !fileUri) {
      debugLog('ℹ️ Not Android or no file URI, returning original', { isAndroid, hasFileUri: !!fileUri });
      return fileUri;
    }
    
    // For Android, convert file:// URIs to content:// URIs using FileProvider
    if (fileUri.startsWith('file://')) {
      // Extract filename from the URI - it should be in cache/temp_share/filename.jpg format
      const urlParts = fileUri.split('/');
      const filename = urlParts[urlParts.length - 1];
      
      // Use the FileProvider authority we configured
      const authority = 'app.lovable.photogarden.guardian.fileprovider';
      const contentUri = `content://${authority}/cache_files/temp_share/${filename}`;
      
      debugLog('✅ Generated content URI', { 
        originalUri: fileUri, 
        contentUri, 
        filename, 
        authority 
      });
      
      return contentUri;
    }
    
    debugLog('ℹ️ File URI does not start with file://, returning original', { fileUri });
    return fileUri;
  } catch (error) {
    debugError('❌ Error converting to content URI', error);
    return fileUri;
  }
};

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
    debugLog('🔄 Starting photo fetch for saving to device', { 
      imageUrl: photo.imageUrl, 
      title: photo.title,
      index 
    });
    
    const blob = await fetchImageAsBlob(photo.imageUrl);
    
    if (!blob) {
      debugError('❌ Failed to fetch photo blob', { imageUrl: photo.imageUrl });
      return null;
    }

    debugLog('✅ Successfully fetched blob', { 
      size: blob.size, 
      type: blob.type,
      imageUrl: photo.imageUrl 
    });
    
    // Validate blob is not empty
    if (blob.size === 0) {
      debugError('❌ Blob is empty', { imageUrl: photo.imageUrl });
      return null;
    }
    
    const base64Data = await blobToBase64(blob);
    debugLog('✅ Converted to base64', { 
      base64Length: base64Data.length,
      imageUrl: photo.imageUrl 
    });
    
    const filename = generateSafeFilename(photo, index);
    
    // Ensure temp_share directory exists
    try {
      await Filesystem.mkdir({
        path: 'temp_share',
        directory: Directory.Cache,
        recursive: true
      });
      debugLog('✅ Created/verified temp_share directory');
    } catch (dirError) {
      debugLog('ℹ️ Directory already exists or created', dirError);
    }
    
    debugLog('💾 Saving photo to device filesystem', { filename, path: `temp_share/${filename}` });
    const result = await Filesystem.writeFile({
      path: `temp_share/${filename}`,
      data: base64Data,
      directory: Directory.Cache
      // Base64 data is automatically detected by Capacitor when no encoding is specified
    });

    debugLog('✅ File saved successfully', { uri: result.uri, filename });
    return result.uri;
  } catch (error) {
    debugError('❌ Error saving photo to device', { 
      error, 
      imageUrl: photo.imageUrl,
      title: photo.title 
    });
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
    console.log('🚀 [Native Sharing] Starting single photo share for:', photo.title);
    const fileUri = await savePhotoToDevice(photo);
    
    if (!fileUri) {
      console.error('❌ [Native Sharing] Failed to save photo to device');
      throw new Error('Failed to save photo to device');
    }

    console.log('📱 [Native Sharing] Photo saved, preparing to share with URI:', fileUri);
    const message = formatWhatsAppMessage(photo);
    
    // Convert file URI to content URI for Android
    const contentUri = await convertToContentUri(fileUri);
    console.log('🔗 [Native Sharing] Content URI generated:', contentUri);
    
    await Share.share({
      title: `Share ${photo.title || 'Photo'}`,
      text: message,
      files: [contentUri || fileUri],
      dialogTitle: `Share ${photo.title || 'Photo'}`
    });

    console.log('✅ [Native Sharing] Share completed successfully');
    
    // Clean up after a delay to ensure sharing is complete
    setTimeout(() => {
      cleanupTempFiles([generateSafeFilename(photo)]);
    }, 5000);

    return true;
  } catch (error) {
    console.error('❌ [Native Sharing] Native photo sharing failed:', error);
    if (error instanceof Error) {
      console.error('❌ [Native Sharing] Error details:', error.message, error.stack);
    }
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

    // Convert all file URIs to content URIs for Android
    const contentUris: string[] = [];
    for (const fileUri of fileUris) {
      const contentUri = await convertToContentUri(fileUri);
      contentUris.push(contentUri || fileUri);
    }
    
    console.log('🔗 [Native Sharing] Content URIs generated:', contentUris);
    
    // Create message for multiple photos
    const message = formatMultiplePhotosMessage(photos.slice(0, fileUris.length));

    await Share.share({
      title: `Share ${fileUris.length} Photo${fileUris.length > 1 ? 's' : ''}`,
      text: message,
      files: contentUris,
      dialogTitle: `Share ${fileUris.length} Photo${fileUris.length > 1 ? 's' : ''}`
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