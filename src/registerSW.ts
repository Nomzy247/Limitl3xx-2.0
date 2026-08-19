import { Workbox } from 'workbox-window';

export function registerServiceWorker() {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    const wb = new Workbox('/sw.js');

    wb.addEventListener('installed', (event) => {
      if (event.isUpdate) {
        console.log('[PWA] New version available! Reloading for update.');
      } else {
        console.log('[PWA] App shell and assets cached for offline access.');
      }
    });

    wb.addEventListener('activated', () => {
      console.log('[PWA] Service worker activated successfully.');
    });

    wb.register().catch((err) => {
      console.warn('[PWA] Service worker registration failed:', err);
    });
  }
}
