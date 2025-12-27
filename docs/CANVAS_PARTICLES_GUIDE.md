# Canvas Particle System - Usage Guide

## Overview
High-performance particle system using HTML5 Canvas that can render 1000+ particles at 60 FPS.

## Quick Start

### 1. Add Scripts to battle.html
```html
<!-- Add BEFORE closing </body> tag -->
<script src="js/battle/canvas-particle-engine.js"></script>
<script src="js/battle/canvas-jutsu-effects.js"></script>
<script src="js/battle/canvas-particles-integration.js"></script>
```

### 2. Initialize in Battle System
```javascript
// In your battle initialization code (e.g., battle-core.js)
async function initBattle() {
  // ... existing battle init code ...

  // Initialize Canvas Particles
  await window.BattleCanvasParticles.init(core);

  console.log('Battle started with Canvas Particles!');
}
```

### 3. Use in Combat
```javascript
// In battle-combat.js or wherever you handle jutsu
function performJutsu(attacker, target, skill) {
  // ... existing jutsu logic ...

  // Add particle effect
  if (skill.element === 'Fire') {
    window.BattleCanvasParticles.playFireStyle(attacker);
  } else if (skill.element === 'Lightning') {
    window.BattleCanvasParticles.playLightningStyle(attacker, target);
  }

  // Impact flash when target is hit
  window.BattleCanvasParticles.playImpactFlash(target);
}
```

---

## Available Effects

### Fire Style
```javascript
// Rising flames from unit position
window.BattleCanvasParticles.playFireStyle(unit);
```

### Lightning Style
```javascript
// Lightning bolt from attacker to target
window.BattleCanvasParticles.playLightningStyle(attacker, target);
```

### Water Style
```javascript
// Water droplets bursting outward
window.BattleCanvasParticles.playWaterStyle(unit);
```

### Wind Style
```javascript
// Swirling air particles
window.BattleCanvasParticles.playWindStyle(unit, direction);
// direction = 0 for right, Math.PI for left
```

### Earth Style
```javascript
// Rock debris flying
window.BattleCanvasParticles.playEarthStyle(unit);
```

### Rasengan
```javascript
// Spiraling blue chakra sphere
window.BattleCanvasParticles.playRasengan(unit);
```

### Chidori
```javascript
// Electric lightning blade
window.BattleCanvasParticles.playChidori(unit);
```

### Explosion
```javascript
// Blast with fire and smoke
window.BattleCanvasParticles.playExplosion(unit, size);
// size = 1 (default), 2 (double), etc.
```

### Impact Flash
```javascript
// Quick burst when unit is hit
window.BattleCanvasParticles.playImpactFlash(unit, 'white');
// colors: 'white', 'red', 'blue'
```

### Dust Cloud
```javascript
// Ground impact dust
window.BattleCanvasParticles.playDustCloud(unit);
```

### Healing Effect
```javascript
// Green sparkles rising
window.BattleCanvasParticles.playHealingEffect(unit, 2);
// duration in seconds
```

### Shadow Clone Poof
```javascript
// Smoke burst for substitution
window.BattleCanvasParticles.playShadowClonePoof(unit);
```

### Chakra Aura (Continuous)
```javascript
// Start continuous aura
window.BattleCanvasParticles.startChakraAura(unit, 'blue');
// colors: 'blue', 'red', 'yellow', 'green', 'purple'

// Stop aura
window.BattleCanvasParticles.stopChakraAura(unit);
```

### Auto Element Detection
```javascript
// Automatically play effect based on element
window.BattleCanvasParticles.playElementalEffect(attacker, target, 'Fire');
// Supports: Fire, Lightning, Water, Wind, Earth
```

---

## Integration Examples

### Example 1: In battle-combat.js
```javascript
// In your performAttack or executeJutsu function
async function executeJutsu(attacker, targets, skill) {
  // Show skill name
  displaySkillName(skill.name);

  // Play particle effect based on skill type
  if (skill.name.includes('Fireball')) {
    window.BattleCanvasParticles.playFireStyle(attacker);
  } else if (skill.name.includes('Chidori')) {
    window.BattleCanvasParticles.playChidori(attacker);
  } else if (skill.name.includes('Rasengan')) {
    window.BattleCanvasParticles.playRasengan(attacker);
  }

  await delay(500); // Let effect show

  // Apply damage to targets
  for (const target of targets) {
    // Impact flash
    window.BattleCanvasParticles.playImpactFlash(target, 'red');

    // Apply damage
    applyDamage(target, calculateDamage(attacker, skill));
  }
}
```

