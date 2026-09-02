import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { ZipArchive } = require('archiver');

async function createDeployZip() {
  const distDir = path.resolve(process.cwd(), 'dist');
  const publicDir = path.resolve(process.cwd(), 'public');
  const outputZipPath = path.resolve(process.cwd(), 'public/hostinger-deploy.zip');
  const outputDistZipPath = path.resolve(distDir, 'hostinger-deploy.zip');

  if (!fs.existsSync(distDir)) {
    console.error('[Deploy] dist directory does not exist. Run npm run build first.');
    return;
  }

  // Ensure .htaccess exists in dist
  const srcHtaccess = path.resolve(publicDir, '.htaccess');
  const distHtaccess = path.resolve(distDir, '.htaccess');
  if (fs.existsSync(srcHtaccess)) {
    fs.copyFileSync(srcHtaccess, distHtaccess);
  }

  return new Promise<void>((resolve, reject) => {
    const output = fs.createWriteStream(outputZipPath);
    const archive = new ZipArchive({ zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`[Deploy] Standard hostinger-deploy.zip created (${(archive.pointer() / 1024 / 1024).toFixed(2)} MB).`);
      if (fs.existsSync(distDir)) {
        try {
          fs.copyFileSync(outputZipPath, outputDistZipPath);
        } catch (e) {
          // ignore
        }
      }
      resolve();
    });

    archive.on('error', (err: any) => {
      reject(err);
    });

    archive.pipe(output);

    // Append everything in dist EXCEPT hostinger-deploy.zip and .map files
    archive.glob('**/*', {
      cwd: distDir,
      dot: true,
      ignore: ['hostinger-deploy.zip', '*.map']
    });

    archive.finalize();
  });
}

createDeployZip()
  .then(() => {
    console.log('[Deploy] Build & zip packaging completed successfully.');
  })
  .catch((err) => {
    console.error('[Deploy] Zip packaging error:', err);
    process.exit(1);
  });
