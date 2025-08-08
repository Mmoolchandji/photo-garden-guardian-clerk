
// Enhanced image fetching with timeout and better error handling
export const fetchImageAsBlob = async (
  imageUrl: string,
  opts?: { noCache?: boolean }
): Promise<Blob | null> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  const withCacheBust = (url: string) => {
    try {
      const u = new URL(url, window.location.href);
      u.searchParams.set('_cb', Date.now().toString());
      return u.toString();
    } catch {
      // If invalid URL, fallback to appending query
      const sep = url.includes('?') ? '&' : '?';
      return `${url}${sep}_cb=${Date.now()}`;
    }
  };
  
  const finalUrl = opts?.noCache ? withCacheBust(imageUrl) : imageUrl;
  
  try {
    const response = await fetch(finalUrl, {
      signal: controller.signal,
      mode: 'cors',
      cache: opts?.noCache ? 'no-store' : 'force-cache' // Avoid SW/proxy cache when sharing
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
    
    if ((error as any).name === 'AbortError') {
      console.error('Image fetch timed out');
    }
    
    return null;
  }
};
