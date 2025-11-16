// js/battle/battle-chakra-wheel.js - Image-Based Circular Chakra Gauge System
(() => {
  "use strict";

  /**
   * BattleChakraWheel Module
   * Implements rotating circular chakra gauge using image assets
   *
   * Features:
   * - Rotating blue arc segment (chakra.png)
   * - Circular frame overlay (chakraholder_icon.png)
   * - Proper layering: frame > gauge > portrait
   * - Click detection for attack selection
   * - Red ring when ultimate-ready
   */
  const BattleChakraWheel = {
    // Configuration
    CLICK_DELAY: 300, // ms between clicks to detect double/triple

    // Click tracking
    clickTracking: new Map(), // unitId → {count, timer}

    // Wheel element cache
    wheelCache: new Map(), // unitId → wheelElement

    /* ===== Initialization ===== */

    /**
     * Initialize chakra gauge for a unit
     * Creates the rotating gauge structure using image assets
     */
    createChakraWheel(unit, portraitContainer, isBench = false) {
      if (!unit || !portraitContainer) {
        console.warn('[ChakraWheel] Cannot create wheel - missing unit or portrait');
        return null;
      }

      console.log(`[ChakraWheel] Creating image-based chakra gauge for ${unit.name}`);

      // Get portrait image
      const portraitImg = portraitContainer.querySelector('img');
      if (!portraitImg) {
        console.warn('[ChakraWheel] No portrait image found');
        return null;
      }

      // Create chakra slot container
      const chakraSlot = document.createElement('div');
      chakraSlot.className = 'chakra-slot';
      chakraSlot.dataset.unitId = unit.id;

      // Create chakra mask (contains rotating segment)
      const chakraMask = document.createElement('div');
      chakraMask.className = 'chakra-mask';

      // Create chakra segment (rotating blue arc)
      const chakraSegment = document.createElement('img');
      chakraSegment.className = 'chakra-segment';
      chakraSegment.src = 'assets/ui/gauges/chakra.png';
      chakraSegment.alt = 'Chakra gauge';
      chakraMask.appendChild(chakraSegment);

      // Clone portrait for layering
      const clonedPortrait = portraitImg.cloneNode(true);
      clonedPortrait.className = 'portrait-clipped';
      clonedPortrait.alt = unit.name;

      // Create chakra frame overlay
      const chakraFrame = document.createElement('img');
      chakraFrame.className = 'chakra-frame';
      chakraFrame.src = 'assets/ui/frames/chakraholder_icon.png';
      chakraFrame.alt = 'Chakra frame';

      // Assemble structure
      chakraSlot.appendChild(chakraMask);
      chakraSlot.appendChild(clonedPortrait);
      chakraSlot.appendChild(chakraFrame);

      // Add click listener for attack selection
      chakraSlot.addEventListener('click', (e) => {
        this.handleWheelClick(unit, chakraSlot, e);
      });

      // Cache the wheel element
      this.wheelCache.set(unit.id, chakraSlot);

      // Replace portrait container content
      portraitContainer.innerHTML = '';
      portraitContainer.appendChild(chakraSlot);

      console.log(`[ChakraWheel] Image-based chakra gauge created for ${unit.name}`);

      return chakraSlot;
    },

    /**
     * Update chakra gauge rotation based on current chakra
     */
    updateChakraWheel(unit, core) {
      const wheel = this.wheelCache.get(unit.id);
      if (!wheel) {
        console.warn(`[ChakraWheel] No wheel found for ${unit.name} (${unit.id})`);
        return;
      }

      const currentChakra = unit.chakra || 0;
      const maxChakra = unit.maxChakra || 10;
      const chakraPercent = Math.min(100, (currentChakra / maxChakra) * 100);

      // Calculate rotation (0% = 0deg, 100% = 360deg)
      const rotation = (chakraPercent / 100) * 360;

      // Apply rotation to chakra segment
      const chakraSegment = wheel.querySelector('.chakra-segment');
      if (chakraSegment) {
        chakraSegment.style.transform = `rotate(${rotation}deg)`;
      }

      console.log(`[ChakraWheel] ${unit.name}: ${currentChakra}/${maxChakra} chakra (${Math.round(chakraPercent)}% = ${Math.round(rotation)}deg)`);

      // Check if ultimate-ready (show red ring)
      this.checkUltimateReady(unit, wheel, core);
    },

    /**
     * Check if unit has enough chakra for ultimate and show red ring
     */
    checkUltimateReady(unit, wheel, core) {
      const skills = window.BattleCombat?.getUnitSkills(unit);
      if (!skills?.ultimate) return;

      const ultCost = Number(skills.ultimate.data?.chakraCost ?? 8);
      const hasEnough = unit.chakra >= ultCost;

      if (hasEnough) {
        wheel.classList.add('ultimate-ready');
      } else {
        wheel.classList.remove('ultimate-ready');
      }
    },

    /* ===== Chakra Gain Animation ===== */

    /**
     * Animate chakra gain (segment rotates smoothly to new position)
     */
    animateChakraGain(unit, amount, core) {
      // Simply update the wheel - CSS transition handles smooth rotation
      this.updateChakraWheel(unit, core);

      const wheel = this.wheelCache.get(unit.id);
      if (!wheel) return;

      // Add flash effect
      wheel.classList.add('chakra-gain-flash');
      setTimeout(() => {
        wheel.classList.remove('chakra-gain-flash');
      }, 500);
    },

    /* ===== Click Detection System ===== */

    /**
     * Handle wheel click for double/triple-click detection
     * DOES NOT EXECUTE ATTACKS - only routes to input manager to set attack type
     */
    handleWheelClick(unit, wheel, event) {
      event.stopPropagation();

      const unitId = unit.id;
      let tracking = this.clickTracking.get(unitId);

      if (!tracking) {
        tracking = { count: 0, timer: null };
        this.clickTracking.set(unitId, tracking);
      }

      // Increment click count
      tracking.count++;

      // Clear existing timer
      if (tracking.timer) {
        clearTimeout(tracking.timer);
      }

      // Set new timer
      tracking.timer = setTimeout(() => {
        const clickCount = tracking.count;
        tracking.count = 0;

        // Route to input manager - DOES NOT EXECUTE, only sets attack type
        if (window.BattleInputManager) {
          if (clickCount === 1) {
            window.BattleInputManager.handleSingleClick(unit);
          } else if (clickCount === 2) {
            window.BattleInputManager.handleDoubleClick(unit);
          } else if (clickCount >= 3) {
            window.BattleInputManager.handleTripleClick(unit);
          }
        }
      }, this.CLICK_DELAY);
    },

    /* ===== Visual Effects ===== */

    /**
     * Show lightning effect around chakra wheel (visual only, non-blocking)
     * Called by BattleInputManager when attack type is selected
     */
    showLightningEffect(wheel, type = 'red') {
      // Remove any existing lightning
      const existing = wheel.querySelector('.lightning-effect');
      if (existing) {
        existing.remove();
      }

      // Create lightning container
      const lightning = document.createElement('div');
      lightning.className = `lightning-effect ${type}`;

      // Create lightning bolts (9 for red, 10 for gold)
      const boltCount = type === 'gold' ? 10 : 9;
      for (let i = 0; i < boltCount; i++) {
        const bolt = document.createElement('div');
        bolt.className = 'lightning-bolt';
        lightning.appendChild(bolt);
      }

      // Attach to parent container (not wheel directly)
      const parent = wheel.parentElement;
      if (parent) {
        parent.appendChild(lightning);
      } else {
        wheel.appendChild(lightning);
      }

      // Remove after animation completes
      const duration = type === 'gold' ? 1100 : 750;
      setTimeout(() => {
        lightning.remove();
      }, duration);
    },

    /* ===== Utility Functions ===== */

    /**
     * Remove chakra wheel for a unit
     */
    removeChakraWheel(unitId) {
      const wheel = this.wheelCache.get(unitId);
      if (wheel) {
        wheel.remove();
        this.wheelCache.delete(unitId);
      }
      this.clickTracking.delete(unitId);
    },

    /**
     * Clear all chakra wheels
     */
    clearAll() {
      this.wheelCache.forEach(wheel => wheel.remove());
      this.wheelCache.clear();
      this.clickTracking.clear();
    },

    /**
     * Get chakra wheel element for a unit
     */
    getWheel(unitId) {
      return this.wheelCache.get(unitId);
    }
  };

  // Export to window
  window.BattleChakraWheel = BattleChakraWheel;

  console.log("[BattleChakraWheel] Image-based chakra gauge system loaded ✅");
})();
