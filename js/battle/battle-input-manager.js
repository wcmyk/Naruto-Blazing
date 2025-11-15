// js/battle/battle-input-manager.js - 2-Stage Input State Machine
(() => {
  "use strict";

  /**
   * BattleInputManager Module
   * Implements proper 2-stage input system for Naruto Blazing battle mechanics
   *
   * STAGE 1 (Click): Select attack type
   * - Single click → Normal Attack
   * - Double click → Ultimate
   * - Triple click → Secret Technique
   *
   * STAGE 2 (Drag): Target and execute
   * - Drag start → Show targeting UI
   * - Drag move → Update target indicator
   * - Drag release → Execute attack
   *
   * INDEPENDENT: Unit switching
   * - Click bench portrait → Swap active/bench (does NOT affect attack state)
   */
  const BattleInputManager = {
    // Input states
    STATES: {
      IDLE: 'idle',
      READY_TO_DRAG: 'readyToDrag',
      DRAGGING: 'dragging'
    },

    // Attack types
    ATTACK_TYPES: {
      NORMAL: 'normal',
      ULTIMATE: 'ultimate',
      SECRET: 'secret'
    },

    // Current state
    currentState: 'idle',
    selectedAttackType: null,
    selectedUnit: null,
    dragStartPos: null,
    currentTarget: null,

    /* ===== Initialization ===== */

    init(core) {
      this.core = core;
      this.setupDragHandlers();
      console.log('[InputManager] Initialized - 2-stage input system ready');
      return true;
    },

    /* ===== STAGE 1: Click to Select Attack Type ===== */

    /**
     * Handle single click - select normal attack
     */
    handleSingleClick(unit) {
      if (this.currentState !== this.STATES.IDLE) return;

      console.log(`[InputManager] Single click: Normal attack selected for ${unit.name}`);
      this.selectedAttackType = this.ATTACK_TYPES.NORMAL;
      this.selectedUnit = unit;
      this.currentState = this.STATES.READY_TO_DRAG;

      // Visual feedback - subtle glow
      this.showAttackTypeSelected(unit, 'normal');
    },

    /**
     * Handle double click - select ultimate
     */
    handleDoubleClick(unit) {
      if (this.currentState !== this.STATES.IDLE) return;

      // Check if unit has ultimate and enough chakra
      const skills = window.BattleCombat?.getUnitSkills(unit);
      if (!skills?.ultimate) {
        console.log(`[InputManager] ${unit.name} has no ultimate skill`);
        return;
      }

      const ultCost = Number(skills.ultimate.data?.chakraCost ?? 8);
      if (unit.chakra < ultCost) {
        console.log(`[InputManager] Not enough chakra for ultimate (need ${ultCost}, have ${unit.chakra})`);
        return;
      }

      console.log(`[InputManager] Double click: Ultimate selected for ${unit.name}`);
      this.selectedAttackType = this.ATTACK_TYPES.ULTIMATE;
      this.selectedUnit = unit;
      this.currentState = this.STATES.READY_TO_DRAG;

      // Visual feedback - red lightning (non-blocking)
      if (window.BattleChakraWheel) {
        const wheel = window.BattleChakraWheel.getWheel(unit.id);
        if (wheel) {
          window.BattleChakraWheel.showLightningEffect(wheel, 'red');
        }
      }
    },

    /**
     * Handle triple click - select secret technique
     */
    handleTripleClick(unit) {
      if (this.currentState !== this.STATES.IDLE) return;

      // Check if unit has secret and enough chakra
      const skills = window.BattleCombat?.getUnitSkills(unit);
      if (!skills?.secret) {
        console.log(`[InputManager] ${unit.name} has no secret technique`);
        return;
      }

      const secretCost = Number(skills.secret.data?.chakraCost ?? 12);
      if (unit.chakra < secretCost) {
        console.log(`[InputManager] Not enough chakra for secret (need ${secretCost}, have ${unit.chakra})`);
        return;
      }

      const secretUnlocked = window.BattleCombat?.isSecretUnlocked(unit) ?? false;
      if (!secretUnlocked) {
        console.log(`[InputManager] Secret technique is locked for ${unit.name}`);
        return;
      }

      console.log(`[InputManager] Triple click: Secret Technique selected for ${unit.name}`);
      this.selectedAttackType = this.ATTACK_TYPES.SECRET;
      this.selectedUnit = unit;
      this.currentState = this.STATES.READY_TO_DRAG;

      // Visual feedback - gold lightning (non-blocking)
      if (window.BattleChakraWheel) {
        const wheel = window.BattleChakraWheel.getWheel(unit.id);
        if (wheel) {
          window.BattleChakraWheel.showLightningEffect(wheel, 'gold');
        }
      }
    },

    /**
     * Show visual feedback for selected attack type
     */
    showAttackTypeSelected(unit, type) {
      const wheel = window.BattleChakraWheel?.getWheel(unit.id);
      if (!wheel) return;

      // Add subtle glow for normal attacks
      wheel.classList.add('attack-selected');
      setTimeout(() => {
        wheel.classList.remove('attack-selected');
      }, 500);
    },

    /* ===== STAGE 2: Drag to Target and Execute ===== */

    /**
     * Setup drag event handlers for targeting
     */
    setupDragHandlers() {
      document.addEventListener('pointerdown', (e) => this.handleDragStart(e));
      document.addEventListener('pointermove', (e) => this.handleDragMove(e));
      document.addEventListener('pointerup', (e) => this.handleDragEnd(e));
      document.addEventListener('pointercancel', (e) => this.cancelDrag(e));
    },

    /**
     * Handle drag start - begin targeting
     */
    handleDragStart(e) {
      // Only start drag if we're in ready-to-drag state
      if (this.currentState !== this.STATES.READY_TO_DRAG) return;

      // Check if drag started from the battle field area (not UI elements)
      const targetElement = e.target;
      if (targetElement.closest('.team-holder') ||
          targetElement.closest('.battle-ui-top')) {
        return; // Don't drag from UI elements
      }

      this.currentState = this.STATES.DRAGGING;
      this.dragStartPos = { x: e.clientX, y: e.clientY };

      console.log(`[InputManager] Drag started - targeting mode active`);
      this.showTargetingUI();
    },

    /**
     * Handle drag move - update targeting indicator
     */
    handleDragMove(e) {
      if (this.currentState !== this.STATES.DRAGGING) return;

      const currentPos = { x: e.clientX, y: e.clientY };
      this.updateTargetingUI(currentPos);

      // Find potential target under cursor
      const target = this.findTargetAtPosition(currentPos);
      if (target) {
        this.currentTarget = target;
        this.highlightTarget(target);
      }
    },

    /**
     * Handle drag end - execute attack
     */
    handleDragEnd(e) {
      if (this.currentState !== this.STATES.DRAGGING) return;

      console.log(`[InputManager] Drag released - executing ${this.selectedAttackType} attack`);

      // Execute the attack
      if (this.currentTarget && this.selectedUnit) {
        this.executeAttack(this.selectedUnit, this.selectedAttackType, this.currentTarget);
      }

      // Reset state
      this.resetState();
    },

    /**
     * Cancel drag
     */
    cancelDrag(e) {
      if (this.currentState === this.STATES.DRAGGING) {
        console.log(`[InputManager] Drag cancelled`);
        this.resetState();
      }
    },

    /**
     * Show targeting UI overlay
     */
    showTargetingUI() {
      // Create targeting overlay
      const overlay = document.createElement('div');
      overlay.className = 'targeting-overlay';
      overlay.id = 'targeting-overlay';

      const indicator = document.createElement('div');
      indicator.className = 'targeting-indicator';
      indicator.id = 'targeting-indicator';

      overlay.appendChild(indicator);
      document.body.appendChild(overlay);
    },

    /**
     * Update targeting UI position
     */
    updateTargetingUI(pos) {
      const indicator = document.getElementById('targeting-indicator');
      if (indicator) {
        indicator.style.left = `${pos.x}px`;
        indicator.style.top = `${pos.y}px`;
      }
    },

    /**
     * Find target enemy at position
     */
    findTargetAtPosition(pos) {
      // TODO: Implement proper collision detection with enemy positions
      // For now, return first enemy as placeholder
      return this.core?.enemyTeam?.[0] || null;
    },

    /**
     * Highlight target enemy
     */
    highlightTarget(target) {
      // TODO: Add visual highlight to targeted enemy
      console.log(`[InputManager] Targeting: ${target.name}`);
    },

    /**
     * Execute the selected attack
     */
    executeAttack(attacker, attackType, target) {
      console.log(`[InputManager] Executing ${attackType} attack: ${attacker.name} → ${target.name}`);

      // Route to battle combat system
      if (window.BattleCombat) {
        switch (attackType) {
          case this.ATTACK_TYPES.NORMAL:
            window.BattleCombat.performNormalAttack(attacker, target);
            break;
          case this.ATTACK_TYPES.ULTIMATE:
            window.BattleCombat.performUltimate(attacker, target);
            break;
          case this.ATTACK_TYPES.SECRET:
            window.BattleCombat.performSecretTechnique(attacker, target);
            break;
        }
      }
    },

    /**
     * Reset input state to idle
     */
    resetState() {
      this.currentState = this.STATES.IDLE;
      this.selectedAttackType = null;
      this.selectedUnit = null;
      this.dragStartPos = null;
      this.currentTarget = null;

      // Remove targeting UI
      const overlay = document.getElementById('targeting-overlay');
      if (overlay) {
        overlay.remove();
      }
    },

    /* ===== INDEPENDENT: Unit Switching ===== */

    /**
     * Handle unit switch (independent of attack state)
     * This is called directly from team holder when bench portrait is clicked
     */
    handleUnitSwitch(cardIndex) {
      // Switch does NOT affect attack state
      // It's completely independent
      console.log(`[InputManager] Unit switch at index ${cardIndex} - attack state unchanged`);

      // The actual switching is handled by BattleTeamHolder
      // We just log it here for tracking
    }
  };

  // Export to window
  window.BattleInputManager = BattleInputManager;

  console.log("[BattleInputManager] Module loaded ✅");
})();
