# Bench Chakra Ring Debugging Guide

## Quick Test Steps

### 1. **Test Static HTML First**
Open `test-bench-chakra.html` in your browser:
```bash
# Open in browser or start a local server
python3 -m http.server 8000
# Then visit: http://localhost:8000/test-bench-chakra.html
```

**Expected Result:**
- You should see a large active chakra ring (100×100px)
- A smaller bench chakra ring (60×60px) positioned at the **lower-left** of the active ring
- Side-by-side comparison showing size difference

If this doesn't work, there's a CSS issue.
If this DOES work, there's a JavaScript issue.

---

### 2. **Add Debug Script to Battle Page**
Add this line to `battle.html` before the closing `</body>` tag:

```html
<script src="debug-bench-chakra.js"></script>
```

Then open battle.html and check the browser console (F12).

**Expected Console Output:**
```
Found 4 bench containers
Bench container 0: <div ...>
  - Unit ID: sasuke_123
  - Unit ring found!
  - Chakra frame found!
```

**Error Signs to Look For:**
- "Unit ring NOT found" = chakra wheels not being created
- "Found 0 bench containers" = HTML structure not being rendered
- Red outlines on page = bench containers without chakra wheels

---

### 3. **Visual Inspection Checklist**

Open battle.html and inspect with browser DevTools (F12):

#### Check 1: HTML Structure
Look for this structure in Elements tab:
```html
<div class="unit-card">
  <div class="active-portrait-container">
    <div class="unit-ring">
      <!-- active chakra ring content -->
    </div>

    <div class="bench-portrait-container">   ⬅️ Should be here!
      <div class="unit-ring">                ⬅️ With this inside!
        <!-- bench chakra ring content -->
      </div>
    </div>
  </div>
</div>
```

#### Check 2: CSS Applied
Select `.bench-portrait-container` in DevTools and verify:
- **Position:** `absolute`
- **Left:** `-25px`
- **Bottom:** `-15px`
- **Width:** `60px`
- **Height:** `60px`
- **Z-index:** `2`
- **Overflow:** `visible`

#### Check 3: Unit Ring Inside Bench
Select `.bench-portrait-container .unit-ring` and verify:
- **Width:** `60px`
- **Height:** `60px`

---

## Common Issues & Fixes

### Issue 1: Bench containers exist but no unit-ring inside
**Cause:** `createChakraWheel()` not being called for bench units

**Fix:** Check that `core.benchTeam` has units in battle.js:
```javascript
console.log('Bench team:', core.benchTeam);
```

---

### Issue 2: Bench chakra rings are too small to see
**Cause:** 60×60px might be too small

**Try:** Increase size in `css/battle-chakra-wheel.css`:
```css
.bench-portrait-container .unit-ring {
  width: 80px;   /* increased from 60px */
  height: 80px;  /* increased from 60px */
}
```

---

### Issue 3: Bench positioned off-screen
**Cause:** Negative left/bottom values

**Fix:** Adjust in `css/battle-team-holder.css`:
```css
.bench-portrait-container {
  left: 0px;      /* try 0 instead of -25px */
  bottom: -80px;  /* position below instead */
}
```

---

### Issue 4: Bench hidden behind active
**Cause:** Z-index issue

**Fix:** Increase z-index in `css/battle-team-holder.css`:
```css
.bench-portrait-container {
  z-index: 10;  /* increased from 2 */
}
```

---

## Manual Visual Test

Add this to battle-team-holder.css temporarily to make bench rings VERY obvious:

```css
.bench-portrait-container {
  /* Add bright border for testing */
  outline: 5px solid lime !important;
  background: rgba(0, 255, 0, 0.3) !important;
}

.bench-portrait-container .unit-ring {
  outline: 3px solid red !important;
}
```

If you still don't see **LIME and RED outlines**, then the bench containers aren't rendering at all.

---

## Expected Visual Result

```
┌─────────────────────────┐
│    ACTIVE CHAKRA RING   │  ⬅️ Large (100×100px)
│      ┌────────────┐     │
│      │  Portrait  │     │
│      └────────────┘     │
│                         │
│    ┌──────┐             │  ⬅️ Small bench ring (60×60px)
│    │ BENCH│             │      at lower left
│    └──────┘             │
└─────────────────────────┘
```

---

## Next Steps

1. Run test-bench-chakra.html first
2. Add debug script to battle.html
3. Check browser console for errors
4. Use DevTools to inspect HTML structure
5. Report back what you find!
