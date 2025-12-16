// PARTICLE_INTEGRATION_EXAMPLE.js
// Example of how to integrate Canvas Particles into your existing battle-combat.js

/* ==========================================
   STEP 1: Initialize in battle.js
   ========================================== */

// In battle.js, after battle core is initialized:
async function initBattle() {
  // ... existing init code ...

  // Initialize Canvas Particles
  if (window.BattleCanvasParticles) {
    window.BattleCanvasParticles.init(core);
    console.log('✅ Canvas Particles ready!');
  }

  // ... rest of init code ...
}


/* ==========================================
   STEP 2: Add to Jutsu Execution
   ========================================== */

// In battle-combat.js, find your jutsu execution function:
async function executeJutsu(attacker, targets, jutsu, core) {
  // Show skill name (existing code)
  displaySkillName(jutsu.name, attacker);

  // ✨ NEW: Play particle effect based on element
  if (window.BattleCanvasParticles && jutsu.element) {
    window.BattleCanvasParticles.playElementalEffect(
      attacker,
      targets[0], // primary target
      jutsu.element
    );
  }

  // Wait for animation
  await delay(800);

  // Apply damage to all targets (existing code)
  for (const target of targets) {
    // ✨ NEW: Impact flash when hit
    if (window.BattleCanvasParticles) {
      window.BattleCanvasParticles.playImpactFlash(target, 'red');
    }

    // Calculate and apply damage (existing code)
    const damage = calculateDamage(attacker, target, jutsu);
    applyDamage(target, damage);
  }
}


/* ==========================================
   STEP 3: Add to Ultimate Execution
   ========================================== */

async function executeUltimate(attacker, targets, ultimate, core) {
  // Show ultimate name (existing code)
  displaySkillName(ultimate.name, attacker, 'ultimate');

  // ✨ NEW: Special effects for specific ultimates
  if (window.BattleCanvasParticles) {
    // Check for signature moves
    if (ultimate.name.includes('Rasengan')) {
      window.BattleCanvasParticles.playRasengan(attacker);
    } else if (ultimate.name.includes('Chidori')) {
      window.BattleCanvasParticles.playChidori(attacker);
    } else {
      // Generic elemental effect
      window.BattleCanvasParticles.playElementalEffect(
        attacker,
        targets[0],
        ultimate.element
      );
    }
  }

  // Wait for buildup
  await delay(1000);

  // Apply damage
  for (const target of targets) {
    // ✨ NEW: Explosion on impact
    if (window.BattleCanvasParticles) {
      window.BattleCanvasParticles.playExplosion(target, 1.5);
    }

    const damage = calculateDamage(attacker, target, ultimate);
    applyDamage(target, damage);
  }
}


/* ==========================================
   STEP 4: Add to Chakra Mode System
   ========================================== */

// In your chakra update function (e.g., in battle-chakra.js):
function updateChakraDisplay(unit) {
  const chakra = unit.chakra;
  const jutsuCost = unit.skills.jutsu.chakraCost;
  const ultimateCost = unit.skills.ultimate.chakraCost;

  // Update chakra bar (existing code)
  updateChakraBar(unit);

  // ✨ NEW: Update chakra aura
  if (window.BattleCanvasParticles) {
    // Remove existing aura
    window.BattleCanvasParticles.stopChakraAura(unit);

    // Add new aura based on chakra amount
    if (chakra >= ultimateCost) {
      // Ready for ultimate - red aura
      window.BattleCanvasParticles.startChakraAura(unit, 'red');
    } else if (chakra >= jutsuCost) {
      // Ready for jutsu - blue aura
      window.BattleCanvasParticles.startChakraAura(unit, 'blue');
    }
  }
}


/* ==========================================
   STEP 5: Add to Turn Start
   ========================================== */

// In battle-turns.js, when a unit's turn starts:
function startTurn(unit) {
  // Highlight unit (existing code)
  highlightUnit(unit);

  // ✨ NEW: Dust cloud effect when unit activates
  if (window.BattleCanvasParticles) {
    window.BattleCanvasParticles.playDustCloud(unit);
  }

  // ... rest of turn logic ...
}


/* ==========================================
   STEP 6: Add to Healing
   ========================================== */

function healUnit(unit, amount) {
  // Apply healing (existing code)
  unit.hp = Math.min(unit.maxHp, unit.hp + amount);
  updateHPBar(unit);

  // ✨ NEW: Healing particles
  if (window.BattleCanvasParticles) {
    window.BattleCanvasParticles.playHealingEffect(unit, 2);
  }
}


