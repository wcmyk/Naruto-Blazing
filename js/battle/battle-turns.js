// js/battle/battle-turns.js - Turn Management & Speed Gauge System
(() => {
  "use strict";

  /**
   * BattleTurns Module
   * Handles speed-based turn system with pause/resume mechanics
   *
   * Features:
   * - Speed-based gauge progression (faster units act more often)
   * - Turn locking (one unit at a time)
   * - Pause/resume for non-acting units
   * - Speed gauge visualization
   * - AI turn execution
   * - Action panel management
   */
  const BattleTurns = {
    // ===== State =====
    currentUnit: null,
    turnLocked: false,
    isPlayerTurn: false,
    speedGaugeInterval: null,
    autoMode: false,

    /* ===== Speed Gauge System ===== */

    /**
     * Start speed gauge tick system
     * Units gain gauge based on speed stat
     * Faster units reach max gauge first
     */
    startSpeedGaugeTick(core) {
      if (this.speedGaugeInterval) clearInterval(this.speedGaugeInterval);

      this.speedGaugeInterval = setInterval(() => {
        // Don't advance if battle paused or turn locked
        if (core.isPaused || this.turnLocked) return;

        // Advance all non-paused combatants
        core.combatants.forEach(unit => {
          if (unit.stats.hp <= 0 || unit.isPaused) return;

          // Increment gauge by speed stat (modified by speed multiplier)
          const speedGain = unit.stats.speed * core.speedMultiplier;
          unit.speedGauge = Math.min(core.GAUGE_MAX, unit.speedGauge + speedGain);
        });

        this.updateSpeedGaugeDisplay(core);

        // Check for units ready to act (gauge >= max)
        const ready = core.combatants.find(u =>
          u.stats.hp > 0 &&
          u.speedGauge >= core.GAUGE_MAX &&
          !u.isPaused &&
          !this.turnLocked
        );

        if (ready) {
          ready.speedGauge = core.GAUGE_MAX; // Cap at max
          this.startTurn(ready, core);
        }
      }, core.SPEED_TICK_INTERVAL);

      console.log("[Turns] Speed gauge system started");
    },

    /**
     * Update speed gauge visual display
     * Shows all units' progress with position labels
     */
    updateSpeedGaugeDisplay(core) {
      if (!core.dom.speedGaugeTrack) return;

      core.dom.speedGaugeTrack.innerHTML = "";

      // Sort by gauge progress (highest first)
      const sorted = [...core.combatants]
        .filter(u => u.stats.hp > 0)
        .sort((a, b) => b.speedGauge - a.speedGauge);

      sorted.forEach(unit => {
        const marker = document.createElement("div");
        marker.className = `speed-marker ${unit.isPlayer ? 'player' : 'enemy'}`;
        marker.dataset.unitId = unit.id;

        // Add visual states
        if (unit.isPaused) {
          marker.classList.add('paused');
        }
        if (unit === this.currentUnit) {
          marker.classList.add('acting');
        }

        const progress = (unit.speedGauge / core.GAUGE_MAX) * 100;
        marker.style.left = `${Math.min(98, progress)}%`;

        // Show position ID and speed for players
        const posLabel = unit.isPlayer ?
          `<span class="pos-label">${unit.positionId}</span>` : '';
        const speedLabel = `<span class="speed-label">${unit.stats.speed}</span>`;

        marker.innerHTML = `
          ${posLabel}
          <img src="${unit.portrait}" alt="${unit.name}"
               onerror="this.src='assets/characters/common/silhouette.png';">
          ${speedLabel}
        `;

        core.dom.speedGaugeTrack.appendChild(marker);
      });
    },

    /* ===== Pause/Resume System ===== */

    /**
     * Pause all units except current actor
     * Prevents gauge advancement during turn
     */
    pauseAllOtherUnits(core) {
      core.combatants.forEach(unit => {
        if (unit !== this.currentUnit) {
          unit.isPaused = true;
        }
      });
      console.log(`[Turns] All units paused except ${this.currentUnit.name}`);
    },

    /**
     * Resume all units
     * Allows gauge advancement after turn ends
     */
    resumeAllUnits(core) {
      core.combatants.forEach(unit => {
        unit.isPaused = false;
      });
      console.log("[Turns] All units resumed");
    },

    /* ===== Turn Management ===== */

    /**
     * Start a unit's turn
     * Locks system, pauses others, shows action panel
     */
    startTurn(unit, core) {
      if (core.isPaused || !unit || this.turnLocked) return;

      console.log(`[Turns] ${unit.name} turn start (speed: ${unit.stats.speed}, gauge: ${unit.speedGauge})`);

      // Lock turn system
      this.turnLocked = true;
      this.currentUnit = unit;
      this.isPlayerTurn = unit.isPlayer;

      // Pause all other units
      this.pauseAllOtherUnits(core);

      // Reset unit state
      unit.isGuarding = false;

      // Clear overlays
      if (core.overlay) core.overlay.clear();
      this.clearEnemyHighlights(core);

      // Visual feedback - highlight active unit
      core.dom.scene?.querySelectorAll(".battle-unit").forEach(el => {
        el.classList.toggle("active", el.dataset.unitId === unit.id);
      });

      // Show action panel or perform AI turn
      if (unit.isPlayer && !this.autoMode) {
        this.showActionPanel(unit, core);
      } else {
        setTimeout(() => {
          if (window.BattleCombat) {
            window.BattleCombat.performAITurn(unit, core);
          }
          setTimeout(() => this.endTurn(core), 1200);
        }, 500);
      }
    },

    /**
     * End current unit's turn
     * Resets gauge, unlocks system, resumes all
     */
    endTurn(core) {
      if (!this.currentUnit) return;

      console.log(`[Turns] ${this.currentUnit.name} turn end`);

      // Reset chakra mode if using chakra system
      if (core.chakra) {
        core.chakra.resetChakraMode(this.currentUnit, core);
      }

      // Reset gauge to 0 after acting
      this.currentUnit.speedGauge = 0;
      this.currentUnit.isPaused = false;

      this.hideActionPanel(core);
      core.queuedAction = null;

      if (core.overlay) core.overlay.clear();
      this.clearEnemyHighlights(core);

      // Unlock turn system
      this.turnLocked = false;
      this.currentUnit = null;

      // Resume all units
      this.resumeAllUnits(core);
    },

    /* ===== Action Panel ===== */

    /**
     * Show action panel for player units
     * Displays skills, chakra status, and action buttons
     */
    showActionPanel(unit, core) {
      if (!core.dom.actionPanel) return;

      const skills = window.BattleCombat?.getUnitSkills(unit) || { jutsu: null, ultimate: null };

      // Update portrait and basic info
      if (core.dom.actionPortrait) {
        core.dom.actionPortrait.src = unit.portrait;
      }
      if (core.dom.actionName) {
        core.dom.actionName.textContent = `${unit.name} [Pos ${unit.positionId}]`;
      }
      if (core.dom.actionHP) {
        core.dom.actionHP.textContent = `HP: ${unit.stats.hp} / ${unit.stats.maxHP}`;
      }
      if (core.dom.actionChakra) {
        core.dom.actionChakra.textContent = `Chakra: ${unit.chakra} / ${unit.maxChakra}`;
      }

      // Update chakra status display
      if (core.chakra) {
        core.chakra.updateActionPanelStatus(unit, core);
      }

      // Get skill costs
      const jCost = Number(skills.jutsu?.data?.chakraCost ?? 4);
      const uCost = Number(skills.ultimate?.data?.chakraCost ?? 8);

      // Check unlock status
      const jutsuUnlocked = window.BattleCombat?.isJutsuUnlocked(unit) ?? true;
      const ultUnlocked = window.BattleCombat?.isUltimateUnlocked(unit) ?? true;
      const unitLevel = window.BattleCombat?.getUnitLevel(unit) ?? 1;

      // Check if skills are usable (both unlocked AND have enough chakra)
      const canJutsu = !!skills.jutsu && jutsuUnlocked && unit.chakra >= jCost;
      const canUlt = !!skills.ultimate && ultUnlocked && unit.chakra >= uCost;

      // Update button states
      core.dom.btnJutsu?.classList.toggle("disabled", !canJutsu);
      core.dom.btnUltimate?.classList.toggle("disabled", !canUlt);

      // Update skill names with lock status
      if (core.dom.actionSkillName) {
        if (!skills.jutsu) {
          core.dom.actionSkillName.textContent = "—";
        } else if (!jutsuUnlocked) {
          core.dom.actionSkillName.textContent = `🔒 LOCKED (Lv ${unitLevel}/20)`;
        } else {
          core.dom.actionSkillName.textContent = `${skills.jutsu.meta.name} (${jCost})`;
        }
      }
      if (core.dom.actionUltName) {
        if (!skills.ultimate) {
          core.dom.actionUltName.textContent = "—";
        } else if (!ultUnlocked) {
          core.dom.actionUltName.textContent = `🔒 LOCKED (Lv ${unitLevel}/50)`;
        } else {
          core.dom.actionUltName.textContent = `${skills.ultimate.meta.name} (${uCost})`;
        }
      }

      core.dom.actionPanel.classList.remove("hidden");
    },

    /**
     * Hide action panel
     */
    hideActionPanel(core) {
      core.dom.actionPanel?.classList.add("hidden");
    },

    /* ===== Action Handlers ===== */

    /**
     * Handle attack button click
     */
    handleAttackButton(core) {
      core.queuedAction = "attack";
      this.highlightEnemies(core);
      console.log("[Turns] Attack mode - click or drag to enemy");
    },

    /**
     * Handle jutsu button click
     */
    handleJutsuButton(core) {
      if (!this.currentUnit) return;

      const skills = window.BattleCombat?.getUnitSkills(this.currentUnit);
      const cost = Number(skills?.jutsu?.data?.chakraCost ?? 4);

      // Check if jutsu exists
      if (!skills?.jutsu) {
        console.warn("[Turns] No jutsu skill available");
        return;
      }

      // Check if jutsu is unlocked
      const jutsuUnlocked = window.BattleCombat?.isJutsuUnlocked(this.currentUnit) ?? true;
      if (!jutsuUnlocked) {
        const level = window.BattleCombat?.getUnitLevel(this.currentUnit) ?? 1;
        console.warn(`[Turns] Jutsu locked - Level ${level}/20`);
        if (window.BattleNarrator) {
          window.BattleNarrator.narrate(`Jutsu is locked! Requires Level 20.`, core);
        }
        return;
      }

      // Check chakra
      if (this.currentUnit.chakra < cost) {
        console.warn("[Turns] Not enough chakra for jutsu");
        return;
      }

      core.queuedAction = "jutsu";
      this.highlightEnemies(core);
      console.log("[Turns] Jutsu mode - click or drag to enemy");
    },

    /**
     * Handle ultimate button click
     */
    handleUltimateButton(core) {
      if (!this.currentUnit) return;

      const skills = window.BattleCombat?.getUnitSkills(this.currentUnit);

      // Check if ultimate exists
      if (!skills?.ultimate) {
        console.warn("[Turns] No ultimate skill available");
        return;
      }

      // Check if ultimate is unlocked
      const ultUnlocked = window.BattleCombat?.isUltimateUnlocked(this.currentUnit) ?? true;
      if (!ultUnlocked) {
        const level = window.BattleCombat?.getUnitLevel(this.currentUnit) ?? 1;
        console.warn(`[Turns] Ultimate locked - Level ${level}/50`);
        if (window.BattleNarrator) {
          window.BattleNarrator.narrate(`Ultimate is locked! Requires Level 50.`, core);
        }
        return;
      }

      // Check chakra
      const cost = Number(skills.ultimate.data?.chakraCost ?? 8);
      if (this.currentUnit.chakra < cost) {
        console.warn("[Turns] Not enough chakra for ultimate");
        return;
      }

      core.queuedAction = "ultimate";
      this.highlightEnemies(core);
      console.log("[Turns] Ultimate mode - will hit all enemies");
    },

    /**
     * Handle guard button click
     */
    handleGuardButton(core) {
      if (!this.currentUnit) return;

      if (window.BattleCombat) {
        window.BattleCombat.performGuard(this.currentUnit, core);
      }
      this.endTurn(core);
    },

    /* ===== Visual Helpers ===== */

    /**
     * Highlight all targetable enemies
     */
    highlightEnemies(core) {
      core.dom.scene?.querySelectorAll(".battle-unit").forEach(el => {
        const unit = core.combatants.find(u => u.id === el.dataset.unitId);
        if (unit && !unit.isPlayer && unit.stats.hp > 0) {
          el.style.filter = "drop-shadow(0 0 15px rgba(255, 234, 120, 0.9))";
        }
      });
    },

    /**
     * Clear enemy highlights
     */
    clearEnemyHighlights(core) {
      core.dom.scene?.querySelectorAll(".battle-unit").forEach(el => {
        el.style.filter = "";
      });
    },

    /* ===== Utility Functions ===== */

    /**
     * Get current turn unit
     */
    getCurrentUnit() {
      return this.currentUnit;
    },

    /**
     * Check if turn is locked
     */
    isTurnLocked() {
      return this.turnLocked;
    },

    /**
     * Force end turn (for special cases)
     */
    forceEndTurn(core) {
      console.log("[Turns] Forcing turn end");
      this.endTurn(core);
    },

    /**
     * Toggle auto mode
     */
    toggleAutoMode(core) {
      this.autoMode = !this.autoMode;
      core.dom.btnAuto?.classList.toggle("active", this.autoMode);
      console.log(`[Turns] Auto mode: ${this.autoMode ? "ON" : "OFF"}`);
    },

    /**
     * Change speed multiplier
     */
    changeSpeedMultiplier(core) {
      const speeds = [1, 2, 3];
      const idx = speeds.indexOf(core.speedMultiplier);
      core.speedMultiplier = speeds[(idx + 1) % speeds.length];

      if (core.dom.btnSpeed) {
        core.dom.btnSpeed.textContent = `×${core.speedMultiplier}`;
      }

      console.log(`[Turns] Speed multiplier: ×${core.speedMultiplier}`);
    },

    /**
     * Stop speed gauge system (cleanup)
     */
    stopSpeedGaugeTick() {
      if (this.speedGaugeInterval) {
        clearInterval(this.speedGaugeInterval);
        this.speedGaugeInterval = null;
        console.log("[Turns] Speed gauge system stopped");
      }
    }
  };

  // Export to window
  window.BattleTurns = BattleTurns;

  console.log("[BattleTurns] Module loaded ✅");
})();
