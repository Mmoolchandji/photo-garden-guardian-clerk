import { registerSW } from 'virtual:pwa-register';

export function registerPwa() {
  registerSW({
    onNeedRefresh() {
      if (confirm('New content is available, do you want to refresh?')) {
        window.location.reload();
      }
    },
    onOfflineReady() {
      console.log('App is ready to work offline');
    },
  });
}
