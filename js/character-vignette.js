// js/character-vignette.js
// Character Vignette Display System
// Displays selected character on the main village screen with animations

(function (global) {
  "use strict";

  const SETTINGS_KEY = "blazing_vignette_settings_v1";
  const WIND_PARTICLE_COUNT = 25;

  let _settings = {
    selectedCharacterId: null,
    showVignette: true,
    windEnabled: true
  };

  // ---------- Persistence ----------
  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      const data = JSON.parse(raw);
      if (data && typeof data === 'object') {
        _settings = { ..._settings, ...data };
      }
    } catch (err) {
      console.log("[CharacterVignette] Using default settings");
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(_settings));
    } catch (err) {
      console.error("[CharacterVignette] Failed to save settings:", err);
    }
  }

  // ---------- Settings API ----------
  function getSelectedCharacter() {
    return _settings.selectedCharacterId;
  }

  function setSelectedCharacter(characterId) {
    _settings.selectedCharacterId = characterId;
    saveSettings();
    console.log(`[CharacterVignette] Selected character: ${characterId}`);
  }

  function isVignetteEnabled() {
    return _settings.showVignette;
  }

  function setVignetteEnabled(enabled) {
    _settings.showVignette = enabled;
    saveSettings();
  }

  function isWindEnabled() {
    return _settings.windEnabled;
  }

  function setWindEnabled(enabled) {
    _settings.windEnabled = enabled;
    saveSettings();
  }

  // ---------- Character Display ----------
  async function displayCharacter() {
    const container = document.querySelector('.character-vignette-container');
    if (!container) {
      console.warn("[CharacterVignette] Container not found");
      return;
    }

    // Clear existing characters
    container.innerHTML = '';

    // Check if vignette is enabled
    if (!_settings.showVignette) {
      return;
    }

    const characterId = _settings.selectedCharacterId;
    if (!characterId) {
      console.log("[CharacterVignette] No character selected");
      return;
    }

    // Fetch character data
    try {
      const response = await fetch('data/characters.json');
      const characters = await response.json();
      const character = characters.find(c => c.id === characterId);

      if (!character) {
        console.warn(`[CharacterVignette] Character not found: ${characterId}`);
        return;
      }

      // Check user's inventory to get the awakened tier
      let imageUrl = character.full;

      if (typeof window.CharacterInventory !== 'undefined') {
        const ownedChar = window.CharacterInventory.getCharacter(characterId);
        if (ownedChar && ownedChar.currentTier) {
          // Get the appropriate art for the tier
          const tierCode = ownedChar.currentTier;
          if (character.artByTier && character.artByTier[tierCode]) {
            imageUrl = character.artByTier[tierCode].full;
          }
        }
      }

      // Create character element
      const charDiv = document.createElement('div');
      charDiv.className = 'vignette-character';

      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = character.name;
      img.onerror = () => {
        console.warn(`[CharacterVignette] Failed to load image: ${imageUrl}`);
        // Fallback to base tier if awakened tier fails
        img.src = character.full;
      };

      charDiv.appendChild(img);
      container.appendChild(charDiv);

      console.log(`[CharacterVignette] Displaying ${character.name}`);
    } catch (err) {
      console.error("[CharacterVignette] Error loading character:", err);
    }
  }

  // ---------- Wind Animation System ----------
  function createWindParticles() {
    if (!_settings.windEnabled) {
      return;
    }

    const windContainer = document.querySelector('.wind-container');
    if (!windContainer) {
      console.warn("[CharacterVignette] Wind container not found");
      return;
    }

    // Clear existing particles
    windContainer.innerHTML = '';

    for (let i = 0; i < WIND_PARTICLE_COUNT; i++) {
      const particle = document.createElement('div');

      // Randomize particle types
      const rand = Math.random();
      if (rand < 0.3) {
        particle.className = 'wind-particle leaf';
      } else if (rand < 0.6) {
        particle.className = 'wind-particle streak';
      } else {
        particle.className = 'wind-particle';
      }

      // Randomize starting position
      particle.style.left = Math.random() * 100 + 'vw';
      particle.style.top = Math.random() * 100 + 'vh';

      // Randomize animation duration (faster/slower wind)
      const duration = 8 + Math.random() * 8; // 8-16 seconds
      particle.style.animationDuration = duration + 's';

      // Randomize animation delay (stagger particles)
      particle.style.animationDelay = Math.random() * 5 + 's';

      // Randomize opacity
      particle.style.opacity = 0.3 + Math.random() * 0.5;

      windContainer.appendChild(particle);
    }

    console.log(`[CharacterVignette] Created ${WIND_PARTICLE_COUNT} wind particles`);
  }

  // ---------- Initialization ----------
  function init() {
    loadSettings();

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        displayCharacter();
        createWindParticles();
      });
    } else {
      displayCharacter();
      createWindParticles();
    }
  }

  // ---------- Character Selection Dialog ----------
  async function openCharacterSelector() {
    try {
      const response = await fetch('data/characters.json');
      const characters = await response.json();

      // Filter to only owned characters if inventory is available
      let availableCharacters = characters;
      if (typeof window.CharacterInventory !== 'undefined') {
        const ownedIds = window.CharacterInventory.getAllCharacterIds();
        availableCharacters = characters.filter(c => ownedIds.includes(c.id));
      }

      if (availableCharacters.length === 0) {
        alert("You don't have any characters yet! Summon or add a character first.");
        return;
      }

      // Create selection prompt
      let message = "Select a character for your village display:\n\n";
      availableCharacters.forEach((char, idx) => {
        message += `${idx + 1}. ${char.name} (${char.version})\n`;
      });
      message += `\n${availableCharacters.length + 1}. None (disable display)\n`;
      message += "\nEnter number:";

      const choice = prompt(message);
      const num = parseInt(choice);

      if (num >= 1 && num <= availableCharacters.length) {
        const selected = availableCharacters[num - 1];
        setSelectedCharacter(selected.id);
        displayCharacter();
        alert(`✅ Now displaying: ${selected.name}!`);
      } else if (num === availableCharacters.length + 1) {
        setSelectedCharacter(null);
        displayCharacter();
        alert("Character display disabled.");
      } else {
        alert("Invalid selection.");
      }
    } catch (err) {
      console.error("[CharacterVignette] Error in character selector:", err);
      alert("Failed to load characters. Please try again.");
    }
  }

  // Initialize on load
  init();

  // Public API
  global.CharacterVignette = {
    getSelectedCharacter,
    setSelectedCharacter,
    isVignetteEnabled,
    setVignetteEnabled,
    isWindEnabled,
    setWindEnabled,
    displayCharacter,
    createWindParticles,
    openCharacterSelector,
    refresh: displayCharacter
  };

})(window);
