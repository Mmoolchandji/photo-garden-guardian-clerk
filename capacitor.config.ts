import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.3a11bdb0a48b4c88a2a1c8af48441c52',
  appName: 'photo-garden-guardian-clerk',
  webDir: 'dist',
  server: {
    url: 'https://3a11bdb0-a48b-4c88-a2a1-c8af48441c52.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  bundledWebRuntime: false
};

export default config;