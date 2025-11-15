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
      this.activeUnitsRow = document.getElementById('active-units-row');
      this.benchUnitsRow = document.getElementById('bench-units-row');

      if (!this.teamHolder || !this.activeUnitsRow || !this.benchUnitsRow) {
        console.error('[TeamHolder] Team holder containers not found!');
        return false;
      }

      console.log('[TeamHolder] Initialized');
      return true;
    },

    /* ===== Rendering ===== */

    /**
     * Render all player units in team holder
     */
    renderTeamHolder(core) {
      if (!this.teamHolder) {
        console.error('[TeamHolder] Not initialized - teamHolder element not found!');
        return;
      }

      console.log('[TeamHolder] ========== RENDERING TEAM HOLDER ==========');
      console.log('[TeamHolder] Active team:', core.activeTeam?.length || 0, 'units');
      console.log('[TeamHolder] Bench team:', core.benchTeam?.length || 0, 'units');
      console.log('[TeamHolder] Team holder element:', this.teamHolder);
      console.log('[TeamHolder] Active row element:', this.activeUnitsRow);
      console.log('[TeamHolder] Bench row element:', this.benchUnitsRow);

      if (!core.activeTeam || core.activeTeam.length === 0) {
        console.warn('[TeamHolder] No active team units to render!');
      }
      if (!core.benchTeam || core.benchTeam.length === 0) {
        console.warn('[TeamHolder] No bench team units to render!');
      }

      // Render active units (frontline)
      this.renderActiveUnits(core);

      // Render bench units (backline)
      this.renderBenchUnits(core);

      console.log('[TeamHolder] ========== TEAM HOLDER RENDERED ==========');
    },

    /**
     * Render active units row
     */
    renderActiveUnits(core) {
      if (!this.activeUnitsRow) return;

      this.activeUnitsRow.innerHTML = core.activeTeam.map(unit => {
        return this.createUnitHTML(unit, true);
      }).join('');

      // Attach chakra wheels
      this.activeUnitsRow.querySelectorAll('.team-unit').forEach(el => {
        const unitId = el.dataset.unitId;
        const unit = core.activeTeam.find(u => u.id === unitId);
        if (unit) {
          this.attachChakraWheel(unit, el, true);
        }
      });
    },

    /**
     * Render bench units row
     */
    renderBenchUnits(core) {
      if (!this.benchUnitsRow) return;

      this.benchUnitsRow.innerHTML = core.benchTeam.map(unit => {
        return this.createUnitHTML(unit, false);
      }).join('');

      // Attach chakra wheels
      this.benchUnitsRow.querySelectorAll('.team-unit').forEach(el => {
        const unitId = el.dataset.unitId;
        const unit = core.benchTeam.find(u => u.id === unitId);
        if (unit) {
          this.attachChakraWheel(unit, el, false);
        }
      });
    },

    /**
     * Create HTML for a single unit
     */
    createUnitHTML(unit, isActive) {
      const hpPercent = Math.max(0, (unit.stats.hp / unit.stats.maxHP) * 100);
      const isDead = unit.stats.hp <= 0;

      return `
        <div class="team-unit ${isActive ? 'active-unit' : 'bench-unit'} ${isDead ? 'is-dead' : ''}"
             data-unit-id="${unit.id}"
             data-position-id="${unit.positionId}">
          <div class="portrait-container">
            <img src="${unit.portrait}" alt="${unit.name}"
                 onerror="this.src='assets/characters/common/silhouette.png';">
          </div>
          <div class="unit-info">
            <div class="unit-name">${unit.name}</div>
            <div class="unit-hp-bar">
              <div class="unit-hp-fill" style="width: ${hpPercent}%"></div>
            </div>
          </div>
        </div>
      `;
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
