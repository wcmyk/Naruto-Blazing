# Character Image Enhancement Guide

This guide explains how to enhance the quality of character images (portraits and full-body assets) without changing their dimensions.

## 🎯 Problem Solved

The character assets in `assets/characters/` were blurry and low quality. This enhancement script:
- ✅ Sharpens images to reduce blur
- ✅ Normalizes brightness and contrast
- ✅ Applies CLAHE (Contrast Limited Adaptive Histogram Equalization)
- ✅ Maintains exact same dimensions (200x200 for portraits, 600x600 for full-body)
- ✅ Optimizes PNG compression (often results in smaller file sizes)
- ✅ Processes all 2,287 character images automatically

## 🚀 Quick Start

### Test First (Recommended)

Before processing all 2,287 images, test on a few samples:

```bash
node scripts/test-enhancement.js
```

This will:
1. Process 3 sample images
2. Create backups with `_original.png` suffix
3. Show file size comparisons
4. Let you visually inspect the results

### Run Full Enhancement

Once satisfied with test results:

```bash
# Dry run (see what would be processed, no changes made)
npm run enhance:images:dry-run

# Full enhancement (processes all 2,287 images)
npm run enhance:images
```

**⚠️ Warning**: The full enhancement will:
- Process 2,287 images (takes ~10-15 minutes)
- Modify files in place (unless backup is enabled)
- Consume significant CPU/memory

## ⚙️ Configuration

Edit `scripts/enhance-character-images.js` to adjust settings:

### Sharpening (Lines 21-29)

```javascript
sharpen: {
  sigma: 1.5,      // Gaussian blur (0.3-3.0) - higher = more sharp
  m1: 1.0,         // Flat areas threshold
  m2: 2.0,         // Jagged areas threshold
  x1: 3.0,         // Slope for flat areas
  y2: 15.0,        // Slope for jagged areas
  y3: 15.0         // Maximum brightening
}
```

**Recommendations**:
- **Light sharpening**: `sigma: 1.0` (subtle enhancement)
- **Medium sharpening**: `sigma: 1.5` (default, balanced)
- **Heavy sharpening**: `sigma: 2.5` (maximum detail, may cause artifacts)

### Enable Backups (Line 16)

```javascript
createBackup: true,  // Set to true to keep original images
```

When enabled:
- Original images saved to `assets/characters_backup/`
- Maintains same directory structure
- Allows easy rollback if needed
- **Doubles disk space usage** (1.5GB → 3GB)

### Adjust Processing Speed (Lines 45-46)

```javascript
batchSize: 50,          // Images per batch
concurrentLimit: 5      // Parallel processing limit
```

**For faster processing** (if you have a powerful machine):
```javascript
batchSize: 100,
concurrentLimit: 10
```

**For slower machines** (to avoid out-of-memory errors):
```javascript
batchSize: 25,
concurrentLimit: 2
```

## 📊 Expected Results

Based on test results:

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Portrait dimensions | 200x200 | 200x200 | ✅ Same |
| Full-body dimensions | 600x600 | 600x600 | ✅ Same |
| Portrait file size | ~66KB | ~34KB | 📉 49% smaller |
| Full-body file size | ~445KB | ~383KB | 📉 14% smaller |
| Image quality | Blurry | Sharp | ✨ Enhanced |
| Total processing time | - | ~10-15 min | - |

## 🛠️ Advanced Usage

### Process Specific Characters

Edit `scripts/enhance-character-images.js` and modify the `findCharacterImages()` function:

```javascript
// Only process characters starting with "naruto"
if (!dir.startsWith('naruto')) continue;

// Only process 6S tier images
if (!file.includes('_6S.png')) continue;
```

### Custom Enhancement Profile

Create a new config preset:

```javascript
// For anime-style art
enhancement: {
  sharpen: { sigma: 1.8 },
  normalize: true,
  clahe: { width: 5, height: 5, maxSlope: 2 }
}

// For realistic art
enhancement: {
  sharpen: { sigma: 1.2 },
  normalize: false,
  clahe: { width: 3, height: 3, maxSlope: 4 }
}
```

## 🔄 Rollback

### If You Enabled Backups

```bash
# Restore all original images
rm -rf assets/characters
mv assets/characters_backup assets/characters
```

### If You Didn't Enable Backups

1. **Git restore** (if committed):
   ```bash
   git checkout HEAD -- assets/characters
   ```

2. **Test images have backups**:
   ```bash
   # Restore test images
   cd assets/characters/anko_094
   mv portrait_3S_original.png portrait_3S.png
   mv full_3S_original.png full_3S.png
   ```

## 📈 Performance Tuning

### Monitor Progress

The script shows real-time progress:
```
[45.2%] Processed: 1034 | Failed: 0 | Rate: 8.5/s | Time: 121.7s
```

- **Rate**: Images processed per second
- **Failed**: Number of errors (should be 0)
- **Progress**: Overall completion percentage

### Troubleshooting

**Out of Memory Errors**:
- Reduce `concurrentLimit` to 2-3
- Reduce `batchSize` to 25
- Process in multiple runs (modify character filter)

**Slow Processing**:
- Increase `concurrentLimit` (if CPU allows)
- Close other applications
- Run on a more powerful machine

**Failed Images**:
- Check error messages at end of run
- Manually inspect failed images
- May be corrupted source files

## 🧪 Testing & Validation

### Visual Inspection

After enhancement, check a few random images:

```bash
# Open test images in browser/image viewer
firefox assets/characters/anko_094/portrait_3S.png
firefox assets/characters/anko_094/portrait_3S_original.png
```

Compare:
- ✅ Edges should be sharper
- ✅ Colors should be more vibrant
- ✅ Details should be clearer
- ❌ No visible artifacts (halos, noise)

### Metadata Verification

```bash
# Check dimensions unchanged
npm install -g sharp-cli
sharp-cli assets/characters/anko_094/portrait_3S.png --info
```

## 📝 Technical Details

**Enhancement Pipeline**:
1. **Normalize**: Auto-adjust brightness/contrast levels
2. **CLAHE**: Local contrast enhancement (prevents over-brightening)
3. **Sharpen**: Unsharp mask with custom parameters
4. **Resize**: Ensure exact dimensions with Lanczos3 resampling
5. **PNG Encode**: Maximum quality, optimized compression

**Sharp Library**:
- Version: ^0.34.5
- Backend: libvips (high-performance image processing)
- Multi-threaded: Yes (automatic)
- Memory efficient: Streams images, not full buffers

## 🎓 Understanding the Settings

### Sigma (Sharpening Intensity)

- **Low (0.5-1.0)**: Very subtle, natural look
- **Medium (1.5-2.0)**: Noticeable improvement, balanced
- **High (2.5-3.5)**: Maximum sharpness, risk of artifacts

### CLAHE (Contrast Enhancement)

- **width/height**: Local region size for contrast adjustment
- **maxSlope**: Maximum contrast enhancement (higher = more dramatic)

### PNG Quality

- **quality**: 1-100 (100 = lossless)
- **compressionLevel**: 0-9 (9 = smallest file, slower)
- **effort**: 1-10 (10 = maximum optimization)

## 📞 Support

Issues with enhancement:
1. Check this documentation
2. Run test script first
3. Inspect error messages
4. Adjust configuration settings
5. Create GitHub issue with details

---

**Last Updated**: 2025-12-29
**Script Version**: 1.0.0
**Author**: Automated Enhancement System
