// js/battle/battle-finish.js - Battle Finish Module
(() => {
  "use strict";

  /**
   * BattleFinish Module
   * Minimal stub for battle ending logic
   *
   * NOTE: "Ultimate Finish" feature has been COMPLETELY REMOVED as it was underdeveloped.
   * This module now only provides a minimal interface for future battle end features.
   */
  const BattleFinish = {

    /**
     * Placeholder for future finish effects
     * Currently does nothing - Ultimate Finish removed
     */
    checkBattleEnd(core) {
      // No-op - Ultimate Finish feature removed
      console.log("[Finish] Battle ending (no special effects)");
    },

    /**
     * Delay helper (kept for compatibility)
     */
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  };

  // Export globally
  window.BattleFinish = BattleFinish;

  console.log("[BattleFinish] Module loaded (Ultimate Finish removed) ✅");
})();
