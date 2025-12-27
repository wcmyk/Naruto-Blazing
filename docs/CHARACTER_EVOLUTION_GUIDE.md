# Character Evolution System Guide

## Overview

The Character Evolution System allows characters to **transform** into different characters (e.g., Naruto 665 → Naruto 666). This is different from **Awakening**, which promotes a character through tiers (3S → 4S → 5S → 6S).

## Awakening vs Evolution

| Feature | Awakening | Evolution |
|---------|-----------|-----------|
| **What it does** | Increases tier (3S → 4S → 5S → 6S) | Transforms to different character |
| **Character ID** | Stays same | Changes (e.g., naruto_665 → naruto_666) |
| **Name** | Usually stays same | May change |
| **Level** | Resets to 1 | Resets to 1 |
| **Requirements** | Max level for current tier | Max level AND max tier |
| **Example** | Naruto (3★) → Naruto (4★) → Naruto (5★) | Naruto "The Inheritor" 665 → Naruto "The Inheritor" 666 |

## How It Works

### Requirements for Evolution

A character can evolve if:
1. ✅ Has `evolvesTo` field in JSON (links to target character)
2. ✅ At MAX level for current tier
3. ✅ At MAX tier (can't awaken anymore)
4. ✅ Has required materials (if specified)

### Evolution Process

```
1. Awaken character to max tier (6S, 7S, etc.)
   └─> Use Awakening System

2. Level up to max level
   └─> Train in battles

3. Evolution button appears
   └─> New system (separate from Awakening)

4. Pay materials (if required)
   └─> Default: Ramen + Ryo

5. Character transforms!
   └─> New character ID, level resets to 1
```

## For Developers: Adding Evolution Links

### Method 1: CLI Tool (Easiest)

```bash
# Add one-way evolution (665 can evolve to 666)
node backend/add-evolution.js naruto_665 naruto_666

# Add two-way evolution (both can evolve to each other)
node backend/add-evolution.js naruto_665 naruto_666 --bidirectional
```

### Method 2: Manual JSON Edit

Add `evolvesTo` field to character:

```json
{
  "id": "naruto_665",
  "name": "Naruto Uzumaki",
  "version": "The Inheritor",
  "rarity": 6,
  "starMinCode": "6S",
  "starMaxCode": "6S",
  "evolvesTo": ["naruto_666"],
  ...
}
```

### Method 3: Admin CLI

```bash
# Add single evolution target
node backend/admin-cli.js update naruto_665 evolvesTo '["naruto_666"]'

# Add multiple evolution options
node backend/admin-cli.js update naruto_665 evolvesTo '["naruto_666","naruto_667"]'
```

## Customizing Evolution Requirements

### Default Requirements

By default, evolution requires:
- **Level**: MAX (must be at level cap)
- **Tier**: MAX (must be fully awakened)
- **Materials**:
  - Ramen: 50
  - Ryo: 100,000

### Custom Requirements

Add `evolutionRequirements` to character:

```json
{
  "id": "naruto_665",
  "name": "Naruto Uzumaki",
  "evolvesTo": ["naruto_666"],
  "evolutionRequirements": {
    "naruto_666": {
      "level": "MAX",
      "tier": "MAX",
      "materials": {
        "ramen": 100,
        "ryo": 500000,
        "ninja_pearl": 5
      }
    }
  }
}
```

## Integration with Game UI

### Load the Evolution System

Add to your HTML (after awakening.js):

```html
<script src="js/awakening.js"></script>
<script src="js/character-evolution.js"></script>
```

### Check if Character Can Evolve

```javascript
// Check if character has evolution options
const canEvolve = CharacterEvolution.canEvolve(character);

if (canEvolve) {
  const options = CharacterEvolution.getEvolutionOptions(character);
  console.log('Can evolve to:', options); // ["naruto_666"]
}
```

### Check Evolution Requirements

```javascript
// Check if character instance meets requirements
const meetsReqs = CharacterEvolution.meetsEvolutionRequirements(
  characterInstance,
  character,
  'naruto_666'
);

if (!meetsReqs) {
  console.log('Not ready to evolve yet');
  // Character needs to:
  // - Reach max level
  // - Reach max tier (awaken fully first)
}
```

### Get Evolution Preview

```javascript
const preview = await CharacterEvolution.getEvolutionPreview(
  characterInstance,
  character,
  'naruto_666'
);

console.log(preview);
// {
//   canEvolve: true,
//   canAfford: true,
//   requirements: { materials: {...} },
//   current: {
//     characterId: 'naruto_665',
//     name: 'Naruto Uzumaki',
//     level: 100,
//     tier: '6S',
//     stats: { hp: 10000, atk: 8500, ... }
//   },
//   target: {
//     characterId: 'naruto_666',
//     name: 'Naruto Uzumaki',
//     level: 1,
//     tier: '6S',
//     stats: { hp: 5000, atk: 4200, ... }
//   }
// }
```

### Perform Evolution

```javascript
const result = await CharacterEvolution.performEvolution(
  characterInstance,
  character,
  'naruto_666'
);

if (result.ok) {
  console.log('✨ Evolution successful!');
  console.log(`${result.oldCharacterId} → ${result.newCharacterId}`);
  console.log(`Level: ${result.oldLevel} → ${result.newLevel}`);

  // Update UI with new character
  updateCharacterDisplay(characterInstance);
} else {
  console.error('Evolution failed:', result.reason);
}
```

## UI Integration Example

### Add Evolution Button to Inventory

```javascript
// In inventory.js or awakening UI

async function showCharacterDetails(inst) {
  const character = await Characters.getCharacterById(inst.characterId);

  // Check if can evolve
  if (CharacterEvolution.canEvolve(character)) {
    const options = CharacterEvolution.getEvolutionOptions(character);

    // For each evolution option, create a button
    for (const targetId of options) {
      const targetChar = await Characters.getCharacterById(targetId);
      const meetsReqs = CharacterEvolution.meetsEvolutionRequirements(
        inst,
        character,
        targetId
      );

      // Create evolution button
      const btn = document.createElement('button');
      btn.className = 'evolution-btn';
      btn.textContent = `Evolve to ${targetChar.name}`;
      btn.disabled = !meetsReqs;

      btn.addEventListener('click', async () => {
        const result = await CharacterEvolution.performEvolution(
          inst,
          character,
          targetId
        );

        if (result.ok) {
          showSuccessMessage('Evolution successful!');
          refreshInventory();
        } else {
          showErrorMessage(result.reason);
        }
      });

      container.appendChild(btn);
    }
  }
}
```

## Common Evolution Patterns

### 1. Linear Evolution Chain

```bash
# Basic form → Intermediate → Final form
node backend/add-evolution.js naruto_001 naruto_044
node backend/add-evolution.js naruto_044 naruto_665
node backend/add-evolution.js naruto_665 naruto_666
```

Result: `001 → 044 → 665 → 666`

### 2. Branching Evolution

```bash
# Can evolve into multiple forms
node backend/admin-cli.js update sasuke_005 evolvesTo '["sasuke_450","sasuke_451"]'
```

Result: `005 → 450 OR 451` (player chooses)

### 3. Reversible Evolution

```bash
# Can evolve back and forth
node backend/add-evolution.js naruto_665 naruto_666 --bidirectional
```

Result: `665 ⟷ 666` (can go both ways)

## Testing

### Test Evolution Link

```bash
# 1. Check evolution was added
jq '.[] | select(.id == "naruto_665") | .evolvesTo' data/characters.json

# 2. Start game and open console (F12)
# 3. Load character
const char = await Characters.getCharacterById('naruto_665');
console.log(CharacterEvolution.canEvolve(char)); // Should be true

# 4. Check requirements
const inst = { characterId: 'naruto_665', level: 100, tierCode: '6S' };
const meetsReqs = CharacterEvolution.meetsEvolutionRequirements(inst, char, 'naruto_666');
console.log(meetsReqs); // Should be true if at max level and tier
```

## Troubleshooting

### Evolution Button Not Showing

**Check:**
1. ✅ Is `js/character-evolution.js` loaded?
   ```javascript
   console.log(window.CharacterEvolution); // Should not be undefined
   ```

2. ✅ Does character have `evolvesTo` field?
   ```bash
   jq '.[] | select(.id == "naruto_665") | .evolvesTo' data/characters.json
   ```

3. ✅ Is character at MAX level and tier?
   ```javascript
   console.log(inst.level); // Should be 100 (or max for tier)
   console.log(Progression.canAwaken(inst, char)); // Should be false (can't awaken anymore)
   ```

### "Requirements Not Met" Error

This means:
- ❌ Character is not at max level → Level up more
- ❌ Character can still awaken → Awaken to max tier first
- ❌ Missing materials → Farm materials

### Target Character Not Found

Check if target character exists:
```bash
jq '.[] | select(.id == "naruto_666")' data/characters.json
```

If not found, either:
- Fix the character ID in `evolvesTo`
- Add the missing character to database

## API Reference

### CharacterEvolution.canEvolve(character)
Returns `true` if character has evolution options.

### CharacterEvolution.getEvolutionOptions(character)
Returns array of character IDs this character can evolve into.

### CharacterEvolution.meetsEvolutionRequirements(inst, character, targetId)
Returns `true` if character instance meets all evolution requirements.

### CharacterEvolution.getEvolutionRequirements(character, targetId)
Returns requirements object (materials, level, tier).

### CharacterEvolution.canAffordEvolution(character, targetId)
Returns `true` if player has required materials.

### CharacterEvolution.performEvolution(inst, character, targetId)
Performs the evolution. Returns result object:
```javascript
{
  ok: true,
  oldCharacterId: 'naruto_665',
  newCharacterId: 'naruto_666',
  oldLevel: 100,
  newLevel: 1,
  oldTier: '6S',
  newTier: '6S'
}
```

### CharacterEvolution.getEvolutionPreview(inst, character, targetId)
Returns preview of what will happen during evolution.

## Examples

### Example 1: Simple Evolution Link

```bash
# Add evolution link
node backend/add-evolution.js naruto_665 naruto_666

# Verify
jq '.[] | select(.id == "naruto_665") | {id, name, evolvesTo}' data/characters.json
```

### Example 2: Evolution with Custom Materials

```bash
# 1. Add evolution link
node backend/add-evolution.js sasuke_450 sasuke_451

# 2. Add custom requirements
node backend/admin-cli.js update sasuke_450 'evolutionRequirements' '{
  "sasuke_451": {
    "level": "MAX",
    "tier": "MAX",
    "materials": {
      "ramen": 200,
      "ryo": 1000000,
      "ninja_pearl": 10
    }
  }
}'
```

### Example 3: Multiple Evolution Paths

```bash
# Character can evolve to either 451 or 452
node backend/admin-cli.js update sasuke_450 evolvesTo '["sasuke_451","sasuke_452"]'
```

## FAQ

**Q: What's the difference between Awakening and Evolution?**
A: Awakening increases tier (3S → 4S → 5S). Evolution transforms the character to a different character ID (naruto_665 → naruto_666).

**Q: Can I evolve without awakening first?**
A: No. You must awaken to MAX tier before you can evolve.

**Q: Does evolution reset level?**
A: Yes. Level resets to 1 after evolution (standard gacha game behavior).

**Q: Can I evolve backwards?**
A: Only if you add a bidirectional link (`--bidirectional` flag).

**Q: How do I add multiple evolution options?**
A: Set `evolvesTo` to an array: `["naruto_666","naruto_667"]`

**Q: Can I customize materials per evolution?**
A: Yes. Add `evolutionRequirements` field to character JSON.

---

Need help? Check the code in `js/character-evolution.js` or open an issue!
