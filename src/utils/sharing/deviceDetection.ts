
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

// Stricter capability detection: verifies real file payload support
export const canShareFilesStrict = (): boolean => {
  try {
    if (!('share' in navigator) || !('canShare' in navigator) || typeof navigator.canShare !== 'function') {
      return false;
    }
    const blob = new Blob(['x'], { type: 'image/jpeg' });
    const file = new File([blob], 'probe.jpg', { type: 'image/jpeg' });
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
};

// Detect if app is running as an installed PWA (standalone)
export const isStandalonePWA = (): boolean => {
  const isStandaloneMedia = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  const isStandaloneIOS = (navigator as any).standalone === true; // iOS Safari
  return !!(isStandaloneMedia || isStandaloneIOS);
};
