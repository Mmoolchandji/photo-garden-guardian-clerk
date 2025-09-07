import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.photogarden.guardian',
  appName: 'photo-garden-guardian-clerk',
  webDir: 'dist',
  bundledWebRuntime: false,
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