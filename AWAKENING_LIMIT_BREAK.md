# Awakening & Limit Break System

## Overview

The Awakening and Limit Break System allows players to enhance their characters beyond normal limits through:

1. **Awakening (Tier Promotion)** - Promote characters to higher star tiers with material costs
2. **Limit Break** - Push max-tier characters beyond their normal level caps for additional stat bonuses

## Features

### 1. Materials & Resources System (`js/resources.js`)

**Material Types:**
- **Awakening Stones** (3★ to 9★) - Required to awaken characters
- **Limit Break Crystals** - Required for limit breaking
- **Dupe Crystals** - Obtained from duplicate characters
- **Element Scrolls** - Body, Skill, Bravery, Wisdom, Heart
- **Character Stones** - Character-specific awakening materials
- **Ryo** - In-game currency

**Storage:**
- Stored in `localStorage` under key `blazing_resources_v1`
- Persistent across sessions
- Default starter materials provided on first load

**API:**
```javascript
Resources.get(materialId)              // Get amount of material
Resources.add(materialId, amount)      // Add materials
Resources.subtract(materialId, amount) // Remove materials
Resources.canAfford(costs)             // Check if player can afford costs
Resources.spend(costs)                 // Spend materials (atomic operation)
```

### 2. Awakening System (`js/awakening.js`)

**Awakening Requirements:**
- Character must be at **MAX level** for current tier
- Character must not be at MAX tier
- Player must have required materials (defined in `data/awakening-requirements.json`)

**Awakening Process:**
1. Character level resets to 1 (default behavior)
2. Character advances to next tier (e.g., 6S → 6SB)
3. Materials are consumed
4. New tier artwork and stats apply

**Material Requirements (per tier):**
```json
{
  "5S": {
    "nextTier": "6S",
    "materials": {
      "awakening_stone_5": 10,
      "scroll_bravery": 8,
      "character_stone": 3,
      "ryo": 20000
    }
  }
}
```

**API:**
```javascript
Awakening.canAwaken(inst, character)           // Check if can awaken
Awakening.canAffordAwaken(inst, character)     // Check if has materials
Awakening.performAwaken(inst, character, mode) // Perform awakening
Awakening.getAwakeningPreview(inst, character) // Preview stats after awakening
```

### 3. Limit Break System (`js/limit-break.js`)

**Limit Break Requirements:**
- Character must be at **MAX tier** for that character
- Character must be at **MAX level** for that tier
- Player must have required materials

**Limit Break Benefits:**
- **Stat Bonuses:** Each LB level increases stats by 1.5-2.5%
  - HP: +2% per level
  - ATK: +2.5% per level
  - DEF: +2% per level
  - Speed: +1.5% per level
  - Chakra: +1% per level
- **Extended Level Cap:** +2 levels per LB (optional feature)

**Maximum LB Levels by Tier:**
```javascript
{
  "6S": 5,
  "6SB": 5,
  "7S": 10,
  "7SL": 10,
  "8S": 15,
  "8SM": 15,
  "9S": 20,
  "9ST": 20,
  "10SO": 25
}
```

**Material Costs:**
- Base cost per tier (e.g., 6S requires 1 LB Crystal + 10,000 Ryo)
- Cost multiplies by (current LB level + 1)
- Example: 3rd LB on 6S = 3 LB Crystals + 30,000 Ryo

**API:**
```javascript
LimitBreak.canLimitBreak(inst, character)        // Check eligibility
LimitBreak.canAffordLimitBreak(inst, character)  // Check materials
LimitBreak.performLimitBreak(inst, character)    // Perform LB
LimitBreak.applyLimitBreakToStats(stats, lbLevel) // Calculate LB bonuses
```

### 4. Character Instance Schema Extensions

**New Fields:**
```javascript
{
  uid: "abc123",
  charId: "naruto_01",
  level: 100,
  tierCode: "7S",
  limitBreakLevel: 3  // NEW: 0 if not limit broken
}
```

## UI Components

### Character Modal (characters.html)

**New Elements:**
1. **Limit Break Button** - Purple gradient button next to Awaken button
2. **LB Info Panel** - Displays current LB level (e.g., "LB: 3/10")
3. **LB Bonus Display** - Shows stat bonus percentages
4. **Materials Display** - Shows required materials with owned/required counts

**Visual Indicators:**
- Green text: Sufficient materials
- Red text: Insufficient materials
- Purple: Limit break UI elements
- Gold: Awakening materials header

### Resources Page (resources.html)

