// ========================================
// HP BAR ANIMATION FIX
// Add this to battle-units.js or create battle-ui-fixes.js
// ========================================

/**
 * Enhanced updateUnitDisplay with HP bar animation
 * Replace the existing updateUnitDisplay function in battle-units.js
 */

// Option 1: Patch existing function
if (window.BattleUnits && window.BattleUnits.updateUnitDisplay) {
  const originalUpdate = window.BattleUnits.updateUnitDisplay;

  window.BattleUnits.updateUnitDisplay = function(unit, core) {
    const unitEl = core.dom.scene?.querySelector(`[data-unit-id="${unit.id}"]`);
    if (!unitEl) return;

    // Calculate HP percentage
    const hpPercent = (unit.stats.hp / unit.stats.maxHP) * 100;

    // Update HP bar with animation
    const hpBar = unitEl.querySelector(".unit-hp-fill");
    if (hpBar) {
      hpBar.style.width = `${hpPercent}%`;
    }

    // Add HP percentage data attribute for CSS color states
    if (hpPercent > 60) {
      unitEl.setAttribute('data-hp-percent', 'high');
    } else if (hpPercent > 30) {
      unitEl.setAttribute('data-hp-percent', 'medium');
    } else {
      unitEl.setAttribute('data-hp-percent', 'low');
    }

    // Mark as dead if HP is 0
    if (unit.stats.hp <= 0) {
      unitEl.setAttribute('data-dead', 'true');
      unitEl.style.opacity = "0.4";
      unitEl.style.filter = "grayscale(100%)";
      unitEl.style.pointerEvents = "none";
    } else {
      unitEl.removeAttribute('data-dead');
    }

    // Update chakra bar
    if (core.chakra) {
      core.chakra.updateUnitChakraDisplay(unit, core);
    } else {
      const chakraBar = unitEl.querySelector(".chakra-fill");
      if (chakraBar) {
        const chakraPercent = (unit.chakra / unit.maxChakra) * 100;
        chakraBar.style.width = `${chakraPercent}%`;
      }
    }
  };

  console.log("[UI Fix] HP bar animation patched ✅");
}

// Option 2: Alternative standalone fix
// Use this if the patch doesn't work
function fixHPBarAnimation() {
  // Observe DOM changes for unit updates
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-unit-id') {
        const unitEl = mutation.target;
        updateUnitHPBar(unitEl);
      }
    });
  });

  // Start observing battlefield grid
  const grid = document.getElementById('battlefield-grid');
  if (grid) {
    observer.observe(grid, {
      attributes: true,
      subtree: true
    });
  }
}

function updateUnitHPBar(unitEl) {
  const unitId = unitEl.dataset.unitId;
  if (!unitId || !window.BattleManager) return;

  const unit = window.BattleManager.combatants.find(u => u.id === unitId);
  if (!unit) return;

  const hpPercent = (unit.stats.hp / unit.stats.maxHP) * 100;
  const hpBar = unitEl.querySelector(".unit-hp-fill");

  if (hpBar) {
    hpBar.style.width = `${hpPercent}%`;
  }

  // Update color state
  if (hpPercent > 60) {
    unitEl.setAttribute('data-hp-percent', 'high');
  } else if (hpPercent > 30) {
    unitEl.setAttribute('data-hp-percent', 'medium');
  } else {
    unitEl.setAttribute('data-hp-percent', 'low');
  }
}

// Auto-run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fixHPBarAnimation);
} else {
  fixHPBarAnimation();
}

// ========================================
// COMBAT DAMAGE HOOK
// Ensure HP bars update after damage
// ========================================

// Patch performAttack to ensure HP updates
if (window.BattleCombat && window.BattleCombat.performAttack) {
  const originalAttack = window.BattleCombat.performAttack;

  window.BattleCombat.performAttack = function(attacker, target, core) {
    // Call original
    originalAttack.call(this, attacker, target, core);

    // Force HP bar update
    setTimeout(() => {
      if (core.units) {
        core.units.updateUnitDisplay(target, core);
      }
    }, 100);
  };
}

// Patch performJutsu
if (window.BattleCombat && window.BattleCombat.performJutsu) {
  const originalJutsu = window.BattleCombat.performJutsu;

  window.BattleCombat.performJutsu = function(attacker, target, core) {
    const result = originalJutsu.call(this, attacker, target, core);

    if (result) {
      setTimeout(() => {
        if (core.units) {
          core.units.updateUnitDisplay(target, core);
        }
      }, 500);
    }

    return result;
  };
}

// Patch performUltimate
if (window.BattleCombat && window.BattleCombat.performUltimate) {
  const originalUltimate = window.BattleCombat.performUltimate;

  window.BattleCombat.performUltimate = function(attacker, targets, core) {
    const result = originalUltimate.call(this, attacker, targets, core);

    if (result) {
      targets.forEach((target, i) => {
        setTimeout(() => {
          if (core.units) {
            core.units.updateUnitDisplay(target, core);
          }
        }, i * 200 + 600);
      });
    }

    return result;
  };
}

console.log("[UI Fix] Combat hooks patched ✅");
