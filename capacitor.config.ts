import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.photogarden.guardian',
  appName: 'photo-garden-guardian-clerk',
  webDir: 'dist',
  server: {
    url: 'https://3a11bdb0-a48b-4c88-a2a1-c8af48441c52.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    minWebViewVersion: 60,
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#000000",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true
    },
    Camera: {
      permissions: ["camera", "photos"]
    },
    Filesystem: {
      permissions: ["photos"]
    }
  }
};

export default config;