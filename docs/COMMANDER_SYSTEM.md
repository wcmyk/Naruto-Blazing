# Commander System Documentation

## Overview
The Commander System adds an off-field support unit to your team that provides passive buffs and an ultimate attack when certain conditions are met.

## Features

### 1. Commander Slot
- Located below the Back Row formation
- Commander does NOT participate in battle (off-field unit)
- Only provides buffs and ultimate support

### 2. Passive Team Buffs
Buffs scale based on the commander's **Element** and **Star Rating**.

#### Element-Based Buffs (Baseline at 5★)

| Element  | Buff Type(s)                |
|----------|-----------------------------|
| Body     | +4% ATK                     |
| Bravery  | +3% ATK, +1% Health         |
| Wisdom   | +3% ATK, +1% Health         |
| Heart    | +4% ATK                     |
| Skill    | +4% Speed                   |

#### Star Scaling
- **5★**: Baseline buffs (as shown above)
- **10★**: Maximum buffs (20% for all stats)
- Linear scaling between 5★ and 10★

**Example:**
- 5★ Body Commander: +4% ATK
- 7★ Body Commander: +10.4% ATK
- 10★ Body Commander: +20% ATK

### 3. Commander Ultimate
- **Trigger Condition**: Team's collective chakra reaches 16
- **Behavior**: Trigger only (does NOT consume chakra)
- **Ultimate Data**: Pulled from character's `skills.ultimate` in `characters.json`
- **Ultimate PNG**: Container implemented, PNG files to be added

## Implementation Details

### Required Character Data
Each character in `data/characters.json` needs:
```json
{
  "id": "character_id",
  "element": "body|bravery|wisdom|heart|skill",
  "skills": {
    "ultimate": {
      "name": "Ultimate Name",
      "byTier": {
        "6S": {
          "description": "Ultimate description",
          "chakraCost": 8,
          "range": "All Enemies",
          "hits": 10,
          "multiplier": "15.0x ATK"
        }
      }
    }
  }
}
```

### Storage Structure
Commander data is stored in localStorage under `blazing_teams_v1`:
```javascript
{
  "1": {
    "front-1": { uid: "...", charId: "..." },
    "commander": { uid: "...", charId: "..." }  // Commander slot
  }
}
```

## Files Modified

### Team Setup
- `/home/user/Naruto-Blazing/teams.html` - Added commander UI section
- `/home/user/Naruto-Blazing/css/teams.css` - Added commander styling
- `/home/user/Naruto-Blazing/js/team_manager.js` - Added commander logic

### Battle Integration
- `/home/user/Naruto-Blazing/battle.html` - Added collective chakra display in HUD
- `/home/user/Naruto-Blazing/css/battle.css` - Added commander HUD styling
- `/home/user/Naruto-Blazing/js/battle/battle-core.js` - Implemented commander loading, buff application, and ultimate trigger
- `/home/user/Naruto-Blazing/js/battle/battle-turns.js` - Added collective chakra tracking hook

## Battle Implementation

### How It Works in Battle

1. **Battle Start**: Commander is loaded from team data, buffs are calculated and applied to all active team members
2. **Buff Application**: Passive buffs are permanently applied to unit stats (ATK, HP, Speed)
3. **Chakra Tracking**: After each turn, collective chakra is calculated (sum of all 4 active units' chakra)
4. **Ultimate Trigger**: When collective chakra reaches 16+, commander ultimate automatically triggers once per battle
5. **Ultimate Effects**: Applies damage and buff/debuff effects from character's ultimate skill data

### Battle HUD Display

The battle HUD shows:
- Commander name
- Collective chakra value (turns red and pulses when ≥16)
- Threshold indicator (X/16)

## Existing Systems

### ✅ Character Abilities (WORKING)
File: `js/battle/battle-passives.js`
- Passive abilities from characters.json are automatically applied
- Examples: HP bonuses, conditional ATK, turn-based regen, damage reduction

### ✅ Buffs/Debuffs (WORKING)
File: `js/battle/battle-buffs.js`
- Full buff/debuff system with 20+ status effects
- Debuff cleansing, timed effects, instant heals/revives

## Future Work
1. Add ultimate PNG images for each character (container ready)
2. Enhanced visual effects for commander ultimate activation
3. Sound effects for ultimate trigger
4. Commander-specific animations
