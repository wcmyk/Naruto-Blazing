// js/resources.js
// Materials and Resources Inventory System
// Manages awakening materials, limit break materials, and other consumable items

(function (global) {
  "use strict";

  const STORAGE_KEY = "blazing_resources_v1";

  // Material types and their default quantities
  const MATERIAL_TYPES = {
    // Awakening materials (tier-specific)
    "awakening_stone_3": { name: "3★ Awakening Stone", desc: "Used to awaken 3★ characters", icon: "assets/items/scroll_3star.png", category: "awakening" },
    "awakening_stone_4": { name: "4★ Awakening Stone", desc: "Used to awaken 4★ characters", icon: "assets/items/scroll_4star.png", category: "awakening" },
    "awakening_stone_5": { name: "5★ Awakening Stone", desc: "Used to awaken 5★ characters", icon: "assets/items/scroll_5star.png", category: "awakening" },
    "awakening_stone_6": { name: "6★ Awakening Stone", desc: "Used to awaken 6★ characters", icon: "assets/items/scroll_6star.png", category: "awakening" },
    "awakening_stone_7": { name: "7★ Awakening Stone", desc: "Used to awaken 7★ characters", icon: "assets/items/scroll_7star.png", category: "awakening" },
    "awakening_stone_8": { name: "8★ Awakening Stone", desc: "Used to awaken 8★ characters", icon: "assets/items/scroll_8star.png", category: "awakening" },
    "awakening_stone_9": { name: "9★ Awakening Stone", desc: "Used to awaken 9★ characters", icon: "assets/items/scroll_9star.png", category: "awakening" },

    // Limit break materials
    "limit_break_crystal": { name: "Limit Break Crystal", desc: "Breaks level limits for max-tier characters", icon: "assets/items/lb_crystal.png", category: "scrolls" },
    "dupe_crystal": { name: "Dupe Crystal", desc: "Obtained from duplicate characters", icon: "assets/items/dupe_crystal.png", category: "scrolls" },

    // Element-specific scrolls
    "scroll_body": { name: "Body Scroll", desc: "Body element awakening material", icon: "assets/items/scroll_body.png", category: "scrolls" },
    "scroll_skill": { name: "Skill Scroll", desc: "Skill element awakening material", icon: "assets/items/scroll_skill.png", category: "scrolls" },
    "scroll_bravery": { name: "Bravery Scroll", desc: "Bravery element awakening material", icon: "assets/items/scroll_bravery.png", category: "scrolls" },
    "scroll_wisdom": { name: "Wisdom Scroll", desc: "Wisdom element awakening material", icon: "assets/items/scroll_wisdom.png", category: "scrolls" },
    "scroll_heart": { name: "Heart Scroll", desc: "Heart element awakening material", icon: "assets/items/scroll_heart.png", category: "scrolls" },
    "scroll_basic": { name: "Basic Scroll", desc: "Common awakening material", icon: "assets/icons/materials/scroll_basic.png", category: "scrolls" },
    "scroll_advanced": { name: "Advanced Scroll", desc: "Rare awakening material", icon: "assets/icons/materials/scroll_advanced.png", category: "scrolls" },

    // Character-specific materials
    "character_stone": { name: "Character Stone", desc: "Character-specific awakening material", icon: "assets/items/character_stone.png", category: "awakening" },

    // Elemental Crystals
    "crystal_fire": { name: "Fire Crystal", desc: "Fire-attribute awakening material", icon: "assets/items/crystal_fire.png", category: "awakening" },
    "crystal_water": { name: "Water Crystal", desc: "Water-attribute awakening material", icon: "assets/items/crystal_water.png", category: "awakening" },
    "crystal_earth": { name: "Earth Crystal", desc: "Earth-attribute awakening material", icon: "assets/items/crystal_earth.png", category: "awakening" },
    "crystal_wind": { name: "Wind Crystal", desc: "Wind-attribute awakening material", icon: "assets/items/crystal_wind.png", category: "awakening" },
    "crystal_lightning": { name: "Lightning Crystal", desc: "Lightning-attribute awakening material", icon: "assets/items/crystal_lightning.png", category: "awakening" },

    // Ramen (EXP Items)
    "ramen_1star": { name: "1★ Ramen", desc: "Provides 500 EXP. Best for low-level characters.", icon: "assets/items/ramen_1star.png", category: "ramen", exp: 500 },
    "ramen_2star": { name: "2★ Ramen", desc: "Provides 1,500 EXP. Good for mid-level characters.", icon: "assets/items/ramen_2star.png", category: "ramen", exp: 1500 },
    "ramen_3star": { name: "3★ Ramen", desc: "Provides 5,000 EXP. Great for high-level characters.", icon: "assets/items/ramen_3star.png", category: "ramen", exp: 5000 },
    "ramen_4star": { name: "4★ Ramen", desc: "Provides 15,000 EXP. Excellent for max-level characters.", icon: "assets/items/ramen_4star.png", category: "ramen", exp: 15000 },
    "ramen_5star": { name: "5★ Ramen", desc: "Provides 50,000 EXP. The ultimate experience boost.", icon: "assets/items/ramen_5star.png", category: "ramen", exp: 50000 },

    // Pills (Stat Enhancement)
    "pill_hp": { name: "HP Pill", desc: "Increases HP stat permanently by 100.", icon: "assets/items/pill_hp.png", category: "enhancement", statBoost: { hp: 100 } },
    "pill_atk": { name: "ATK Pill", desc: "Increases ATK stat permanently by 50.", icon: "assets/items/pill_atk.png", category: "enhancement", statBoost: { atk: 50 } },
    "pill_def": { name: "DEF Pill", desc: "Increases DEF stat permanently by 50.", icon: "assets/items/pill_def.png", category: "enhancement", statBoost: { def: 50 } },
    "pill_speed": { name: "Speed Pill", desc: "Increases Speed stat permanently by 25.", icon: "assets/items/pill_speed.png", category: "enhancement", statBoost: { speed: 25 } },

    // Special Items
    "acquisition_stone": { name: "Acquisition Stone", desc: "Can be exchanged for specific characters in the shop.", icon: "assets/items/acq_stone.png", category: "scrolls" },
    "granny_coin": { name: "Granny Cat Coin", desc: "Special currency for Granny Cat Shop.", icon: "assets/items/granny_coin.png", category: "scrolls" },

    // Currencies
    "ryo": { name: "Ryo", desc: "Standard currency for various operations", icon: "assets/items/ryo.png", category: "currency" },
    "ninja_pearls": { name: "Ninja Pearls", desc: "Premium currency for summons and special items", icon: "assets/items/pearls.png", category: "currency" },
    "shinobites": { name: "Shinobites", desc: "Gacha currency for character summons", icon: "assets/items/shinobites.png", category: "currency" }
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
        "crystal_fire": 10,
        "crystal_water": 8,
        "crystal_earth": 8,
        "crystal_wind": 8,
        "crystal_lightning": 8,
        "ramen_1star": 25,
        "ramen_2star": 15,
        "ramen_3star": 8,
        "ramen_4star": 3,
        "ramen_5star": 1,
        "pill_hp": 5,
        "pill_atk": 3,
        "pill_def": 3,
        "pill_speed": 3,
        "acquisition_stone": 2,
        "granny_coin": 10,
        "ryo": 0,
        "ninja_pearls": 0,
        "shinobites": 0
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
    notifyTopBar(materialId);
    return _resources[materialId];
  }

  function subtract(materialId, amount = 1) {
    const current = get(materialId);
    const newAmount = Math.max(0, current - (Number(amount) || 0));
    _resources[materialId] = newAmount;
    save();
    notifyTopBar(materialId);
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
    notifyTopBar(materialId);
    return _resources[materialId];
  }

  // ---------- TopBar Integration ----------
  function notifyTopBar(materialId) {
    // Auto-refresh TopBar when currencies change
    if (['ryo', 'ninja_pearls', 'shinobites'].includes(materialId)) {
      if (global.TopBar && typeof global.TopBar.refresh === 'function') {
        global.TopBar.refresh();
      }
    }
  }

  // ---------- Material Info ----------
  function getMaterialInfo(materialId) {
    return MATERIAL_TYPES[materialId] || { name: materialId, desc: "Unknown material" };
  }

  function getAllMaterialTypes() {
    return { ...MATERIAL_TYPES };
  }

  function getItemsByCategory(category) {
    const items = [];
    for (const [id, info] of Object.entries(MATERIAL_TYPES)) {
      if (info.category === category) {
        items.push({
          id,
          name: info.name,
          icon: info.icon || 'assets/items/placeholder.png',
          description: info.desc,
          quantity: get(id),
          ...info
        });
      }
    }
    return items;
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
    getItemsByCategory,
    MATERIAL_TYPES
  };

})(window);
