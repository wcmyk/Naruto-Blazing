// js/battle/battle-chakra-wheel.js - Chakra Wheel Visual System
(() => {
  "use strict";

  /**
   * BattleChakraWheel Module
   * Handles visual chakra wheel system with multi-ring layers, animations, and click interactions
   *
   * Features:
   * - Multi-ring layered chakra display (4 segments per ring)
   * - Brightness levels decrease with outer rings
   * - Red ring when ultimate-ready
   * - Chakra gain animation (blue orb flying in)
   * - Double-click detection → Red lightning (Ultimate)
   * - Triple-click detection → Gold lightning (Secret Technique)
   * - Active unit + Bench unit dual wheel support
   */
  const BattleChakraWheel = {
    // ===== Configuration =====
    SEGMENTS_PER_RING: 4,
    MAX_RINGS: 4,
    CLICK_DELAY: 300, // ms between clicks to detect double/triple

    // Click tracking
    clickTracking: new Map(), // unitId → {count, timer}

    // Wheel element cache
    wheelCache: new Map(), // unitId → wheelElement

    /* ===== Initialization ===== */

    /**
     * Initialize chakra wheel for a unit
     * Creates the wheel structure and attaches to portrait
     */
    createChakraWheel(unit, portraitContainerOrImg, isBench = false) {
      if (!unit || !portraitContainerOrImg) {
        console.warn('[ChakraWheel] Cannot create wheel - missing unit or portrait');
        return null;
      }

      console.log(`[ChakraWheel] Creating wheel for ${unit.name} (${isBench ? 'bench' : 'active'}), chakra: ${unit.chakra}/${unit.maxChakra}`);

      // Create wheel container
      const wheel = document.createElement('div');
      wheel.className = `chakra-wheel`;
      wheel.dataset.unitId = unit.id;

      // Create rings (initially all hidden, shown based on chakra amount)
      for (let ringIndex = 1; ringIndex <= this.MAX_RINGS; ringIndex++) {
        const ring = document.createElement('div');
        ring.className = `chakra-ring layer-${ringIndex}`;
        ring.dataset.ringIndex = ringIndex;
        ring.style.display = 'none'; // Hidden by default
        wheel.appendChild(ring);
      }

      // Add click listener for double/triple-click detection
      wheel.addEventListener('click', (e) => {
        this.handleWheelClick(unit, wheel, e);
      });

      // Cache the wheel element
      this.wheelCache.set(unit.id, wheel);

      // Attach wheel to portrait container
      // Check if it's a team holder portrait container (active or bench)
      const isTeamHolderContainer =
        portraitContainerOrImg.classList &&
        (portraitContainerOrImg.classList.contains('active-portrait-container') ||
         portraitContainerOrImg.classList.contains('bench-portrait-container'));

      if (isTeamHolderContainer) {
        // Team holder - append directly to portrait container
        portraitContainerOrImg.appendChild(wheel);
        console.log(`[ChakraWheel] Attached wheel to ${isBench ? 'bench' : 'active'} portrait for ${unit.name}`);
      } else {
        // Legacy support - wrap img element
        if (portraitContainerOrImg.parentElement) {
          const wrapper = document.createElement('div');
          wrapper.className = 'portrait-with-chakra';
          portraitContainerOrImg.parentElement.insertBefore(wrapper, portraitContainerOrImg);
          wrapper.appendChild(portraitContainerOrImg);
          wrapper.appendChild(wheel);
          console.log(`[ChakraWheel] Wrapped portrait for ${unit.name}, wheel attached`);
        } else {
          console.warn(`[ChakraWheel] Cannot wrap portrait for ${unit.name} - no parent element`);
        }
      }

      return wheel;
    },

    /**
     * Update chakra wheel display based on current chakra
     */
    updateChakraWheel(unit, core) {
      const wheel = this.wheelCache.get(unit.id);
      if (!wheel) {
        console.warn(`[ChakraWheel] No wheel found for ${unit.name} (${unit.id})`);
        return;
      }

      const currentChakra = unit.chakra || 0;
      const maxChakra = unit.maxChakra || 10;
      const chakraToShow = Math.min(currentChakra, maxChakra);

      console.log(`[ChakraWheel] Updating ${unit.name}: ${chakraToShow}/${maxChakra} chakra`);

      // Determine which rings should be visible and how many segments each has
      const ringData = this.calculateRingDistribution(chakraToShow);

      // Update each ring
      for (let ringIndex = 1; ringIndex <= this.MAX_RINGS; ringIndex++) {
        const ring = wheel.querySelector(`.chakra-ring.layer-${ringIndex}`);
        if (!ring) continue;

        const segmentCount = ringData[ringIndex] || 0;

        if (segmentCount > 0) {
          ring.style.display = 'block';
          this.updateRingSegments(ring, segmentCount, ringIndex, unit, core);
        } else {
          ring.style.display = 'none';
        }
      }

      // Check if ultimate-ready (final ring full and enough chakra for ultimate)
      this.checkUltimateReady(unit, wheel, core);
    },

    /**
     * Calculate how many segments go in each ring
     * Returns: {1: count, 2: count, 3: count, 4: count}
     */
    calculateRingDistribution(totalChakra) {
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0 };
      let remaining = totalChakra;

      // Fill rings from innermost to outermost
      for (let ring = 1; ring <= this.MAX_RINGS && remaining > 0; ring++) {
        const segmentsInRing = Math.min(remaining, this.SEGMENTS_PER_RING);
        distribution[ring] = segmentsInRing;
        remaining -= segmentsInRing;
      }

      return distribution;
    },

    /**
     * Update segments within a ring
     */
    updateRingSegments(ring, segmentCount, ringIndex, unit, core) {
      // Clear existing segments
      ring.innerHTML = '';

      // Create segments
      for (let i = 0; i < segmentCount; i++) {
        const segment = document.createElement('div');
        segment.className = 'chakra-segment';
        segment.dataset.position = i;
        ring.appendChild(segment);
      }
    },

    /**
     * Check if unit has enough chakra for ultimate and mark ring red
     */
    checkUltimateReady(unit, wheel, core) {
      const skills = window.BattleCombat?.getUnitSkills(unit);
      if (!skills?.ultimate) return;

      const ultCost = Number(skills.ultimate.data?.chakraCost ?? 8);
      const hasEnough = unit.chakra >= ultCost;

      // Find the topmost visible ring
      const rings = Array.from(wheel.querySelectorAll('.chakra-ring')).filter(r => r.style.display !== 'none');
      const topmostRing = rings[rings.length - 1];

      if (hasEnough && topmostRing) {
        // Check if this ring is full (has 4 segments)
        const segmentCount = topmostRing.querySelectorAll('.chakra-segment').length;
        if (segmentCount === this.SEGMENTS_PER_RING) {
          topmostRing.classList.add('ultimate-ready');

          // Trigger pulse animation once
          topmostRing.querySelectorAll('.chakra-segment').forEach(seg => {
            seg.style.animation = 'none';
            setTimeout(() => {
              seg.style.animation = 'ultimatePulse 0.5s ease-out';
            }, 10);
          });
        }
      } else if (topmostRing) {
        topmostRing.classList.remove('ultimate-ready');
      }
    },

    /* ===== Chakra Gain Animation ===== */

    /**
     * Update chakra wheel when chakra is gained
     * NO ORBS, NO FLYING PARTICLES - segments simply appear
     * @param {Object} unit - The unit gaining chakra
     * @param {number} amount - Amount of chakra gained
     * @param {Object} core - Battle core reference
     */
    animateChakraGain(unit, amount, core) {
      // Simply update the wheel display - segments appear/fade in
      this.updateChakraWheel(unit, core);

      // Flash the newest segments with arriving animation
      const wheel = this.wheelCache.get(unit.id);
      if (!wheel) return;

      const segments = Array.from(wheel.querySelectorAll('.chakra-segment'));
      const startIndex = Math.max(0, segments.length - amount);

      for (let i = startIndex; i < segments.length; i++) {
        const segment = segments[i];
        if (segment) {
          segment.classList.add('arriving');
          setTimeout(() => {
            segment.classList.remove('arriving');
          }, 500);
        }
      }
    },

    /* ===== Click Detection System ===== */

    /**
     * Handle wheel click for double/triple-click detection
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

        // Determine action based on click count
        if (clickCount === 2) {
          this.handleDoubleClick(unit, wheel);
        } else if (clickCount >= 3) {
          this.handleTripleClick(unit, wheel);
        }
      }, this.CLICK_DELAY);
    },

    /**
     * Handle double-click → Ultimate activation (red lightning)
     */
    handleDoubleClick(unit, wheel) {
      console.log(`[ChakraWheel] Double-click detected on ${unit.name}`);

      // Check if unit has ultimate and enough chakra
      const skills = window.BattleCombat?.getUnitSkills(unit);
      if (!skills?.ultimate) {
        console.log(`[ChakraWheel] ${unit.name} has no ultimate skill`);
        return;
      }

      const ultCost = Number(skills.ultimate.data?.chakraCost ?? 8);
      if (unit.chakra < ultCost) {
        console.log(`[ChakraWheel] Not enough chakra for ultimate (need ${ultCost}, have ${unit.chakra})`);
        return;
      }

      // Check if ultimate is unlocked
      const ultUnlocked = window.BattleCombat?.isUltimateUnlocked(unit) ?? true;
      if (!ultUnlocked) {
        console.log(`[ChakraWheel] Ultimate is locked for ${unit.name}`);
        return;
      }

      // Show red lightning effect
      this.showLightningEffect(wheel, 'red');

      // TODO: Queue ultimate action in battle system
      console.log(`[ChakraWheel] Ultimate ready for ${unit.name}!`);
    },

    /**
     * Handle triple-click → Secret Technique activation (gold lightning)
     */
    handleTripleClick(unit, wheel) {
      console.log(`[ChakraWheel] Triple-click detected on ${unit.name}`);

      // Check if unit has secret technique and enough chakra
      const skills = window.BattleCombat?.getUnitSkills(unit);
      if (!skills?.secret) {
        console.log(`[ChakraWheel] ${unit.name} has no secret technique`);
        return;
      }

      const secretCost = Number(skills.secret.data?.chakraCost ?? 12);
      if (unit.chakra < secretCost) {
        console.log(`[ChakraWheel] Not enough chakra for secret (need ${secretCost}, have ${unit.chakra})`);
        return;
      }

      // Check if secret is unlocked (requires 6S+ tier)
      const secretUnlocked = window.BattleCombat?.isSecretUnlocked(unit) ?? false;
      if (!secretUnlocked) {
        console.log(`[ChakraWheel] Secret technique is locked for ${unit.name}`);
        return;
      }

      // Show gold lightning effect (overrides red)
      this.showLightningEffect(wheel, 'gold');

      // TODO: Queue secret technique action in battle system
      console.log(`[ChakraWheel] Secret Technique ready for ${unit.name}!`);
    },

    /**
     * Show lightning effect around chakra wheel
     * @param {HTMLElement} wheel - The chakra wheel element
     * @param {string} type - 'red' for ultimate, 'gold' for secret
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

  console.log("[BattleChakraWheel] Module loaded ✅");
})();
