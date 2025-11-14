// js/characters_abilities.js - DEBUG VERSION
console.log('🚀 [DEBUG] Script file loaded at:', new Date().toLocaleTimeString());

class CharacterAbilitiesSystem {
  constructor() {
    console.log('✅ [DEBUG] Constructor called');
    this.currentCharacter = null;
    this.currentTier = null;
    this.iconContainer = null;
    this.init();
  }

  init() {
    console.log('🔄 [DEBUG] Init called, waiting for modal...');
    
    // Check if modal already exists
    const modal = document.getElementById('char-modal');
    if (modal) {
      console.log('✅ [DEBUG] Modal found immediately');
      this.setupModalObserver();
    } else {
      console.log('⏳ [DEBUG] Modal not found, starting interval check...');
      this.waitForModal();
    }
  }

  waitForModal() {
    let attempts = 0;
    const checkModal = setInterval(() => {
      attempts++;
      console.log(`🔍 [DEBUG] Checking for modal... attempt ${attempts}`);
      
      const modal = document.getElementById('char-modal');
      if (modal) {
        console.log('✅ [DEBUG] Modal found after', attempts, 'attempts');
        clearInterval(checkModal);
        this.setupModalObserver();
      }
      
      if (attempts > 50) {
        console.error('❌ [DEBUG] Modal not found after 50 attempts, giving up');
        clearInterval(checkModal);
      }
    }, 100);
  }

  setupModalObserver() {
    console.log('🔧 [DEBUG] Setting up modal observer...');
    
    const modal = document.getElementById('char-modal');
    if (!modal) {
      console.error('❌ [DEBUG] Modal disappeared before observer setup');
      return;
    }

    const observer = new MutationObserver((mutations) => {
      console.log('👁️ [DEBUG] Modal class changed');
      
      if (!modal.classList.contains('hidden')) {
        console.log('🎯 [DEBUG] Modal is now visible, will render icons in 100ms');
        setTimeout(() => {
          console.log('🎨 [DEBUG] Timeout complete, calling renderPassiveIcons()');
          this.renderPassiveIcons();
        }, 100);
      } else {
        console.log('🙈 [DEBUG] Modal is now hidden');
      }
    });

    observer.observe(modal, {
      attributes: true,
      attributeFilter: ['class']
    });

    console.log('✅ [DEBUG] Modal observer active');
  }

  renderPassiveIcons() {
    console.log('═══════════════════════════════════════');
    console.log('🎨 [DEBUG] renderPassiveIcons() START');
    console.log('═══════════════════════════════════════');
    
    // Test: Create a simple red box
    const testBox = document.createElement('div');
    testBox.style.cssText = `
      position: fixed;
      top: 50%;
      right: 20px;
      width: 50px;
      height: 50px;
      background: red;
      z-index: 9999;
      border: 2px solid white;
    `;
    testBox.textContent = 'TEST';
    document.body.appendChild(testBox);
    console.log('🔴 [DEBUG] Red test box added to body');

    // Find art container
    const artContainer = document.querySelector('.char-modal-art');
    console.log('🎭 [DEBUG] Art container:', artContainer);
    
    if (!artContainer) {
      console.error('❌ [DEBUG] .char-modal-art not found!');
      return;
    }

    // Create icon container
    this.iconContainer = document.createElement('div');
    this.iconContainer.id = 'char-passive-icons';
    this.iconContainer.className = 'passive-icons-right';
    this.iconContainer.style.cssText = `
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      background: lime;
      padding: 10px;
      z-index: 100;
    `;
    
    this.iconContainer.textContent = 'ICONS HERE';
    
    artContainer.appendChild(this.iconContainer);
    console.log('🟢 [DEBUG] Green icon container added to art container');
    
    // Test icon
    const testIcon = document.createElement('div');
    testIcon.style.cssText = `
      width: 48px;
      height: 48px;
      background: blue;
      border: 2px solid yellow;
      margin: 5px;
    `;
    testIcon.textContent = 'ICON';
    this.iconContainer.appendChild(testIcon);
    console.log('🔵 [DEBUG] Blue test icon added');
    
    console.log('═══════════════════════════════════════');
    console.log('🎨 [DEBUG] renderPassiveIcons() END');
    console.log('═══════════════════════════════════════');
  }
}

// Initialize
console.log('🚀 [DEBUG] About to initialize system...');
console.log('🚀 [DEBUG] document.readyState:', document.readyState);

if (document.readyState === 'loading') {
  console.log('⏳ [DEBUG] Waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ [DEBUG] DOMContentLoaded fired');
    window.characterAbilities = new CharacterAbilitiesSystem();
  });
} else {
  console.log('✅ [DEBUG] DOM already loaded, initializing immediately');
  window.characterAbilities = new CharacterAbilitiesSystem();
}

console.log('🏁 [DEBUG] Script execution complete');