### Example 2: Chakra Mode Auras
```javascript
// In battle-chakra.js or wherever chakra mode is managed
function updateChakraMode(unit) {
  const chakra = unit.chakra;
  const jutsuCost = unit.skills.jutsu.chakraCost;
  const ultimateCost = unit.skills.ultimate.chakraCost;

  // Stop existing aura
  window.BattleCanvasParticles.stopChakraAura(unit);

  // Start appropriate aura
  if (chakra >= ultimateCost) {
    window.BattleCanvasParticles.startChakraAura(unit, 'red');
  } else if (chakra >= jutsuCost) {
    window.BattleCanvasParticles.startChakraAura(unit, 'blue');
  }
}
```

### Example 3: Death/Knockout Effect
```javascript
// When unit dies
function onUnitDeath(unit) {
  // Explosion
  window.BattleCanvasParticles.playExplosion(unit, 0.5);

  // Smoke
  window.BattleCanvasParticles.playShadowClonePoof(unit);

  // Stop aura
  window.BattleCanvasParticles.stopChakraAura(unit);
}
```

### Example 4: Healing
```javascript
// When unit is healed
function healUnit(unit, amount) {
  unit.hp = Math.min(unit.maxHp, unit.hp + amount);

  // Healing particles
  window.BattleCanvasParticles.playHealingEffect(unit, 2);

  // Update HP bar
  updateHPBar(unit);
}
```

---

## Advanced: Custom Effects

### Create Custom Emitter
```javascript
// Access the engine directly
const engine = window.BattleCanvasParticles.engine;

// Create custom emitter
const customEmitter = engine.createEmitter({
  x: 400,
  y: 300,
  rate: 100, // particles per second
  duration: 2, // seconds (-1 for infinite)
  direction: 0, // radians
  spread: Math.PI / 4, // radians
  speed: 2,
  speedVariation: 0.3,
  particle: {
    life: 1.0,
    decay: 1,
    size: 4,
    endSize: 8,
    color: { r: 255, g: 100, b: 200 },
    endColor: { r: 100, g: 50, b: 100 },
    gravity: 1,
    friction: 0.98,
    glow: true,
    shape: 'circle' // 'circle', 'square', 'star'
  }
});
```

### Create Custom Particles
```javascript
// Emit single particles
const engine = window.BattleCanvasParticles.engine;

for (let i = 0; i < 50; i++) {
  engine.emit({
    x: 400 + Math.random() * 100,
    y: 300 + Math.random() * 100,
    vx: (Math.random() - 0.5) * 3,
    vy: (Math.random() - 0.5) * 3,
    life: 2.0,
    decay: 0.5,
    size: 5,
    color: { r: 255, g: 150, b: 0 },
    gravity: 2,
    glow: true
  });
}
```

---

## Performance Tips

### Monitor Performance
```javascript
// Check particle count
const count = window.BattleCanvasParticles.getParticleCount();
console.log(`Active particles: ${count}`);

// Check FPS
const fps = window.BattleCanvasParticles.getFPS();
console.log(`FPS: ${fps}`);
```

### Optimization
- Keep particle count under 2000 for 60 FPS
- Use shorter life spans (0.5-2 seconds)
- Disable glow for simple effects
- Use emitters instead of creating individual particles

### Clear Particles
```javascript
// Clear all particles (useful between battles)
window.BattleCanvasParticles.clear();
```

---

## Troubleshooting

### Particles Not Showing
1. Check if scripts are loaded:
   ```javascript
   console.log(window.CanvasParticleEngine); // Should not be undefined
   ```

2. Check if initialized:
   ```javascript
   console.log(window.BattleCanvasParticles.engine); // Should not be null
   ```

3. Check canvas is attached:
   ```javascript
   const canvas = document.querySelector('canvas');
   console.log(canvas); // Should exist
   ```

### Performance Issues
1. Check particle count:
   ```javascript
   console.log(window.BattleCanvasParticles.getParticleCount());
   // If > 2000, reduce emission rates
   ```

2. Reduce particle life:
   ```javascript
   // Change from life: 2.0 to life: 1.0
   ```

3. Disable glow:
   ```javascript
   // Change glow: true to glow: false
   ```

### Z-Index Issues
The canvas has `z-index: 100`. Adjust in `canvas-particle-engine.js` line 27 if needed.

---

## Next Steps

1. ✅ Add scripts to battle.html
2. ✅ Initialize in battle system
3. ✅ Add effects to jutsu executions
4. ✅ Test and adjust particle parameters
5. 🎨 Create custom effects for special jutsus!

---

## Support

If you encounter issues, check the console for error messages:
- `[CanvasParticles]` - Core engine messages
- `[CanvasJutsuEffects]` - Effect library messages
- `[BattleCanvasParticles]` - Integration messages