/* ==========================================
   STEP 7: Add to Unit Death
   ========================================== */

function onUnitDeath(unit) {
  // Death animation (existing code)
  playDeathAnimation(unit);

  // ✨ NEW: Explosion and smoke
  if (window.BattleCanvasParticles) {
    window.BattleCanvasParticles.playExplosion(unit, 0.5);
    window.BattleCanvasParticles.playShadowClonePoof(unit);
    window.BattleCanvasParticles.stopChakraAura(unit);
  }

  // Remove unit (existing code)
  removeUnitFromField(unit);
}


/* ==========================================
   STEP 8: Add to Substitution/Switch
   ========================================== */

function switchUnit(outgoingUnit, incomingUnit) {
  // ✨ NEW: Shadow clone poof for substitution
  if (window.BattleCanvasParticles) {
    window.BattleCanvasParticles.playShadowClonePoof(outgoingUnit);
  }

  // Wait for effect
  await delay(300);

  // Switch logic (existing code)
  replaceUnit(outgoingUnit, incomingUnit);

  // ✨ NEW: Entry poof for new unit
  if (window.BattleCanvasParticles) {
    window.BattleCanvasParticles.playShadowClonePoof(incomingUnit);
  }
}


/* ==========================================
   EXAMPLE: Full Combat Function with Particles
   ========================================== */

async function performAttack(attacker, target, attackType, core) {
  console.log(`${attacker.name} attacks ${target.name} with ${attackType}`);

  // Get skill data
  const skill = attacker.skills[attackType];

  // Show attack name
  displaySkillName(skill.name, attacker);

  // ✨ Play particle effect based on attack type and element
  if (window.BattleCanvasParticles) {
    switch (attackType) {
      case 'basic':
        // Simple impact
        window.BattleCanvasParticles.playImpactFlash(attacker, 'white');
        break;

      case 'jutsu':
        // Elemental effect
        window.BattleCanvasParticles.playElementalEffect(
          attacker,
          target,
          skill.element || 'neutral'
        );
        break;

      case 'ultimate':
        // Check for signature moves
        if (skill.name.includes('Rasengan')) {
          window.BattleCanvasParticles.playRasengan(attacker);
        } else if (skill.name.includes('Chidori')) {
          window.BattleCanvasParticles.playChidori(attacker);
        } else {
          // Big elemental effect
          window.BattleCanvasParticles.playElementalEffect(
            attacker,
            target,
            skill.element || 'neutral'
          );
        }
        break;

      case 'secret':
        // Massive explosion
        window.BattleCanvasParticles.playExplosion(attacker, 2);
        break;
    }
  }

  // Animation delay
  await delay(attackType === 'ultimate' ? 1000 : 500);

  // ✨ Impact effect on target
  if (window.BattleCanvasParticles) {
    const impactColor = attackType === 'secret' ? 'red' : 'white';
    window.BattleCanvasParticles.playImpactFlash(target, impactColor);

    if (attackType === 'ultimate' || attackType === 'secret') {
      window.BattleCanvasParticles.playExplosion(target, 1);
    }
  }

  // Calculate damage
  const damage = calculateDamage(attacker, target, skill);

  // Apply damage
  applyDamage(target, damage);

  // Check if target died
  if (target.hp <= 0) {
    await onUnitDeath(target);
  }
}


/* ==========================================
   DEBUGGING & PERFORMANCE
   ========================================== */

// Add to your debug panel or console commands:
function showParticleStats() {
  if (!window.BattleCanvasParticles) {
    console.log('Canvas Particles not loaded');
    return;
  }

  console.log('=== Particle System Stats ===');
  console.log('Active Particles:', window.BattleCanvasParticles.getParticleCount());
  console.log('FPS:', window.BattleCanvasParticles.getFPS());
}

// Clear particles (useful for testing):
function clearAllParticles() {
  if (window.BattleCanvasParticles) {
    window.BattleCanvasParticles.clear();
    console.log('✅ All particles cleared');
  }
}


/* ==========================================
   NOTES:
   ========================================== */

/*
 * 1. Always check if window.BattleCanvasParticles exists before using
 * 2. Particle effects are non-blocking - they run in parallel with your game logic
 * 3. Use await delay() after particles if you want to wait for visual effect
 * 4. Keep particle count under 2000 for smooth 60 FPS
 * 5. Use the element auto-detection for easy integration
 * 6. Custom effects can be created by accessing the engine directly
 */
