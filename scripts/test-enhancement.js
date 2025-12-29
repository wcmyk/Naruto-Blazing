#!/usr/bin/env node

/**
 * Test Enhancement Script
 * Processes just a few sample images to verify the enhancement works
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const TEST_IMAGES = [
  'assets/characters/anko_094/portrait_3S.png',
  'assets/characters/anko_094/full_3S.png',
  'assets/characters/acquisition_1016/portrait_6S.png'
];

async function enhanceImage(imagePath) {
  const fullPath = path.join(__dirname, '..', imagePath);

  console.log(`\n📸 Processing: ${imagePath}`);

  try {
    // Get original metadata
    const originalMeta = await sharp(fullPath).metadata();
    console.log(`  Original: ${originalMeta.width}x${originalMeta.height}, ${(originalMeta.size / 1024).toFixed(1)}KB`);

    // Create backup
    const backupPath = fullPath.replace('.png', '_original.png');
    await fs.copyFile(fullPath, backupPath);
    console.log(`  ✅ Backup created: ${path.basename(backupPath)}`);

    // Apply enhancements
    const enhanced = await sharp(fullPath)
      .normalize()
      .clahe({ width: 3, height: 3, maxSlope: 3 })
      .sharpen({
        sigma: 1.5,
        m1: 1.0,
        m2: 2.0,
        x1: 3.0,
        y2: 15.0,
        y3: 15.0
      })
      .resize(originalMeta.width, originalMeta.height, {
        fit: 'fill',
        kernel: 'lanczos3'
      })
      .png({
        quality: 100,
        compressionLevel: 6,
        palette: false,
        effort: 10
      })
      .toBuffer();

    // Save enhanced version
    await fs.writeFile(fullPath, enhanced);

    // Get new metadata
    const newMeta = await sharp(fullPath).metadata();
    console.log(`  Enhanced: ${newMeta.width}x${newMeta.height}, ${(newMeta.size / 1024).toFixed(1)}KB`);
    console.log(`  ✅ Enhancement complete!`);

    return { success: true, path: imagePath };
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return { success: false, path: imagePath, error: error.message };
  }
}

async function main() {
  console.log('🧪 Testing Image Enhancement on Sample Images\n');
  console.log(`Will process ${TEST_IMAGES.length} test images:`);
  TEST_IMAGES.forEach(img => console.log(`  - ${img}`));

  for (const image of TEST_IMAGES) {
    await enhanceImage(image);
  }

  console.log('\n✅ Test complete!');
  console.log('\n📝 Next steps:');
  console.log('  1. Check the enhanced images visually');
  console.log('  2. Compare with *_original.png backups');
  console.log('  3. If satisfied, run: npm run enhance:images');
  console.log('  4. To restore: rename *_original.png back to original names');
}

main().catch(console.error);
