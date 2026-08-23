import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const distPath = path.resolve(process.cwd(), 'dist');
const zipPath = path.resolve(process.cwd(), 'hostinger-deploy.zip');
const publicZipPath = path.resolve(distPath, 'hostinger-deploy.zip');

function addFolderToZip(zip: JSZip, folderPath: string, relativePath = '') {
  const items = fs.readdirSync(folderPath);

  for (const item of items) {
    if (item === 'hostinger-deploy.zip') continue;

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

async function buildZip() {
  console.log('📦 Bundling dist into hostinger-deploy.zip using JSZip...');
  const zip = new JSZip();

  // Recursively add all files from dist (including hidden files like .htaccess)
  addFolderToZip(zip, distPath);

  const content = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  fs.writeFileSync(zipPath, content);
  fs.writeFileSync(publicZipPath, content);

  console.log(`✅ Success! Created hostinger-deploy.zip (${(content.length / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`📁 Saved to project root: ${zipPath}`);
  console.log(`🌐 Accessible via public URL: /hostinger-deploy.zip`);
}

buildZip().catch(console.error);
