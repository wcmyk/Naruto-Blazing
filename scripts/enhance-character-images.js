#!/usr/bin/env node

/**
 * Character Image Enhancement Script
 *
 * Uses Sharp library to enhance blurry character assets without changing dimensions.
 * Applies sharpening, contrast adjustment, and noise reduction.
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  // Source directory
  sourceDir: path.join(__dirname, '../assets/characters'),

  // Backup original images before processing
  createBackup: false,
  backupDir: path.join(__dirname, '../assets/characters_backup'),

  // Enhancement settings
  enhancement: {
    // Sharpening (higher = sharper, but too high causes artifacts)
    sharpen: {
      sigma: 1.5,      // Gaussian mask sigma (0.3 - 3.0)
      m1: 1.0,         // Flat areas threshold
      m2: 2.0,         // Jagged areas threshold
      x1: 3.0,         // Slope for flat areas
      y2: 15.0,        // Slope for jagged areas
      y3: 15.0         // Maximum brightening
    },

    // Normalize (auto-adjust brightness/contrast)
    normalize: true,

    // PNG compression quality (1-9, higher = better quality but larger file)
    pngQuality: 100,
    pngCompressionLevel: 6,  // 0-9 (0=none, 9=best)

    // Additional filters
    clahe: {
      width: 3,
      height: 3,
      maxSlope: 3
    }
  },

  // Processing options
  batchSize: 50,           // Process images in batches to avoid memory issues
  concurrentLimit: 5       // Max concurrent image processing
};

// Statistics
const stats = {
  total: 0,
  processed: 0,
  failed: 0,
  skipped: 0,
  startTime: Date.now()
};

/**
 * Find all PNG files in character directories
 */
async function findCharacterImages() {
  const images = [];

  try {
    const characterDirs = await fs.readdir(CONFIG.sourceDir);

    for (const dir of characterDirs) {
      const dirPath = path.join(CONFIG.sourceDir, dir);
      const stat = await fs.stat(dirPath);

      if (stat.isDirectory()) {
        const files = await fs.readdir(dirPath);

        for (const file of files) {
          if (file.endsWith('.png')) {
            images.push(path.join(dirPath, file));
          }
        }
      }
    }
  } catch (error) {
    console.error('Error finding images:', error.message);
    throw error;
  }

  return images;
}

/**
 * Create backup of an image
 */
async function backupImage(imagePath) {
  if (!CONFIG.createBackup) return;

  const relativePath = path.relative(CONFIG.sourceDir, imagePath);
  const backupPath = path.join(CONFIG.backupDir, relativePath);
  const backupDir = path.dirname(backupPath);

  await fs.mkdir(backupDir, { recursive: true });
  await fs.copyFile(imagePath, backupPath);
}

/**
 * Enhance a single image
 */
async function enhanceImage(imagePath) {
  try {
    // Read original image to get dimensions
    const metadata = await sharp(imagePath).metadata();
    const { width, height } = metadata;

    // Backup if enabled
    if (CONFIG.createBackup) {
      await backupImage(imagePath);
    }

    // Apply enhancements
    let pipeline = sharp(imagePath);

    // Normalize (auto-adjust levels)
    if (CONFIG.enhancement.normalize) {
      pipeline = pipeline.normalize();
    }

    // Apply CLAHE for better contrast
    pipeline = pipeline.clahe(CONFIG.enhancement.clahe);

    // Sharpen to reduce blur
    pipeline = pipeline.sharpen(CONFIG.enhancement.sharpen);

    // Ensure same dimensions (resize if needed)
    pipeline = pipeline.resize(width, height, {
      fit: 'fill',
      kernel: 'lanczos3'  // High-quality resampling
    });

    // Output as PNG with high quality
    pipeline = pipeline.png({
      quality: CONFIG.enhancement.pngQuality,
      compressionLevel: CONFIG.enhancement.pngCompressionLevel,
      palette: false,  // Use full RGBA
      effort: 10       // Maximum compression effort
    });

    // Save enhanced image (overwrite original)
    await pipeline.toFile(imagePath + '.tmp');

    // Replace original with enhanced version
    await fs.rename(imagePath + '.tmp', imagePath);

    stats.processed++;
    return { success: true, path: imagePath };

  } catch (error) {
    stats.failed++;
    return {
      success: false,
      path: imagePath,
      error: error.message
    };
  }
}

/**
 * Process images in batches with concurrency limit
 */
async function processBatch(images) {
  const results = [];

  for (let i = 0; i < images.length; i += CONFIG.concurrentLimit) {
    const batch = images.slice(i, i + CONFIG.concurrentLimit);
    const batchResults = await Promise.all(
      batch.map(img => enhanceImage(img))
    );
    results.push(...batchResults);

    // Progress update
    const progress = ((stats.processed + stats.failed) / stats.total * 100).toFixed(1);
    const elapsed = ((Date.now() - stats.startTime) / 1000).toFixed(1);
    const rate = ((stats.processed + stats.failed) / elapsed).toFixed(1);

    process.stdout.write(
      `\r[${progress}%] Processed: ${stats.processed} | Failed: ${stats.failed} | ` +
      `Rate: ${rate}/s | Time: ${elapsed}s`
    );
  }

  return results;
}

/**
 * Main execution
 */
async function main() {
  console.log('🎨 Character Image Enhancement Script\n');
  console.log('Configuration:');
  console.log(`  Source: ${CONFIG.sourceDir}`);
  console.log(`  Backup: ${CONFIG.createBackup ? 'Enabled' : 'Disabled'}`);
  console.log(`  Sharpen Sigma: ${CONFIG.enhancement.sharpen.sigma}`);
  console.log(`  Normalize: ${CONFIG.enhancement.normalize}`);
  console.log(`  PNG Quality: ${CONFIG.enhancement.pngQuality}`);
  console.log('');

  // Find all images
  console.log('🔍 Finding character images...');
  const images = await findCharacterImages();
  stats.total = images.length;

  console.log(`✅ Found ${stats.total} images to process\n`);

  if (stats.total === 0) {
    console.log('No images found. Exiting.');
    return;
  }

  // Confirm before processing
  if (process.argv.includes('--dry-run')) {
    console.log('🔍 Dry run mode - no images will be modified');
    console.log(`Would process ${stats.total} images`);
    return;
  }

  // Create backup directory if needed
  if (CONFIG.createBackup) {
    await fs.mkdir(CONFIG.backupDir, { recursive: true });
    console.log(`📦 Backups will be saved to: ${CONFIG.backupDir}\n`);
  }

  // Process images
  console.log('🚀 Starting enhancement...\n');
  const results = await processBatch(images);

  // Final statistics
  console.log('\n\n✅ Enhancement Complete!\n');
  console.log('Statistics:');
  console.log(`  Total: ${stats.total}`);
  console.log(`  Processed: ${stats.processed}`);
  console.log(`  Failed: ${stats.failed}`);
  console.log(`  Time: ${((Date.now() - stats.startTime) / 1000).toFixed(1)}s`);
  console.log(`  Rate: ${(stats.processed / ((Date.now() - stats.startTime) / 1000)).toFixed(1)} images/sec`);

  // Show failed images
  if (stats.failed > 0) {
    console.log('\n⚠️  Failed images:');
    results
      .filter(r => !r.success)
      .forEach(r => console.log(`  - ${r.path}: ${r.error}`));
  }

  console.log('\n✨ Done!');
}

// Run script
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { enhanceImage, findCharacterImages };
