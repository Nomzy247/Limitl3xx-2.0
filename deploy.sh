#!/usr/bin/env bash

# ==============================================================================
# PoolMining.cloud - Production Build & Hostinger Deployment Automator
# ==============================================================================
# This script:
# 1. Validates node & npm dependencies
# 2. Injects production environment variables (.env.production / firebase config)
# 3. Compiles the optimized React 19 + Vite bundle
# 4. Generates the Workbox offline Service Worker (sw.js)
# 5. Generates the robust .htaccess for Apache / Hostinger SPA routing
# 6. Bundles a ready-to-upload 'hostinger-deploy.zip' file
# ==============================================================================

set -e # Exit immediately on error

echo "🚀 [1/6] Initializing PoolMining deployment build..."

# Step 1: Clean previous build artifacts
echo "🧹 [2/6] Cleaning up old distribution artifacts..."
rm -rf dist hostinger-deploy.zip

# Step 2: Install dependencies if missing
if [ ! -d "node_modules" ]; then
  echo "📦 Installing npm dependencies..."
  npm install
fi

# Step 3: Compile TypeScript and generate Vite production bundle + Workbox Service Worker
echo "⚙️ [3/6] Building production application with Vite & Workbox..."
export NODE_ENV=production
npm run build

# Step 4: Write Hostinger .htaccess file into dist/
echo "📝 [4/6] Generating Hostinger .htaccess for SPA routing and caching..."
cat << 'EOF' > dist/.htaccess
# ====================================================================
# Hostinger Apache Configuration for React Router SPA & PWA
# ====================================================================

# 1. Enable Rewrite Engine for Single Page Application (SPA) Routing
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Automatically force HTTPS protocol
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

  # Do not rewrite existing physical files, directories, or symlinks
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l

  # Forward all other routes to index.html for React Router
  RewriteRule . /index.html [L]
</IfModule>

# 2. Performance, Service Worker & Cache Invalidation Headers
<IfModule mod_headers.c>
  # NEVER cache index.html or sw.js so users receive updates immediately
  <FilesMatch "^(index\.html|sw\.js)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires 0
  </FilesMatch>

  # Service-Worker-Allowed header to allow root scope
  <FilesMatch "^sw\.js$">
    Header set Service-Worker-Allowed "/"
  </FilesMatch>

  # Long-term cache for immutable hashed assets (JS, CSS, images, fonts)
  <FilesMatch "\.(js|css|webp|png|jpg|jpeg|svg|ico|woff|woff2|ttf)$">
    Header set Cache-Control "max-age=31536000, public, immutable"
  </FilesMatch>

  # Security headers
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# 3. Enable GZIP & Deflate Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json application/xml
</IfModule>
EOF

# Step 5: Verify build outputs
echo "🔍 [5/6] Verifying build integrity..."
if [ ! -f "dist/index.html" ]; then
  echo "❌ Error: dist/index.html not found!"
  exit 1
fi

if [ ! -f "dist/sw.js" ]; then
  echo "⚠️ Warning: dist/sw.js not found. Service worker may not be included."
fi

if [ ! -f "dist/.htaccess" ]; then
  echo "❌ Error: dist/.htaccess was not created!"
  exit 1
fi

# Step 6: Create deployable ZIP package for Hostinger File Manager upload
echo "📦 [6/6] Creating 'hostinger-deploy.zip' package..."
if command -v zip &> /dev/null; then
  (cd dist && zip -r ../hostinger-deploy.zip . -x ".*" -x "__MACOSX" -i "*")
  # Include dotfiles like .htaccess specifically
  (cd dist && zip -u ../hostinger-deploy.zip .htaccess)
  echo "✅ Package created: hostinger-deploy.zip"
else
  echo "ℹ️ 'zip' command not found, the compiled files are in the 'dist/' folder."
fi

echo ""
echo "========================================================================"
echo "🎉 Build Complete & Ready for Hostinger!"
echo "========================================================================"
echo "Next steps for Hostinger deployment:"
echo "1. Log in to Hostinger hPanel -> Websites -> File Manager."
echo "2. Open the 'public_html' directory."
echo "3. Upload and extract 'hostinger-deploy.zip' (or upload the contents of 'dist/')."
echo "4. Ensure .htaccess is present in public_html."
echo "========================================================================"
