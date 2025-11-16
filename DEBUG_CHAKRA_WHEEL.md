# Chakra Wheel Debug Guide

## 1. Check if PNG files exist

```bash
# Run these commands to verify files are present:
ls -la assets/ui/frames/chakraholder_icon.png
ls -la assets/ui/gauges/chakra.png

# If files don't exist, they need to be uploaded to:
# - assets/ui/frames/chakraholder_icon.png
# - assets/ui/gauges/chakra.png
```

## 2. Open Browser DevTools

1. Open the battle page in browser
2. Press `F12` to open DevTools
3. Go to **Console** tab

## 3. Check for Loading Errors

Look for errors like:
```
Failed to load resource: assets/ui/frames/chakraholder_icon.png
Failed to load resource: assets/ui/gauges/chakra.png
```

## 4. Inspect Chakra Slot Structure

In DevTools Console, run:
```javascript
// Find a chakra slot
const slot = document.querySelector('.chakra-slot');
console.log('Chakra slot:', slot);

// Check structure
console.log('Mask:', slot.querySelector('.chakra-mask'));
console.log('Segment:', slot.querySelector('.chakra-segment'));
console.log('Portrait:', slot.querySelector('.portrait-clipped'));
console.log('Frame:', slot.querySelector('.chakra-frame'));

// Check layering (z-index)
console.log('Frame z-index:', window.getComputedStyle(slot.querySelector('.chakra-frame')).zIndex);
console.log('Portrait z-index:', window.getComputedStyle(slot.querySelector('.portrait-clipped')).zIndex);
```

## 5. Check Sizing

```javascript
const slot = document.querySelector('.chakra-slot');
const frame = slot.querySelector('.chakra-frame');
const portrait = slot.querySelector('.portrait-clipped');

console.log('Container:', slot.offsetWidth, 'x', slot.offsetHeight);
console.log('Frame:', frame.offsetWidth, 'x', frame.offsetHeight);
console.log('Portrait:', portrait.offsetWidth, 'x', portrait.offsetHeight);

// Should show:
// Active: Container 140x140, Portrait 128x128, Frame 140x140
// Bench: Container 100x100, Portrait 88x88, Frame 100x100
```

## 6. Check Rotation

```javascript
const segment = document.querySelector('.chakra-segment');
console.log('Rotation:', window.getComputedStyle(segment).transform);
// Should show something like: matrix(...) which includes rotation
```

## 7. Enable Debug Outlines

Add this to browser console:
```javascript
document.querySelectorAll('.chakra-slot').forEach(slot => slot.classList.add('debug'));
document.querySelectorAll('.chakra-mask').forEach(mask => mask.classList.add('debug'));
document.querySelectorAll('.portrait-clipped').forEach(p => p.classList.add('debug'));
```

This will show colored outlines:
- Red: Chakra slot container
- Green: Chakra mask
- Blue: Portrait

## 8. Force PNG Reload

If PNGs are uploaded but not loading:
```javascript
// Clear image cache
const frames = document.querySelectorAll('.chakra-frame img');
const segments = document.querySelectorAll('.chakra-segment img');

frames.forEach(img => img.src = img.src + '?v=' + Date.now());
segments.forEach(img => img.src = img.src + '?v=' + Date.now());
```

## 9. Check Network Tab

1. Go to **Network** tab in DevTools
2. Filter by "Img" or "PNG"
3. Refresh the page
4. Look for:
   - `chakraholder_icon.png` - should be 200 OK
   - `chakra.png` - should be 200 OK
5. If 404 errors, files aren't in the right location

## 10. Verify Git Status

```bash
# Check if PNG files are tracked by git:
git status

# Check if they're in the latest commit:
git ls-files | grep -E "(chakraholder|chakra\.png)"

# Pull latest changes:
git pull origin claude/fix-chakra-ui-bugs-017gSiporvRkaAUtRaPdi7mY
```

## Expected Structure

```html
<div class="chakra-slot" data-unit-id="...">
  <div class="chakra-mask">
    <div class="chakra-segment"></div> <!-- or <img> if using PNGs -->
  </div>
  <img class="portrait-clipped" src="..." alt="...">
  <div class="chakra-frame"></div> <!-- or <img> if using PNGs -->
</div>
```

## CSS Fallback

If PNGs don't load, the system uses CSS fallback:
- **Segment**: Blue conic gradient (270° arc)
- **Frame**: Golden border with glow effect

## Common Issues

### Frame not visible
- Check z-index is 10 (not 1 or 3)
- Check width matches container (140px or 100px)
- Check border is visible in DevTools

### Bench units not showing
- Check container is 100px not 36px
- Check portrait is 88px not 32px
- Check they're not `display: none`

### Rotation not working
- Check `.chakra-segment` has `transform: rotate(Xdeg)`
- Check transition is working (0.3s ease-out)
- Verify unit.chakra value is updating

## Quick Fix Commands

```bash
# Re-pull latest code
git pull origin claude/fix-chakra-ui-bugs-017gSiporvRkaAUtRaPdi7mY

# Verify files exist
ls -la assets/ui/frames/
ls -la assets/ui/gauges/

# Check git tracking
git ls-tree -r HEAD --name-only | grep assets/ui
```
