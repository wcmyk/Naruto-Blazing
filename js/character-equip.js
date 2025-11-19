// js/character-equip.js
// Character Ultimate Equipment System
// Manages equipping once-per-battle ultimate abilities to characters

(function (global) {
  "use strict";

  const STORAGE_KEY = "blazing_character_equip_v1";

  let _ultimates = {};
  let _equipData = {};
  let _loaded = false;

  // ---------- Load Ultimates from JSON ----------
  async function loadUltimatesJSON() {
    try {
      const response = await fetch('data/equip-ultimates.json');
      const data = await response.json();

      // Convert array to object keyed by ID
      _ultimates = {};
      data.ultimates.forEach(ult => {
        _ultimates[ult.id] = ult;
      });

      _loaded = true;
      console.log(`[CharacterEquip] Loaded ${data.ultimates.length} equip ultimates from JSON`);
      return true;
    } catch (err) {
      console.error("[CharacterEquip] Failed to load ultimates JSON:", err);
      _loaded = false;
      return false;
    }
  }

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
    if (!_ultimates[ultimateId]) {
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
    return _ultimates[ultimateId] || null;
  }

  function getAllUltimates() {
    return { ..._ultimates };
  }

  function isLoaded() {
    return _loaded;
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
  async function init() {
    await loadUltimatesJSON();
    loadEquipData();
  }

  // Auto-initialize
  init();

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
    isLoaded,
    loadUltimatesJSON
  };

})(window);
