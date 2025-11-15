// js/battle/battle-team-holder.js - Team Holder UI with Chakra Wheels
(() => {
  "use strict";

  /**
   * BattleTeamHolder Module
   * Renders the team holder UI at bottom of screen showing all player units
   * Each unit displays with portrait and chakra wheel
   *
   * Features:
   * - Active units (larger portraits, 80px)
   * - Bench units (smaller portraits, 60px)
   * - Chakra wheels attached to each portrait
   * - HP bars under each unit
   * - Acting unit highlighted
   */
  const BattleTeamHolder = {
    // DOM references
    teamHolder: null,
    activeUnitsRow: null,
    benchUnitsRow: null,

    /* ===== Initialization ===== */

    /**
     * Initialize team holder
     */
    init(core) {
      this.teamHolder = document.getElementById('team-holder');

      if (!this.teamHolder) {
        console.error('[TeamHolder] Team holder element not found!');
        return false;
      }

      console.log('[TeamHolder] Initialized');
      return true;
    },

    /* ===== Rendering ===== */

    /**
     * Render all player units in team holder
     * Creates 4 unit cards, each with nested active+bench portraits
     */
    renderTeamHolder(core) {
      if (!this.teamHolder) {
        console.error('[TeamHolder] Not initialized - teamHolder element not found!');
        return;
      }

      console.log('[TeamHolder] ========== RENDERING TEAM HOLDER ==========');
      console.log('[TeamHolder] Active team:', core.activeTeam?.length || 0, 'units');
      console.log('[TeamHolder] Bench team:', core.benchTeam?.length || 0, 'units');

      // Pair up active + bench units into cards
      const numCards = Math.max(core.activeTeam?.length || 0, core.benchTeam?.length || 0);

      this.teamHolder.innerHTML = '';

      for (let i = 0; i < numCards; i++) {
        const activeUnit = core.activeTeam?.[i];
        const benchUnit = core.benchTeam?.[i];

        if (activeUnit) {
          const cardHTML = this.createUnitCardHTML(activeUnit, benchUnit, i);
          this.teamHolder.insertAdjacentHTML('beforeend', cardHTML);
        }
      }

      // Attach chakra wheels to all portraits
      this.attachAllChakraWheels(core);

      console.log('[TeamHolder] ========== TEAM HOLDER RENDERED ==========');
    },

    /**
     * Create HTML for a unit card (active + bench nested)
     */
    createUnitCardHTML(activeUnit, benchUnit, index) {
      const activeHpPercent = Math.max(0, (activeUnit.stats.hp / activeUnit.stats.maxHP) * 100);
      const isDead = activeUnit.stats.hp <= 0;

      let benchHTML = '';
      if (benchUnit) {
        benchHTML = `
          <div class="bench-portrait-container" data-unit-id="${benchUnit.id}" data-unit-type="bench">
            <img src="${benchUnit.portrait}" alt="${benchUnit.name}"
                 onerror="this.src='assets/characters/common/silhouette.png';">
          </div>
        `;
      }

      return `
        <div class="unit-card ${isDead ? 'is-dead' : ''}" data-card-index="${index}">
          <div class="active-portrait-container" data-unit-id="${activeUnit.id}" data-unit-type="active">
            <img src="${activeUnit.portrait}" alt="${activeUnit.name}"
                 onerror="this.src='assets/characters/common/silhouette.png';">
            ${benchHTML}
          </div>
          <div class="unit-info">
            <div class="unit-name">${activeUnit.name}</div>
            <div class="unit-hp-bar">
              <div class="unit-hp-fill" style="width: ${activeHpPercent}%"></div>
            </div>
          </div>
        </div>
      `;
    },

    /**
     * Attach chakra wheels to all unit portraits
     */
    attachAllChakraWheels(core) {
      // Attach to active portraits
      this.teamHolder.querySelectorAll('[data-unit-type="active"]').forEach(container => {
        const unitId = container.dataset.unitId;
        const unit = core.activeTeam.find(u => u.id === unitId);
        if (unit && window.BattleChakraWheel) {
          if (!window.BattleChakraWheel.getWheel(unit.id)) {
            console.log(`[TeamHolder] Creating chakra wheel for active unit: ${unit.name}`);
            window.BattleChakraWheel.createChakraWheel(unit, container, false);
          }
          window.BattleChakraWheel.updateChakraWheel(unit, core);
        }
      });

      // Attach to bench portraits
      this.teamHolder.querySelectorAll('[data-unit-type="bench"]').forEach(container => {
        const unitId = container.dataset.unitId;
        const unit = core.benchTeam.find(u => u.id === unitId);
        if (unit && window.BattleChakraWheel) {
          if (!window.BattleChakraWheel.getWheel(unit.id)) {
            console.log(`[TeamHolder] Creating chakra wheel for bench unit: ${unit.name}`);
            window.BattleChakraWheel.createChakraWheel(unit, container, true);
          }
          window.BattleChakraWheel.updateChakraWheel(unit, core);
        }
      });
    },

    /**
     * Attach chakra wheel to a unit element
     */
    attachChakraWheel(unit, unitElement, isActive) {
      const portraitContainer = unitElement.querySelector('.portrait-container');
      if (!portraitContainer) {
        console.warn(`[TeamHolder] No portrait container for ${unit.name}`);
        return;
      }

      // Create chakra wheel using BattleChakraWheel module
      if (window.BattleChakraWheel) {
        const portrait = portraitContainer.querySelector('img');
        if (portrait) {
          // Check if wheel already exists
          if (!window.BattleChakraWheel.getWheel(unit.id)) {
            console.log(`[TeamHolder] Creating chakra wheel for ${unit.name} (${isActive ? 'active' : 'bench'})`);
            window.BattleChakraWheel.createChakraWheel(unit, portraitContainer, !isActive);
          }
          // Update wheel display
          window.BattleChakraWheel.updateChakraWheel(unit, window.BattleManager || {});
        }
      }
    },

    /* ===== Updates ===== */

    /**
     * Update all units (HP, chakra, status)
     */
    updateAll(core) {
      // Update HP bars
      core.activeTeam.forEach(unit => this.updateUnitHP(unit));
      core.benchTeam.forEach(unit => this.updateUnitHP(unit));

      // Update chakra wheels
      if (window.BattleChakraWheel) {
        core.activeTeam.forEach(unit => {
          window.BattleChakraWheel.updateChakraWheel(unit, core);
        });
        core.benchTeam.forEach(unit => {
          window.BattleChakraWheel.updateChakraWheel(unit, core);
        });
      }
    },

    /**
     * Update single unit's HP bar
     */
    updateUnitHP(unit) {
      const unitEl = this.findUnitElement(unit.id);
      if (!unitEl) return;

      const hpBar = unitEl.querySelector('.unit-hp-fill');
      if (hpBar) {
        const hpPercent = Math.max(0, (unit.stats.hp / unit.stats.maxHP) * 100);
        hpBar.style.width = `${hpPercent}%`;
      }

      // Update dead state
      if (unit.stats.hp <= 0) {
        unitEl.classList.add('is-dead');
      } else {
        unitEl.classList.remove('is-dead');
      }
    },

    /**
     * Highlight the currently acting unit
     */
    highlightActingUnit(unit) {
      // Remove all previous highlights
      this.teamHolder?.querySelectorAll('.team-unit').forEach(el => {
        el.classList.remove('is-acting');
      });

      // Add highlight to current unit
      if (unit) {
        const unitEl = this.findUnitElement(unit.id);
        if (unitEl) {
          unitEl.classList.add('is-acting');
        }
      }
    },

    /**
     * Update unit chakra wheel
     */
    updateUnitChakra(unit, core) {
      if (window.BattleChakraWheel) {
        window.BattleChakraWheel.updateChakraWheel(unit, core);
      }
    },

    /* ===== Utility ===== */

    /**
     * Find unit element by ID
     */
    findUnitElement(unitId) {
      return this.teamHolder?.querySelector(`.team-unit[data-unit-id="${unitId}"]`);
    },

    /**
     * Clear and re-render entire team holder
     */
    refresh(core) {
      this.renderTeamHolder(core);
    }
  };

  // Export to window
  window.BattleTeamHolder = BattleTeamHolder;

  console.log("[BattleTeamHolder] Module loaded ✅");
})();
