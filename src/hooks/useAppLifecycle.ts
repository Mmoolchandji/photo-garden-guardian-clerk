import { useEffect } from 'react';
import { App, AppState } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { isCapacitorApp } from '@/utils/sharing/deviceDetection';

interface AppLifecycleOptions {
  onAppActive?: () => void;
  onAppPaused?: () => void;
  hideSplashOnMount?: boolean;
}

export const useAppLifecycle = (options: AppLifecycleOptions = {}) => {
  const {
    onAppActive,
    onAppPaused,
    hideSplashOnMount = true
  } = options;

  useEffect(() => {
    if (!isCapacitorApp()) return;

    let appStateListener: any;

    const setupAppLifecycle = async () => {
      try {
        // Hide splash screen when app is ready
        if (hideSplashOnMount) {
          await SplashScreen.hide();
        }

        // Handle app state changes
        appStateListener = await App.addListener('appStateChange', (state: AppState) => {
          if (state.isActive) {
            console.log('App became active');
            onAppActive?.();
          } else {
            console.log('App went to background');
            onAppPaused?.();
          }
        });

      } catch (error) {
        console.warn('Failed to setup app lifecycle:', error);
      }
    };

    setupAppLifecycle();

    return () => {
      if (appStateListener) {
        appStateListener.remove();
      }
    };
  }, [onAppActive, onAppPaused, hideSplashOnMount]);

  const exitApp = async () => {
    if (isCapacitorApp()) {
      await App.exitApp();
    }
  };

  return {
    exitApp,
    isNativeApp: isCapacitorApp()
  };
};