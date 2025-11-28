# UI Fixes and Mission System Updates - Status Report

## COMPLETED ✅

### 1. Currency Icons in Top Bar
**Status:** CSS Already Correct
- Icons sized at 24px × 24px
- Proper display: block and object-fit
- Filter and drop-shadow applied
- Located at: `assets/icons/currency/`
  - ninjapearl.png ✅
  - shinobite.png ✅
  - ryo.png ✅

**If icons still not showing:**
- Check browser console for 404 errors
- Verify image files aren't corrupted
- Try hard refresh (Ctrl+Shift+R)

### 2. Battle Rewards Script Added
**File:** `battle.html` line 200
- Added `<script defer src="js/battle/battle-rewards.js"></script>`
- Module will now load with battle system

### 3. Summon Animation Width Fixed
**File:** `css/summon-results.css`
- Reduced from 95% → **70% width/height**
- Changed from `object-fit: cover` → `contain`
- Better aspect ratio, zoomed out view

---

## PARTIALLY COMPLETE ⚠️

### 4. Mission Rewards Integration
**What's Done:**
- ✅ Battle-rewards.js module created (417866a commit)
- ✅ Chest collection system built
- ✅ End result screen with animations
- ✅ Script added to battle.html

**What's Needed:**
- ❌ Integration into battle-missions.js
- ❌ Call awardStageChest() on stage complete
- ❌ Call collectStageChest() before next stage
- ❌ Call showResultsScreen() on mission end

**Integration Code Needed:**
```javascript
// In battle-missions.js - onStageVictory()

// After defeating all enemies in stage:
const stageData = core.missionData.difficulties[core.difficulty][core.currentStageIndex];
await window.BattleRewards.awardStageChest(stageData, core.currentStageIndex, core);

// Before advancing to next stage:
await window.BattleRewards.collectStageChest(core);

// On final stage complete:
await window.BattleRewards.showResultsScreen(core);
```

---

## STILL TODO 📋

### 5. Mission Difficulties Standardization
**Current Issue:** Missions have random difficulty sets
- m_001: C, B
- m_002: C, A
- m_003: C, B
- m_004: B, S
- etc.

**Required:** All missions should have A, B, C (or A, B, C, S)

**Implementation:**
1. Open `data/missions.json`
2. For each mission, ensure it has at least A, B, C difficulties
3. Copy/paste structure from existing difficulties
4. Adjust enemy counts and rewards per difficulty

**Example:**
```json
{
  "id": "m_001",
  "difficulties": {
    "C": [...],  // Easy
    "B": [...],  // Normal
    "A": [...],  // Hard
    "S": [...]   // Very Hard (optional)
  }
}
```

### 6. "Other Worlds" Mission Tab
**Required:** New category for special missions

**Implementation:**
1. Add new missions to `missions.json`:
```json
{
  "id": "ow_001",
  "category": "Other Worlds",
  "name": "Dragon Island Blue",
  "banner": "assets/missions/banners/ow_dragon_blue.png",
  "sortOrder": 1,
  "difficulties": {
    "A": [...],
    "B": [...],
    "C": [...]
  }
}
```

2. Missions will automatically appear in new tab
3. `js/missions.js` already groups by category

**Suggested Other Worlds Missions:**
- Dragon Island Blue
- Dragon Island Red
- Dragon Island Green
- Phantom Castle
- Ninja Road
- Special Training Grounds

### 7. Granny Coins Shop Section
**Current:** Shop likely has text-based items
**Required:** PNG item images + Granny Coins currency

**Implementation Steps:**

**A. Add Granny Coins to Resources:**
```javascript
// In resources.js or wherever currency is tracked
resources.granny_coins = 0;
```

**B. Update Shop HTML:**
```html
<div class="shop-section granny-shop">
  <h2>Granny Cat's Shop</h2>
  <div class="shop-items">
    <div class="shop-item">
      <img src="assets/shop/items/acquisition_stone.png" alt="Acquisition Stone">
      <span class="item-name">Acquisition Stone</span>
      <span class="item-cost">
        <img src="assets/icons/granny_coin.png"> × 200
      </span>
      <button class="buy-btn">Buy</button>
    </div>
    <!-- More items... -->
  </div>
</div>
```

**C. Create Item PNGs:**
Need PNG images for:
- Acquisition Stones
- Ability Stones
- Limit Break Crystals
- Character Stones
- Awakening Materials
- Special Scrolls

**D. Granny Coin Icon:**
- Location: `assets/icons/granny_coin.png`
- Size: 24×24px recommended
- Style: Match game aesthetic

---

## Priority Order 🎯

1. **HIGH:** Mission Rewards Integration (code integration)
2. **HIGH:** Mission Difficulties (data update)
3. **MEDIUM:** Other Worlds Tab (new content)
4. **MEDIUM:** Granny Shop (UI + data)
5. **LOW:** Currency icon troubleshooting (if still not showing)

---

## Files Modified This Session

- `battle.html` - Added battle-rewards.js script
- `css/summon-results.css` - Reduced video size to 70%
- `css/top-bar.css` - Currency icons already correct

---

## Testing Checklist

### Summon Animation:
- [ ] Video plays for full duration (12s)
- [ ] Video is zoomed out (70% size)
- [ ] Aspect ratio looks correct

### Battle Rewards (Once Integrated):
- [ ] Chest appears after stage complete
- [ ] Chest collected on stage advance
- [ ] Results screen shows all chests
- [ ] Chests flash and reveal rewards
- [ ] Inventory updated with rewards

### Mission Difficulties:
- [ ] All missions have A, B, C ranks
- [ ] Icons display for each difficulty
- [ ] Can select and start any difficulty

### Other Worlds:
- [ ] New tab appears in missions.html
- [ ] Contains special missions
- [ ] Missions load and are playable

### Granny Shop:
- [ ] New shop section visible
- [ ] PNG items display
- [ ] Granny coin cost shows
- [ ] Can purchase items
- [ ] Inventory updated on purchase