**Features:**
- View all materials and their quantities
- Organized by category (Awakening Stones, Scrolls, etc.)
- Developer controls for testing:
  - Add 100/500 to all materials
  - Add 100,000 Ryo
  - Reset to defaults
- Accessible via Settings → View Resources

## CSS Styling

**New Classes:**
```css
.btn-limitbreak        - Purple gradient button
.limitbreak-info       - LB info panel
.lb-level              - LB level display
.lb-bonus              - Stat bonus text
.materials-display     - Materials requirement panel
.material-item         - Individual material row
.material-amount.sufficient    - Green text
.material-amount.insufficient  - Red text
```

## File Structure

```
Naruto-Blazing/
├── js/
│   ├── resources.js          (NEW) - Materials inventory system
│   ├── awakening.js          (NEW) - Awakening logic with material costs
│   ├── limit-break.js        (NEW) - Limit break system
│   ├── characters.js         (MODIFIED) - Updated UI integration
│   ├── character_inv.js      (EXISTING) - Character instance storage
│   └── progression.js        (EXISTING) - Tier/level progression
├── data/
│   └── awakening-requirements.json  (NEW) - Material requirements per tier
├── css/
│   └── characters.css        (MODIFIED) - New LB and materials styling
├── characters.html           (MODIFIED) - Added LB button and materials display
├── resources.html            (NEW) - Resources viewer page
├── index.html                (MODIFIED) - Added resources link in settings
└── AWAKENING_LIMIT_BREAK.md  (NEW) - This documentation
```

## Testing Guide

### 1. Test Awakening
1. Go to Characters page
2. Select a character at max level
3. Check "Awakening Materials Required" panel
4. Use developer controls in resources.html to add materials if needed
5. Click "Awaken" button
6. Verify:
   - Materials are consumed
   - Character advances to next tier
   - Level resets to 1
   - Stats update correctly
   - New tier artwork appears

### 2. Test Limit Break
1. Get a character to max tier AND max level
2. Verify LB panel shows "LB: 0/X"
3. Check material requirements
4. Click "Limit Break" button
5. Confirm the material cost dialog
6. Verify:
   - Materials are consumed
   - LB level increases (e.g., LB: 1/10)
   - Stat bonuses are applied and displayed
   - Stats increase correctly (2-2.5% per stat)

### 3. Test Materials System
1. Go to Settings → View Resources
2. Verify all material categories display
3. Test developer controls:
   - Add materials
   - Add Ryo
   - Reset to defaults
4. Return to characters page and verify material counts match

### 4. Test Edge Cases
- Try awakening at max tier (should be disabled)
- Try LB without materials (should show error)
- Try LB at max LB level (button should be disabled)
- Refresh page and verify persistence

## Developer Notes

### Adding New Material Types

1. Add to `MATERIAL_TYPES` in `js/resources.js`
2. Update `data/awakening-requirements.json` if used for awakening
3. Update `getLimitBreakCost()` in `js/limit-break.js` if used for LB

### Adjusting LB Bonuses

Edit `LIMIT_BREAK_BONUS_PER_LEVEL` in `js/limit-break.js`:
```javascript
const LIMIT_BREAK_BONUS_PER_LEVEL = {
  hp: 0.02,      // 2% per level
  atk: 0.025,    // 2.5% per level
  // ... adjust as needed
};
```

### Adjusting Material Costs

Edit `data/awakening-requirements.json` for awakening costs.

Edit `getLimitBreakCost()` function in `js/limit-break.js` for LB costs.

### Database Schema

Materials are stored in localStorage:
```javascript
// Key: "blazing_resources_v1"
{
  "awakening_stone_3": 50,
  "awakening_stone_4": 30,
  "limit_break_crystal": 5,
  "ryo": 100000,
  // ...
}
```

Character instances:
```javascript
// Key: "blazing_inventory_v2"
[
  {
    "uid": "abc123",
    "charId": "naruto_01",
    "level": 100,
    "tierCode": "7S",
    "limitBreakLevel": 3
  }
]
```

## Known Limitations

1. Awakening always resets level to 1 (by design)
2. Limit break is only available at max tier
3. No visual effect/animation for awakening/LB (future enhancement)
4. Materials cannot be sold or traded (future feature)

## Future Enhancements

- [ ] Awakening animations
- [ ] Limit break visual effects
- [ ] Character-specific awakening requirements
- [ ] Material farming missions
- [ ] Trade system for materials
- [ ] Bulk awakening/LB
- [ ] Awakening preview stats comparison
- [ ] Achievement system for LB milestones
