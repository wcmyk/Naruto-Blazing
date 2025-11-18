// js/battle/battle-chakra-wheel.js - Image-Based Circular Chakra Gauge System
(() => {
  "use strict";

  /**
   * BattleChakraWheel Module
   * Professional chakra accumulation system with continuous rotation
   *
   * Features:
   * - Single rotating chakra arc (chakra.png)
   * - Rotation accumulates continuously (never resets)
   * - Circular frame overlay (chakraholder_icon.png, 140×140px)
   * - Proper layering: portrait (z:1) → chakra (z:5) → frame (z:10)
   * - Circular masking ensures chakra stays inside frame
   * - Click detection for attack selection
   * - Red ring when ultimate-ready
   */
  const BattleChakraWheel = {
    // Configuration
    CLICK_DELAY: 300, // ms between clicks to detect double/triple
    ROTATION_PER_CHAKRA: 36, // degrees per chakra point (10 chakra = 360°)

    // Click tracking
    clickTracking: new Map(), // unitId → {count, timer}

    // Wheel element cache
    wheelCache: new Map(), // unitId → wheelElement

    // Chakra rotation tracking (accumulates, never resets)
    chakraRotation: new Map(), // unitId → current rotation in degrees

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

      // Create unit ring container (140×140px)
      const unitRing = document.createElement('div');
      unitRing.className = 'unit-ring';
      unitRing.dataset.unitId = unit.id;

      // Clone portrait for bottom layer (128×128px, z-index: 1)
      const clonedPortrait = portraitImg.cloneNode(true);
      clonedPortrait.className = 'portrait';
      clonedPortrait.alt = unit.name;

      // Create chakra container (circular clipping container, z-index: 11)
      const chakraContainer = document.createElement('div');
      chakraContainer.className = 'chakra-container';

      // Create chakra segment (single rotating arc)
      const chakraSegment = document.createElement('img');
      chakraSegment.className = 'chakra-segment';
      chakraSegment.src = 'assets/ui/gauges/chakra.png';
      chakraSegment.alt = 'Chakra gauge';
      chakraContainer.appendChild(chakraSegment);

      // Create chakra frame overlay (top layer, 140×140px, z-index: 10)
      const chakraFrame = document.createElement('img');
      chakraFrame.className = 'chakra-frame';
      chakraFrame.src = 'assets/ui/frames/chakraholder_icon.png';
      chakraFrame.alt = 'Chakra frame';

      // Assemble structure: portrait → chakra container → frame
      unitRing.appendChild(clonedPortrait);
      unitRing.appendChild(chakraContainer);
      unitRing.appendChild(chakraFrame);

      // Initialize rotation tracking for this unit
      this.chakraRotation.set(unit.id, 0);

      // Add click listener for attack selection
      unitRing.addEventListener('click', (e) => {
        this.handleWheelClick(unit, unitRing, e);
      });

      // Cache the wheel element
      this.wheelCache.set(unit.id, unitRing);

      // Replace portrait container content
      portraitContainer.innerHTML = '';
      portraitContainer.appendChild(unitRing);

      console.log(`[ChakraWheel] Chakra accumulation system created for ${unit.name}`);

      return unitRing;
    },

    /**
     * Update chakra gauge rotation (accumulates continuously)
     */
    updateChakraWheel(unit, core) {
      const wheel = this.wheelCache.get(unit.id);
      if (!wheel) {
        console.warn(`[ChakraWheel] No wheel found for ${unit.name} (${unit.id})`);
        return;
      }

      const currentChakra = unit.chakra || 0;
      const maxChakra = unit.maxChakra || 10;

      // Calculate target rotation based on current chakra
      const targetRotation = currentChakra * this.ROTATION_PER_CHAKRA;

      // Get current rotation
      let currentRotation = this.chakraRotation.get(unit.id) || 0;

      // Apply rotation to chakra segment
      const chakraSegment = wheel.querySelector('.chakra-segment');
      if (chakraSegment) {
        chakraSegment.style.transform = `rotate(${targetRotation}deg)`;
      }

      // Store current rotation
      this.chakraRotation.set(unit.id, targetRotation);

      console.log(`[ChakraWheel] ${unit.name}: ${currentChakra}/${maxChakra} chakra (${Math.round(targetRotation)}° rotation)`);

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
     * Animate chakra gain (rotation accumulates smoothly)
     */
    animateChakraGain(unit, amount, core) {
      const wheel = this.wheelCache.get(unit.id);
      if (!wheel) return;

      // Get current rotation
      const currentRotation = this.chakraRotation.get(unit.id) || 0;

      // Calculate rotation increment (amount * degrees per chakra point)
      const rotationIncrement = amount * this.ROTATION_PER_CHAKRA;

      // Calculate new rotation (accumulates)
      const newRotation = currentRotation + rotationIncrement;

      // Apply rotation to chakra segment with smooth transition
      const chakraSegment = wheel.querySelector('.chakra-segment');
      if (chakraSegment) {
        chakraSegment.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        chakraSegment.style.transform = `rotate(${newRotation}deg)`;
      }

      // Store new rotation
      this.chakraRotation.set(unit.id, newRotation);

      // Update unit's chakra value
      unit.chakra = (unit.chakra || 0) + amount;

      console.log(`[ChakraWheel] ${unit.name} gained ${amount} chakra: ${currentRotation}° → ${newRotation}° (+${rotationIncrement}°)`);

      // Add flash effect
      wheel.classList.add('chakra-gain-flash');
      setTimeout(() => {
        wheel.classList.remove('chakra-gain-flash');
      }, 500);

      // Update UI
      this.updateChakraWheel(unit, core);
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
     * Reset chakra rotation for a unit (intentional reset)
     */
    resetChakraRotation(unitId) {
      this.chakraRotation.set(unitId, 0);
      const wheel = this.wheelCache.get(unitId);
      if (wheel) {
        const chakraSegment = wheel.querySelector('.chakra-segment');
        if (chakraSegment) {
          chakraSegment.style.transform = 'rotate(0deg)';
        }
      }
      console.log(`[ChakraWheel] Reset rotation for unit ${unitId}`);
    },

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
      this.chakraRotation.delete(unitId);
    },

    /**
     * Clear all chakra wheels
     */
    clearAll() {
      this.wheelCache.forEach(wheel => wheel.remove());
      this.wheelCache.clear();
      this.clickTracking.clear();
      this.chakraRotation.clear();
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

  console.log("[BattleChakraWheel] Chakra accumulation system loaded ✅");
})();
