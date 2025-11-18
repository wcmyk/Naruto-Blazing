// js/resources.js
// Materials and Resources Inventory System
// Manages awakening materials, limit break materials, and other consumable items

(function (global) {
  "use strict";

  const STORAGE_KEY = "blazing_resources_v1";

  // Material types and their default quantities
  const MATERIAL_TYPES = {
    // Awakening materials (tier-specific)
    "awakening_stone_3": { name: "3★ Awakening Stone", desc: "Used to awaken 3★ characters" },
    "awakening_stone_4": { name: "4★ Awakening Stone", desc: "Used to awaken 4★ characters" },
    "awakening_stone_5": { name: "5★ Awakening Stone", desc: "Used to awaken 5★ characters" },
    "awakening_stone_6": { name: "6★ Awakening Stone", desc: "Used to awaken 6★ characters" },
    "awakening_stone_7": { name: "7★ Awakening Stone", desc: "Used to awaken 7★ characters" },
    "awakening_stone_8": { name: "8★ Awakening Stone", desc: "Used to awaken 8★ characters" },
    "awakening_stone_9": { name: "9★ Awakening Stone", desc: "Used to awaken 9★ characters" },

    // Limit break materials
    "limit_break_crystal": { name: "Limit Break Crystal", desc: "Breaks level limits for max-tier characters" },
    "dupe_crystal": { name: "Dupe Crystal", desc: "Obtained from duplicate characters" },

    // Element-specific scrolls
    "scroll_body": { name: "Body Scroll", desc: "Body element awakening material" },
    "scroll_skill": { name: "Skill Scroll", desc: "Skill element awakening material" },
    "scroll_bravery": { name: "Bravery Scroll", desc: "Bravery element awakening material" },
    "scroll_wisdom": { name: "Wisdom Scroll", desc: "Wisdom element awakening material" },
    "scroll_heart": { name: "Heart Scroll", desc: "Heart element awakening material" },

    // Character-specific materials
    "character_stone": { name: "Character Stone", desc: "Character-specific awakening material" },

    // Currencies
    "ryo": { name: "Ryo", desc: "Standard currency for various operations" },
    "ninja_pearls": { name: "Ninja Pearls", desc: "Premium currency for summons and special items" },
    "shinobites": { name: "Shinobites", desc: "Gacha currency for character summons" }
  };

  let _resources = {};

  // ---------- Persistence ----------
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const data = JSON.parse(raw);
      _resources = (data && typeof data === 'object') ? data : {};
    } catch {
      _resources = {};
    }
    // Initialize default quantities if not present
    initializeDefaults();
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_resources));
    } catch (err) {
      console.error("[Resources] Failed to save:", err);
    }
  }

  function initializeDefaults() {
    // Give starter materials if this is first load
    if (Object.keys(_resources).length === 0) {
      _resources = {
        "awakening_stone_3": 50,
        "awakening_stone_4": 30,
        "awakening_stone_5": 15,
        "awakening_stone_6": 10,
        "awakening_stone_7": 5,
        "awakening_stone_8": 3,
        "awakening_stone_9": 1,
        "limit_break_crystal": 5,
        "dupe_crystal": 10,
        "scroll_body": 20,
        "scroll_skill": 20,
        "scroll_bravery": 20,
        "scroll_wisdom": 20,
        "scroll_heart": 20,
        "character_stone": 30,
        "ryo": 100000,
        "ninja_pearls": 500,
        "shinobites": 50
      };
      save();
    }
  }

  // ---------- Read ----------
  function get(materialId) {
    return Number(_resources[materialId]) || 0;
  }

  function getAll() {
    return { ..._resources };
  }

  function has(materialId, amount = 1) {
    return get(materialId) >= amount;
  }

  function canAfford(costs) {
    // costs = { materialId: amount, ... }
    if (!costs || typeof costs !== 'object') return true;
    for (const [id, amt] of Object.entries(costs)) {
      if (!has(id, amt)) return false;
    }
    return true;
  }

  // ---------- Write ----------
  function add(materialId, amount = 1) {
    const current = get(materialId);
    _resources[materialId] = Math.max(0, current + (Number(amount) || 0));
    save();
    return _resources[materialId];
  }

  function subtract(materialId, amount = 1) {
    const current = get(materialId);
    const newAmount = Math.max(0, current - (Number(amount) || 0));
    _resources[materialId] = newAmount;
    save();
    return newAmount;
  }

  function spend(costs) {
    // costs = { materialId: amount, ... }
    if (!canAfford(costs)) {
      return { ok: false, reason: "INSUFFICIENT_MATERIALS" };
    }

    for (const [id, amt] of Object.entries(costs)) {
      subtract(id, amt);
    }

    return { ok: true };
  }

  function set(materialId, amount) {
    _resources[materialId] = Math.max(0, Number(amount) || 0);
    save();
    return _resources[materialId];
  }

  // ---------- Material Info ----------
  function getMaterialInfo(materialId) {
    return MATERIAL_TYPES[materialId] || { name: materialId, desc: "Unknown material" };
  }

  function getAllMaterialTypes() {
    return { ...MATERIAL_TYPES };
  }

  // Initialize on load
  load();

  // Public API
  global.Resources = {
    get,
    getAll,
    has,
    canAfford,
    add,
    subtract,
    spend,
    set,
    getMaterialInfo,
    getAllMaterialTypes,
    MATERIAL_TYPES
  };

})(window);
