// js/battle.js - Modular Battle System Entry Point (Fixed)
(() => {
  "use strict";

  console.log("[Battle] Starting modular battle system...");

  // Wait for all modules to load
  function waitForModules() {
    const requiredModules = [
      'BattleCore',
      'BattleChakra',
      'BattleCombat',
      'BattleUnits',
      'BattleDrag',
      'BattleSwap',
      'BattleTurns',
      'BattleBuffs',
      'BattleNarrator',
      'BattleTeamHolder',
      'BattleChakraWheel'
    ];

    const allLoaded = requiredModules.every(mod => window[mod]);

    if (allLoaded) {
      console.log("[Battle] ✅ All modules loaded");
      initializeBattle();
    } else {
      const missing = requiredModules.filter(mod => !window[mod]);
      console.warn("[Battle] ⏳ Waiting for modules:", missing.join(', '));
      setTimeout(waitForModules, 100);
    }
  }

  function initializeBattle() {
    // Create unified BattleManager that combines BattleCore with all modules
    const BattleManager = {
      // Inherit all BattleCore properties and methods
      ...window.BattleCore,

      // Override init to connect modules
      async init() {
        console.log("[Battle] Initializing with modules...");

        // Connect module references
        this.chakra = window.BattleChakra;
        this.combat = window.BattleCombat;
        this.units = window.BattleUnits;
        this.drag = window.BattleDrag;
        this.swap = window.BattleSwap;
        this.turns = window.BattleTurns;
        this.teamHolder = window.BattleTeamHolder;

        // Call BattleCore init
        await window.BattleCore.init.call(this);

        // Initialize and render team holder
        if (this.teamHolder) {
          this.teamHolder.init(this);
          this.teamHolder.renderTeamHolder(this);
        }

        console.log("[Battle] ✅ Battle system ready with all modules");
      },

      // Property delegates for currentUnit and isPlayerTurn
      get currentUnit() {
        return this.turns ? this.turns.currentUnit : null;
      },
      set currentUnit(v) {
        if (this.turns) this.turns.currentUnit = v;
      },

      get isPlayerTurn() {
        return this.turns ? this.turns.isPlayerTurn : false;
      },
      set isPlayerTurn(v) {
        if (this.turns) this.turns.isPlayerTurn = v;
      }
    };

    // Export globally
    window.BattleManager = BattleManager;

    // Auto-initialize
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => BattleManager.init());
    } else {
      BattleManager.init();
    }

    console.log("[Battle] ✅ Modular system initialized");
  }

  // Start waiting for modules
  waitForModules();
})();
