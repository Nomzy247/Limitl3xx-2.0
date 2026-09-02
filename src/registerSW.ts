import { Workbox } from 'workbox-window';

export function registerServiceWorker() {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`.replace(/\/\//g, '/');
    const wb = new Workbox(swUrl);

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
