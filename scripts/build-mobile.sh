#!/bin/bash

# Mobile Build Script
# Prepares files for Capacitor mobile build

echo "🚀 Building for mobile..."

# Create www directory
mkdir -p www

# Copy all HTML files
echo "📄 Copying HTML files..."
cp *.html www/

# Rename home.html to index.html and old index.html to login.html for mobile
echo "🔄 Setting up mobile entry point..."
cd www
if [ -f "home.html" ] && [ -f "index.html" ]; then
  mv index.html login.html
  mv home.html index.html
fi
cd ..

# Copy assets
echo "📦 Copying assets, CSS, JS, and data..."
cp -r js css assets data www/

echo "✅ Web files prepared for mobile build!"
echo "📱 Running Capacitor sync..."

# Sync with Capacitor
npx cap sync

echo "🎉 Mobile build complete!"
echo ""
echo "Next steps:"
echo "  - Run 'npm run open:android' to open in Android Studio"
echo "  - Run 'npm run open:ios' to open in Xcode"
