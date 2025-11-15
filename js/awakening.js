// js/awakening.js
// Awakening System - handles tier promotion with material requirements
// Load AFTER progression.js and resources.js

(function (global) {
  "use strict";

  let _awakeningRequirements = null;

  // Load awakening requirements from JSON
  async function loadRequirements() {
    if (_awakeningRequirements) return _awakeningRequirements;

    try {
      const res = await fetch("data/awakening-requirements.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      _awakeningRequirements = data.tierRequirements || {};
      return _awakeningRequirements;
    } catch (err) {
      console.error("[Awakening] Failed to load requirements:", err);
      _awakeningRequirements = {};
      return {};
    }
  }

  // Get awakening requirements for a tier
  async function getRequirements(tierCode) {
    const reqs = await loadRequirements();
    return reqs[tierCode] || null;
  }

  // Check if character can awaken (level + tier requirements)
  function canAwaken(inst, character) {
    if (!inst || !character) return false;
    if (!global.Progression) return false;

    // Use Progression.canAwaken (checks level and tier)
    return global.Progression.canAwaken(inst, character);
  }

  // Check if player has materials to awaken
  async function canAffordAwaken(inst, character) {
    if (!canAwaken(inst, character)) return false;
    if (!global.Resources) return false;

    const tier = inst.tierCode || global.Progression.getTierBounds(character).minCode;
    const reqs = await getRequirements(tier);

    if (!reqs || !reqs.materials) return true; // No requirements = free awakening

    return global.Resources.canAfford(reqs.materials);
  }

  // Get missing materials for awakening
  async function getMissingMaterials(inst, character) {
    if (!inst || !character) return {};

    const tier = inst.tierCode || global.Progression.getTierBounds(character).minCode;
    const reqs = await getRequirements(tier);

    if (!reqs || !reqs.materials) return {};

    const missing = {};
    for (const [mat, required] of Object.entries(reqs.materials)) {
      const owned = global.Resources ? global.Resources.get(mat) : 0;
      if (owned < required) {
        missing[mat] = {
          required,
          owned,
          missing: required - owned
        };
      }
    }

    return missing;
  }

  // Perform awakening (with material cost)
  async function performAwaken(inst, character, mode = "reset") {
    if (!inst || !character) {
      return { ok: false, reason: "INVALID_INSTANCE_OR_CHARACTER" };
    }

    if (!canAwaken(inst, character)) {
      return { ok: false, reason: "CANNOT_AWAKEN" };
    }

    const tier = inst.tierCode || global.Progression.getTierBounds(character).minCode;
    const reqs = await getRequirements(tier);

    // Check and spend materials if requirements exist
    if (reqs && reqs.materials && global.Resources) {
      const spendResult = global.Resources.spend(reqs.materials);
      if (!spendResult.ok) {
        return spendResult;
      }
    }

    // Perform tier promotion via Progression system
    if (!global.Progression) {
      return { ok: false, reason: "PROGRESSION_NOT_INITIALIZED" };
    }

    const result = global.Progression.promoteTier(inst, character, mode);

    return result;
  }

  // Get awakening preview (what will happen)
  async function getAwakeningPreview(inst, character) {
    if (!inst || !character || !global.Progression) {
      return null;
    }

    const currentTier = inst.tierCode || global.Progression.getTierBounds(character).minCode;
    const reqs = await getRequirements(currentTier);

    if (!reqs) return null;

    const nextTier = reqs.nextTier;
    const materials = reqs.materials || {};
    const canDoIt = canAwaken(inst, character);
    const canPay = await canAffordAwaken(inst, character);

    // Get stats preview
    const currentStats = global.Progression.computeEffectiveStatsLoreTier(
      character,
      inst.level,
      currentTier
    );

    const nextCap = global.Progression.levelCapForCode(nextTier);
    const nextStats = global.Progression.computeEffectiveStatsLoreTier(
      character,
      1, // After awakening, level resets to 1
      nextTier
    );

    return {
      currentTier,
      nextTier,
      materials,
      canAwaken: canDoIt,
      canAfford: canPay,
      currentStats: currentStats.stats,
      nextStats: nextStats.stats,
      currentCap: currentStats.cap,
      nextCap
    };
  }

  // Public API
  global.Awakening = {
    loadRequirements,
    getRequirements,
    canAwaken,
    canAffordAwaken,
    getMissingMaterials,
    performAwaken,
    getAwakeningPreview
  };

})(window);
