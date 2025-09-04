import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { isCapacitorApp } from '@/utils/sharing/deviceDetection';

interface MobileUXOptions {
  onBackButton?: () => void;
  enableHaptics?: boolean;
  statusBarStyle?: 'light' | 'dark';
}

export const useMobileUX = (options: MobileUXOptions = {}) => {
  const {
    onBackButton,
    enableHaptics = true,
    statusBarStyle = 'dark'
  } = options;

  useEffect(() => {
    if (!isCapacitorApp()) return;

    let backButtonListener: any;
    let appStateListener: any;

    const setupMobileUX = async () => {
      try {
        // Configure status bar
        await StatusBar.setStyle({ 
          style: statusBarStyle === 'light' ? Style.Light : Style.Dark 
        });

        // Handle hardware back button
        backButtonListener = await App.addListener('backButton', (event) => {
          if (onBackButton) {
            onBackButton();
          } else {
            // Default behavior: exit app if no custom handler
            if (!event.canGoBack) {
              App.exitApp();
            } else {
              window.history.back();
            }
          }
        });

        // Handle app lifecycle
        appStateListener = await App.addListener('appStateChange', (state) => {
          console.log('App state changed:', state);
          
          if (state.isActive) {
            // App became active - could refresh data here if needed
            console.log('App resumed');
          } else {
            // App went to background
            console.log('App paused');
          }
        });

      } catch (error) {
        console.warn('Failed to setup mobile UX:', error);
      }
    };

    setupMobileUX();

    // Cleanup listeners
    return () => {
      if (backButtonListener) {
        backButtonListener.remove();
      }
      if (appStateListener) {
        appStateListener.remove();
      }
    };
  }, [onBackButton, statusBarStyle]);

  // Haptic feedback helpers
  const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Medium) => {
    if (!isCapacitorApp() || !enableHaptics) return;
    
    try {
      await Haptics.impact({ style });
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  };

  const triggerLightHaptic = () => triggerHaptic(ImpactStyle.Light);
  const triggerMediumHaptic = () => triggerHaptic(ImpactStyle.Medium);
  const triggerHeavyHaptic = () => triggerHaptic(ImpactStyle.Heavy);

  return {
    triggerHaptic,
    triggerLightHaptic,
    triggerMediumHaptic,
    triggerHeavyHaptic,
    isNativeApp: isCapacitorApp()
  };
};