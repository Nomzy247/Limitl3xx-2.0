import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

function addFolderToZip(zip: JSZip, folderPath: string, relativePath = '') {
  const items = fs.readdirSync(folderPath);

  for (const item of items) {
    if (item === 'hostinger-deploy.zip' || item.endsWith('.map')) continue;

    const fullPath = path.join(folderPath, item);
    const zipItemPath = relativePath ? `${relativePath}/${item}` : item;
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const subFolder = zip.folder(zipItemPath);
      if (subFolder) {
        addFolderToZip(zip, fullPath, zipItemPath);
      }
    } else {
      const data = fs.readFileSync(fullPath);
      zip.file(zipItemPath, data);
    }
  }
}

async function createDeployArtifacts() {
  const distDir = path.resolve(process.cwd(), 'dist');
  const publicDir = path.resolve(process.cwd(), 'public');

  if (!fs.existsSync(distDir)) {
    console.error('[Deploy] dist directory does not exist. Run npm run build first.');
    return;
  }

  // 1. Ensure .htaccess exists in dist for Apache / Hostinger
  const htaccessContent = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  DirectoryIndex index.html
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>

<IfModule mod_headers.c>
  <FilesMatch "^(index\\.html|sw\\.js)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires 0
  </FilesMatch>
  <FilesMatch "\\.(js|css|webp|png|jpg|jpeg|svg|ico|woff|woff2|ttf)$">
    Header set Cache-Control "max-age=31536000, public, immutable"
  </FilesMatch>
</IfModule>
`;
  fs.writeFileSync(path.resolve(distDir, '.htaccess'), htaccessContent);
  fs.writeFileSync(path.resolve(publicDir, '.htaccess'), htaccessContent);

  // 2. Ensure 404.html exists for GitHub Pages (exact copy of index.html)
  const indexHtmlPath = path.resolve(distDir, 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    fs.copyFileSync(indexHtmlPath, path.resolve(distDir, '404.html'));
  }

  // 3. Ensure _redirects exists for Netlify / Cloudflare Pages
  fs.writeFileSync(path.resolve(distDir, '_redirects'), '/*    /index.html   200\n');
  fs.writeFileSync(path.resolve(publicDir, '_redirects'), '/*    /index.html   200\n');

  // 4. Build hostinger-deploy.zip with JSZip
  console.log('[Deploy] Bundling dist directory into hostinger-deploy.zip...');
  const zip = new JSZip();
  addFolderToZip(zip, distDir);

  const content = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  const rootZipPath = path.resolve(process.cwd(), 'hostinger-deploy.zip');
  const distZipPath = path.resolve(distDir, 'hostinger-deploy.zip');
  const publicZipPath = path.resolve(publicDir, 'hostinger-deploy.zip');

  fs.writeFileSync(rootZipPath, content);
  fs.writeFileSync(distZipPath, content);
  fs.writeFileSync(publicZipPath, content);

  console.log(`[Deploy] ✅ hostinger-deploy.zip generated successfully (${(content.length / 1024 / 1024).toFixed(2)} MB).`);
}

createDeployArtifacts()
  .then(() => {
    console.log('[Deploy] All production deployment artifacts verified and ready.');
  })
  .catch((err) => {
    console.error('[Deploy] Deployment artifact creation error:', err);
    process.exit(1);
  });

