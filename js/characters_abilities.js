// js/characters_abilities.js - Character Passive Ability Icon System
// Displays tier-based passive icons on the right side of character art

class CharacterAbilitiesSystem {
  constructor() {
    this.currentCharacter = null;
    this.currentTier = null;
    this.iconContainer = null;
    this.init();
  }

  init() {
    // Wait for character modal to be available
    this.waitForModal();
  }

  waitForModal() {
    const checkModal = setInterval(() => {
      const modal = document.getElementById('char-modal');
      if (modal) {
        clearInterval(checkModal);
        this.setupModalObserver();
      }
    }, 100);
  }

  setupModalObserver() {
    // Listen for modal open events
    const modal = document.getElementById('char-modal');
    const observer = new MutationObserver(() => {
      if (!modal.classList.contains('hidden')) {
        setTimeout(() => this.renderPassiveIcons(), 100);
      }
    });

    observer.observe(modal, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Also listen for tier changes (awakening)
    this.setupTierChangeListener();
  }

  setupTierChangeListener() {
    // Hook into the existing awakening system
    const originalRenderStatusTab = window.renderStatusTab;
    if (originalRenderStatusTab) {
      window.renderStatusTab = (uid) => {
        originalRenderStatusTab(uid);
        setTimeout(() => this.renderPassiveIcons(), 200);
      };
    }
  }

  renderPassiveIcons() {
    // Get the currently displayed character
    const modal = document.getElementById('char-modal');
    if (!modal || modal.classList.contains('hidden')) return;

    // Find character UID from modal
    const uid = this.getCurrentCharacterUID();
    if (!uid) return;

    // Get character data
    const character = this.getCharacterData(uid);
    if (!character) return;

    this.currentCharacter = character;
    this.currentTier = character.tierCode || character.starMinCode;

    // Get passive icons for current tier
    const icons = this.getPassiveIconsForTier();
    if (!icons || icons.length === 0) {
      this.removeIconContainer();
      return;
    }

    // Render the icons
    this.createIconContainer();
    this.populateIcons(icons);
  }

  getCurrentCharacterUID() {
    // Try to get UID from the modal's data attribute or current selection
    const modal = document.getElementById('char-modal');
    const uid = modal?.dataset?.currentUid;
    
    if (uid) return uid;

    // Fallback: get from currently selected character in grid
    const selected = document.querySelector('.char-card.selected');
    return selected?.dataset?.uid;
  }

  getCharacterData(uid) {
    // Access global inventory data
    if (!window.CharacterInventory) return null;
    
    const instances = window.CharacterInventory.getInstances();
    const instance = instances.find(i => i.uid === uid);
    
    if (!instance) return null;

    // Get base character data
    const baseChar = window.CharacterInventory.getCharacterById(instance.charId);
    
    return {
      ...instance,
      passiveIcons: baseChar?.passiveIcons,
      tierCode: instance.tierCode || baseChar?.starMinCode
    };
  }

  getPassiveIconsForTier() {
    if (!this.currentCharacter?.passiveIcons) return null;

    const tier = this.currentTier;
    const passiveIcons = this.currentCharacter.passiveIcons;

    // Try current tier first
    if (passiveIcons[tier]) {
      return passiveIcons[tier];
    }

    // Fallback to lowest tier
    const minTier = this.currentCharacter.starMinCode;
    return passiveIcons[minTier] || null;
  }

  createIconContainer() {
    // Remove existing container if present
    this.removeIconContainer();

    // Find the character art container
    const artContainer = document.querySelector('.char-modal-art');
    if (!artContainer) return;

    // Create icon container
    this.iconContainer = document.createElement('div');
    this.iconContainer.id = 'char-passive-icons';
    this.iconContainer.className = 'passive-icons-right';

    // Append to art container
    artContainer.appendChild(this.iconContainer);
  }

  populateIcons(icons) {
    if (!this.iconContainer) return;

    // Clear existing icons
    this.iconContainer.innerHTML = '';

    // Add each icon
    icons.forEach(iconId => {
      const iconElement = document.createElement('div');
      iconElement.className = 'passive-icon';

      const img = document.createElement('img');
      img.src = `assets/icons/passives/${iconId}.png`;
      img.alt = iconId;
      img.title = this.getIconTooltip(iconId);
      
      // Fallback to default icon on error
      img.onerror = () => {
        img.src = 'assets/icons/passives/default.png';
      };

      iconElement.appendChild(img);
      this.iconContainer.appendChild(iconElement);
    });
  }

  getIconTooltip(iconId) {
    // Convert icon ID to readable text
    const tooltips = {
      'atk_up': 'Attack Up',
      'def_up': 'Defense Up',
      'crit_up': 'Critical Rate Up',
      'heal_up': 'Healing Boost',
      'chakra_restore': 'Chakra Restore',
      'speed_up': 'Speed Up',
      'damage_reduction': 'Damage Reduction',
      'immobilize_resist': 'Immobilize Resistance',
      'slip_damage': 'Slip Damage',
      'field_heal': 'Field Healing',
      'buddy_heal': 'Buddy Healing',
      'counter': 'Counter Attack',
      'barrier': 'Barrier',
      'dodge': 'Dodge',
      'element_resist': 'Element Resistance'
    };

    return tooltips[iconId] || iconId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  removeIconContainer() {
    if (this.iconContainer) {
      this.iconContainer.remove();
      this.iconContainer = null;
    } else {
      const existing = document.getElementById('char-passive-icons');
      if (existing) existing.remove();
    }
  }
}

// Initialize the system when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.characterAbilities = new CharacterAbilitiesSystem();
  });
} else {
  window.characterAbilities = new CharacterAbilitiesSystem();
}
