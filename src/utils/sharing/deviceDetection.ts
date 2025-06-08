
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
