// js/character-evolution.js
// Character Evolution System - Transform one character into another
// Different from Awakening (tier promotion) - this changes the character ID
// Load AFTER awakening.js

(function (global) {
  "use strict";

  /**
   * Check if a character can evolve to another character
   * Looks for "evolvesTo" field in character data
   */
  function canEvolve(character) {
    if (!character) return false;

    // Check if character has evolvesTo field
    return !!(character.evolvesTo && character.evolvesTo.length > 0);
  }

  /**
   * Get evolution options for a character
   * Returns array of character IDs this character can evolve into
   */
  function getEvolutionOptions(character) {
    if (!canEvolve(character)) return [];

    return Array.isArray(character.evolvesTo)
      ? character.evolvesTo
      : [character.evolvesTo];
  }

  /**
   * Check if character instance meets evolution requirements
   */
  function meetsEvolutionRequirements(inst, character, targetCharacterId) {
    if (!inst || !character) return false;
    if (!canEvolve(character)) return false;

    const options = getEvolutionOptions(character);
    if (!options.includes(targetCharacterId)) return false;

    // Requirements:
    // 1. Must be at max level for current tier
    const tierBounds = global.Progression?.getTierBounds(character);
    const currentTier = inst.tierCode || tierBounds?.minCode || "3S";
    const maxLevel = global.Progression?.levelCapForCode(currentTier) || 40;

    if (inst.level < maxLevel) {
      return false; // Must be max level
    }

    // 2. Must be at max tier (can't evolve if can still awaken)
    if (global.Progression?.canAwaken(inst, character)) {
      return false; // Must awaken first before evolving
    }

    return true;
  }

  /**
   * Get evolution requirements (materials, level, etc.)
   */
  async function getEvolutionRequirements(character, targetCharacterId) {
    if (!character || !targetCharacterId) return null;

    const options = getEvolutionOptions(character);
    if (!options.includes(targetCharacterId)) return null;

    // Check if there's a requirements map
    if (character.evolutionRequirements && character.evolutionRequirements[targetCharacterId]) {
      return character.evolutionRequirements[targetCharacterId];
    }

    // Default requirements (can be customized per character)
    return {
      level: "MAX", // Must be max level
      tier: "MAX",  // Must be max tier
      materials: {
        // Default evolution materials (customize as needed)
        "ramen": 50,
        "ryo": 100000
      }
    };
  }

  /**
   * Check if player can afford evolution
   */
  async function canAffordEvolution(character, targetCharacterId) {
    const reqs = await getEvolutionRequirements(character, targetCharacterId);
    if (!reqs || !reqs.materials) return true; // No material requirements

    if (!global.Resources) return false;

    return global.Resources.canAfford(reqs.materials);
  }

  /**
   * Get missing materials for evolution
   */
  async function getMissingEvolutionMaterials(character, targetCharacterId) {
    const reqs = await getEvolutionRequirements(character, targetCharacterId);
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

  /**
   * Perform character evolution
   * Transforms character from one ID to another
   */
  async function performEvolution(inst, character, targetCharacterId) {
    if (!inst || !character || !targetCharacterId) {
      return { ok: false, reason: "INVALID_PARAMETERS" };
    }

    // Check if evolution is possible
    if (!meetsEvolutionRequirements(inst, character, targetCharacterId)) {
      return { ok: false, reason: "REQUIREMENTS_NOT_MET" };
    }

    // Get and validate target character exists
    const targetCharacter = await global.Characters?.getCharacterById(targetCharacterId);
    if (!targetCharacter) {
      return { ok: false, reason: "TARGET_CHARACTER_NOT_FOUND" };
    }

    // Check and spend materials
    const reqs = await getEvolutionRequirements(character, targetCharacterId);
    if (reqs && reqs.materials && global.Resources) {
      const spendResult = global.Resources.spend(reqs.materials);
      if (!spendResult.ok) {
        return spendResult;
      }
    }

    // Perform the evolution
    // Update the instance to point to the new character
    const oldCharacterId = inst.characterId;
    const oldLevel = inst.level;
    const oldTier = inst.tierCode;

    // Transform to new character
    inst.characterId = targetCharacterId;

    // Reset level to 1 (standard for evolution)
    inst.level = 1;

    // Keep the same tier or reset to min tier of new character
    const newTierBounds = global.Progression?.getTierBounds(targetCharacter);
    inst.tierCode = newTierBounds?.minCode || oldTier;

    // Preserve luck if it exists
    // (luck typically carries over in evolution)

    console.log(`✨ [Evolution] ${oldCharacterId} → ${targetCharacterId}`);
    console.log(`   Level: ${oldLevel} → 1`);
    console.log(`   Tier: ${oldTier} → ${inst.tierCode}`);

    // Save inventory
    if (global.InventoryChar && typeof global.InventoryChar.save === 'function') {
      global.InventoryChar.save();
    }

    return {
      ok: true,
      oldCharacterId,
      newCharacterId: targetCharacterId,
      oldLevel,
      newLevel: 1,
      oldTier,
      newTier: inst.tierCode
    };
  }

  /**
   * Get evolution preview
   */
  async function getEvolutionPreview(inst, character, targetCharacterId) {
    if (!inst || !character || !targetCharacterId) return null;

    const targetCharacter = await global.Characters?.getCharacterById(targetCharacterId);
    if (!targetCharacter) return null;

    const reqs = await getEvolutionRequirements(character, targetCharacterId);
    const canDoIt = meetsEvolutionRequirements(inst, character, targetCharacterId);
    const canPay = await canAffordEvolution(character, targetCharacterId);

    // Get current stats
    const currentTier = inst.tierCode || global.Progression?.getTierBounds(character)?.minCode || "3S";
    const currentStats = global.Progression?.computeEffectiveStatsLoreTier(
      character,
      inst.level,
      currentTier
    );

    // Get stats after evolution (level 1 of new character)
    const newTierBounds = global.Progression?.getTierBounds(targetCharacter);
    const newTier = newTierBounds?.minCode || "3S";
    const newStats = global.Progression?.computeEffectiveStatsLoreTier(
      targetCharacter,
      1,
      newTier
    );

    return {
      canEvolve: canDoIt,
      canAfford: canPay,
      requirements: reqs,
      current: {
        characterId: character.id,
        name: character.name,
        version: character.version,
        level: inst.level,
        tier: currentTier,
        stats: currentStats?.stats || {}
      },
      target: {
        characterId: targetCharacter.id,
        name: targetCharacter.name,
        version: targetCharacter.version,
        level: 1,
        tier: newTier,
        stats: newStats?.stats || {}
      }
    };
  }

  /**
   * Find all characters that can evolve (have evolvesTo field)
   */
  async function getAllEvolvableCharacters() {
    if (!global.Characters || !global.Characters.getAll) return [];

    const allCharacters = await global.Characters.getAll();
    return allCharacters.filter(c => canEvolve(c));
  }

  // Public API
  global.CharacterEvolution = {
    canEvolve,
    getEvolutionOptions,
    meetsEvolutionRequirements,
    getEvolutionRequirements,
    canAffordEvolution,
    getMissingEvolutionMaterials,
    performEvolution,
    getEvolutionPreview,
    getAllEvolvableCharacters
  };

  console.log("✅ [CharacterEvolution] System initialized");

})(window);
