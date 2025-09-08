
// Enhanced image fetching with timeout and better error handling
export const fetchImageAsBlob = async (imageUrl: string): Promise<Blob | null> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
  
  try {
    // For Capacitor apps, use no-cors mode to avoid CORS issues
    const isCapacitor = !!(window as any).Capacitor;
    const response = await fetch(imageUrl, {
      signal: controller.signal,
      mode: isCapacitor ? 'no-cors' : 'cors',
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
