# Mission Rewards System Implementation Guide

## Overview
Comprehensive mission reward system with chest collection, stage transitions, and results screen.

## What's Been Implemented ✅

### 1. Battle Rewards Module (`js/battle/battle-rewards.js`)

**Features:**
- ✅ Chest appearance on battlefield after stage completion
- ✅ Auto-collection when advancing to next stage
- ✅ End-of-mission results screen with chest reveals
- ✅ Animated chest reveal with flash effects
- ✅ Automatic reward distribution to inventory
- ✅ Support for all reward types (ryo, ramen, characters, materials)

**Reward Types Supported:**
```
- ryo (currency)
- pearls (premium currency)
- ramen_1star, ramen_2star, ramen_3star (exp items)
- scroll_3star through scroll_6star (awakening scrolls)
- scroll_body, scroll_skill, scroll_bravery, scroll_wisdom, scroll_heart (element scrolls)
- awakening_stone_3, awakening_stone_4, awakening_stone_5 (awakening materials)
- character_stone (for character acquisition)
- limit_break_crystal, dupe_crystal (limit break materials)
```

### 2. Per-Stage Rewards (`data/missions.json`)

**Example Implementation:**
```json
{
  "stage": 1,
  "map": "assets/maps/bg_020101_mori.png",
  "waves": [ { "enemies": ["slime_01"] } ],
  "rewards": {
    "ryo": 300,
    "ramen_1star": 1
  }
}
```

**Mission m_001 Updated:**
- C difficulty: All 3 stages have rewards
- B difficulty: All 3 stages have rewards

## How It Works 🎮

### Stage Completion Flow:
1. **Defeat all enemies** in current stage
2. **Chest appears** on battlefield (golden chest with animated float)
3. **Auto-collect** triggered when advancing to next stage
4. **Chest flies up** with collection animation
5. **Rewards stored** in collected chests array

### End of Mission:
1. All stages complete
2. **Results screen appears** with dramatic fade-in
3. **Chests display** one-by-one with stagger effect
4. Each **chest flashes** 3 times
5. **Rewards reveal** - chest fades, items appear
6. **Inventory updated** automatically
7. Click **CONTINUE** → Return to missions page

## CSS Animations 🎨

**Implemented Animations:**
- `chestAppear` - Chest spawns with rotation and scale
- `chestFloat` - Idle floating up/down motion
- `chestCollect` - Flies upward and shrinks
- `chestFlash` - Golden glow pulse effect
- `cardAppear` - Staggered card entrance on results screen
- `fadeIn/fadeOut` - Smooth screen transitions

## Integration Instructions 📋

### Step 1: Add to battle.html
```html
<!-- After other battle scripts -->
<script src="js/battle/battle-rewards.js"></script>
```

### Step 2: Initialize in battle-core.js
```javascript
// In init() function
if (window.BattleRewards) {
  window.BattleRewards.init(this);
}
```

### Step 3: Award chest on stage complete
```javascript
// In battle-missions.js or wherever stage victory is handled
await window.BattleRewards.awardStageChest(stageData, stageIndex, core);
```

### Step 4: Collect chest on stage advance
```javascript
// Before loading next stage
await window.BattleRewards.collectStageChest(core);
```

### Step 5: Show results at mission end
```javascript
// When all stages complete
await window.BattleRewards.showResultsScreen(core);
```

## Still TODO ⏳

### Stage Transition Improvements:
1. **Fast black wipe transition** instead of current fade
   - Implement right-to-left black sweep
   - Duration: 200ms

2. **Character slide-in animation**
   - Characters enter from left side
   - Fast slide with slight bounce
   - Duration: 400ms

3. **Remove between-stage screen**
   - Currently shows "STAGE 2" overlay
   - Replace with instant black wipe

4. **Add stage counter to top bar**
   - Display: "Stage 2/3"
   - Position: Top right or top left
   - Update on each stage advance

### Additional Missions:
- Add rewards to remaining missions (m_002 through event_lt)
- Balance reward amounts per difficulty
- Add rare drop chances (characters, special items)

## Sample Implementation

### Adding Rewards to Remaining Missions:
```json
{
  "id": "m_002",
  "difficulties": {
    "C": [
      {
        "stage": 1,
        "map": "...",
        "waves": [...],
        "rewards": {
          "ryo": 400,
          "scroll_skill": 1
        }
      }
    ]
  }
}
```

### Calling the System:
```javascript
// Example integration in battle-missions.js

async function onStageComplete(core) {
  const currentStage = core.missionData.difficulties[core.difficulty][core.currentStageIndex];

  // Award chest
  await window.BattleRewards.awardStageChest(currentStage, core.currentStageIndex, core);

  // Check if more stages
  if (hasMoreStages()) {
    // Collect chest before transition
    await window.BattleRewards.collectStageChest(core);

    // Load next stage (with improved transition)
    await loadNextStage(core);
  } else {
    // Mission complete - show all results
    await window.BattleRewards.showResultsScreen(core);
  }
}
```

## Visual Design 🎨

### Chest Appearance:
- **Color**: Golden gradient (#8B4513 → #D4AF37 → #8B4513)
- **Border**: 4px solid gold (#FFD700)
- **Shadow**: Multiple layers with glow
- **Size**: 80x80px
- **Position**: Center of battlefield (50%, 40%)
- **Animation**: Appears with spin, floats continuously

### Chest Visuals:
- Closed chest uses a deep gold gradient fill.
- Opened chest shifts to a brighter gold gradient during the reveal animation.
- Gradients are pure CSS, so no external images are required.

### Results Screen:
- **Background**: Near-black with subtle transparency
- **Title**: Large gold text with glow
- **Chest Cards**: Dark gradient backgrounds with gold borders
- **Continue Button**: Gold gradient with hover effects
- **Layout**: Flexbox centered, responsive

## Performance Notes ⚡

- All animations use CSS transforms (GPU accelerated)
- Minimal DOM manipulation
- Async/await for smooth sequencing
- Automatic cleanup of temporary elements
- Sound effects only play if AudioManager available

## Testing Checklist ✓

- [ ] Complete stage 1 - chest appears
- [ ] Advance to stage 2 - chest collected
- [ ] Complete all stages - results screen shows
- [ ] All chests flash and reveal correctly
- [ ] Rewards added to inventory properly
- [ ] Continue button returns to missions
- [ ] Works with different reward types
- [ ] Works with missing rewards (default values)
- [ ] Performance is smooth (60fps)
- [ ] Mobile responsive layout

## Known Limitations

1. Chest collection is automatic (not clickable)
2. Results screen is modal (can't skip early)
3. No character reward special handling yet
4. Assumes Resources system exists
5. Audio SFX path may need adjustment

## Future Enhancements 💡

1. **Rare drop sparkles** - Golden particles for rare items
2. **Combo rewards** - Bonus for clearing quickly
3. **Lucky chests** - Random bonus rewards
4. **Character unlock cutscenes** - When getting new characters
5. **Reward summary stats** - Total ryo/exp gained
6. **Social sharing** - Share cleared missions
7. **Daily bonus multipliers** - Extra rewards on first clear
