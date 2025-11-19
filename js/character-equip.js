// js/character-equip.js
// Character Ultimate Equipment System
// Manages equipping once-per-battle ultimate abilities to characters

(function (global) {
  "use strict";

  const STORAGE_KEY = "blazing_character_equip_v1";

  // Ultimate Abilities Database
  const ULTIMATES = {
    "rasengan_ultimate": {
      id: "rasengan_ultimate",
      name: "Massive Rasengan",
      description: "Unleash a massive chakra sphere that deals 500% ATK damage to all enemies and ignores 50% of their defense.",
      icon: "💥",
      chakraCost: 10,
      power: 500,
      target: "all_enemies",
      effects: ["ignore_defense_50", "stun_20_percent"]
    },
    "chidori_ultimate": {
      id: "chidori_ultimate",
      name: "Lightning Blade",
      description: "Channel lightning through your hand for a devastating strike dealing 600% ATK damage with guaranteed critical hit.",
      icon: "⚡",
      chakraCost: 10,
      power: 600,
      target: "single_enemy",
      effects: ["guaranteed_crit", "pierce"]
    },
    "sharingan_ultimate": {
      id: "sharingan_ultimate",
      name: "Mangekyō Sharingan",
      description: "Activate Mangekyō Sharingan to buff all allies with +100% ATK and +50% Speed for 3 turns.",
      icon: "👁️",
      chakraCost: 12,
      power: 0,
      target: "all_allies",
      effects: ["atk_buff_100_3turns", "speed_buff_50_3turns"]
    },
    "sage_mode_ultimate": {
      id: "sage_mode_ultimate",
      name: "Sage Mode Activation",
      description: "Enter Sage Mode, healing all allies for 30% HP and granting immunity to debuffs for 2 turns.",
      icon: "🟠",
      chakraCost: 15,
      power: 0,
      target: "all_allies",
      effects: ["heal_30_percent", "debuff_immunity_2turns"]
    },
    "shadow_clone_ultimate": {
      id: "shadow_clone_ultimate",
      name: "Multi Shadow Clone Jutsu",
      description: "Create shadow clones to attack all enemies 5 times dealing 200% ATK damage each hit.",
      icon: "👥",
      chakraCost: 12,
      power: 200,
      target: "all_enemies",
      effects: ["multi_hit_5", "confusion_chance_30"]
    },
    "fire_style_ultimate": {
      id: "fire_style_ultimate",
      name: "Great Fire Annihilation",
      description: "Unleash massive flames dealing 450% ATK damage to all enemies and inflicting burn for 3 turns.",
      icon: "🔥",
      chakraCost: 11,
      power: 450,
      target: "all_enemies",
      effects: ["burn_3turns", "reduce_defense_30_3turns"]
    },
    "byakugan_ultimate": {
      id: "byakugan_ultimate",
      name: "Eight Trigrams Sixty-Four Palms",
      description: "Precise chakra point strikes dealing 550% ATK damage and sealing the target's ninjutsu for 2 turns.",
      icon: "👁️‍🗨️",
      chakraCost: 13,
      power: 550,
      target: "single_enemy",
      effects: ["ninjutsu_seal_2turns", "chakra_drain_50_percent"]
    },
    "healing_ultimate": {
      id: "healing_ultimate",
      name: "Mystical Palm Technique",
      description: "Advanced medical ninjutsu that heals all allies for 50% HP and removes all debuffs.",
      icon: "💚",
      chakraCost: 14,
      power: 0,
      target: "all_allies",
      effects: ["heal_50_percent", "remove_all_debuffs", "regen_3turns"]
    }
  };

  let _equipData = {};

  // ---------- Persistence ----------
  function loadEquipData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const data = JSON.parse(raw);
      _equipData = (data && typeof data === 'object') ? data : {};
    } catch {
      _equipData = {};
    }
  }

  function saveEquipData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_equipData));
    } catch (err) {
      console.error("[CharacterEquip] Failed to save:", err);
    }
  }

  // ---------- Equip API ----------
  function getEquippedUltimate(characterId) {
    return _equipData[characterId] || null;
  }

  function equipUltimate(characterId, ultimateId) {
    if (!ULTIMATES[ultimateId]) {
      console.error(`[CharacterEquip] Unknown ultimate: ${ultimateId}`);
      return false;
    }

    _equipData[characterId] = ultimateId;
    saveEquipData();
    console.log(`[CharacterEquip] Equipped ${ultimateId} to ${characterId}`);
    return true;
  }

  function unequipUltimate(characterId) {
    delete _equipData[characterId];
    saveEquipData();
    console.log(`[CharacterEquip] Unequipped ultimate from ${characterId}`);
    return true;
  }

  function getUltimateData(ultimateId) {
    return ULTIMATES[ultimateId] || null;
  }

  function getAllUltimates() {
    return { ...ULTIMATES };
  }

  // ---------- UI Update Functions ----------
  function updateEquipUI(characterId) {
    const equippedId = getEquippedUltimate(characterId);
    const equipSlot = document.getElementById('equip-slot');
    const equipInfo = document.getElementById('equip-info');

    if (!equipSlot || !equipInfo) return;

    if (equippedId) {
      const ultimate = getUltimateData(equippedId);
      if (ultimate) {
        // Hide empty slot, show equipped info
        equipSlot.style.display = 'none';
        equipInfo.style.display = 'block';

        // Update ultimate details
        document.getElementById('ultimate-icon').textContent = ultimate.icon;
        document.getElementById('ultimate-name').textContent = ultimate.name;
        document.getElementById('ultimate-description').textContent = ultimate.description;
        document.getElementById('ultimate-cost').textContent = `${ultimate.chakraCost} Chakra`;
      }
    } else {
      // Show empty slot, hide equipped info
      equipSlot.style.display = 'flex';
      equipInfo.style.display = 'none';
    }
  }

  function openUltimateSelector(characterId) {
    const ultimatesList = Object.values(ULTIMATES);

    let message = "Select an Ultimate to Equip:\n\n";
    ultimatesList.forEach((ult, idx) => {
      message += `${idx + 1}. ${ult.icon} ${ult.name}\n`;
      message += `   Cost: ${ult.chakraCost} Chakra | Power: ${ult.power}%\n`;
      message += `   ${ult.description.substring(0, 60)}...\n\n`;
    });
    message += `${ultimatesList.length + 1}. Cancel\n\nEnter number:`;

    const choice = prompt(message);
    const num = parseInt(choice);

    if (num >= 1 && num <= ultimatesList.length) {
      const selected = ultimatesList[num - 1];
      if (equipUltimate(characterId, selected.id)) {
        updateEquipUI(characterId);
        alert(`✅ Equipped ${selected.icon} ${selected.name}!`);
      }
    }
  }

  // ---------- Initialize Tab Listeners ----------
  function initEquipTab(characterId) {
    const btnSelect = document.getElementById('btn-select-ultimate');
    const btnUnequip = document.getElementById('btn-unequip-ultimate');

    if (btnSelect) {
      btnSelect.addEventListener('click', () => {
        openUltimateSelector(characterId);
      });
    }

    if (btnUnequip) {
      btnUnequip.addEventListener('click', () => {
        if (confirm('Are you sure you want to unequip this ultimate?')) {
          unequipUltimate(characterId);
          updateEquipUI(characterId);
          alert('Ultimate unequipped successfully');
        }
      });
    }

    // Initial UI update
    updateEquipUI(characterId);
  }

  // Initialize on load
  loadEquipData();

  // Public API
  global.CharacterEquip = {
    getEquippedUltimate,
    equipUltimate,
    unequipUltimate,
    getUltimateData,
    getAllUltimates,
    updateEquipUI,
    openUltimateSelector,
    initEquipTab,
    ULTIMATES
  };

})(window);
