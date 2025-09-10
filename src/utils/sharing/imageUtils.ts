
// Enhanced image fetching with timeout and better error handling
export const fetchImageAsBlob = async (imageUrl: string): Promise<Blob | null> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
  
  try {
    console.log('🔄 [Image Utils] Fetching image:', imageUrl);
    
    // For Capacitor apps, handle fetch differently
    const isCapacitor = !!(window as any).Capacitor;
    const response = await fetch(imageUrl, {
      signal: controller.signal,
      mode: 'cors', // Use cors mode consistently for better error handling
      cache: 'default', // Use default cache strategy
      headers: {
        'Accept': 'image/*',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log('✅ [Image Utils] Blob fetched - Size:', blob.size, 'Type:', blob.type);
    
    // Validate it's actually an image
    if (!blob.type.startsWith('image/')) {
      console.error('❌ [Image Utils] Invalid blob type:', blob.type);
      throw new Error('Fetched content is not an image');
    }
    
    // Validate blob size
    if (blob.size === 0) {
      console.error('❌ [Image Utils] Empty blob received');
      throw new Error('Empty image blob received');
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
