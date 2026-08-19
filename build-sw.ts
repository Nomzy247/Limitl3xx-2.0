import { injectManifest } from 'workbox-build';
import path from 'path';

async function buildServiceWorker() {
  const distDir = path.resolve(process.cwd(), 'dist');
  
  try {
    const { count, size } = await injectManifest({
      swSrc: path.resolve(process.cwd(), 'src/sw.ts'),
      swDest: path.resolve(distDir, 'sw.js'),
      globDirectory: distDir,
      globPatterns: [
        '**/*.{html,js,css,png,svg,jpg,jpeg,webp,json,woff,woff2}'
      ],
      globIgnores: [
        '**/node_modules/**/*',
        '**/*.map',
        'sw.js',
        'workbox-*.js'
      ],
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
    });

    console.log(`[Workbox] Service worker generated: ${count} files precached (${(size / 1024 / 1024).toFixed(2)} MB).`);
  } catch (error) {
    console.error('[Workbox] Failed to build service worker:', error);
    process.exit(1);
  }
}

buildServiceWorker();
