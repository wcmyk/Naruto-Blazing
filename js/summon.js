// Main Summon System Initialization
(async function initSummoning() {
  console.log('🎴 Initializing Double Fibonacci Summon System...');

  let currentBannerIndex = 0;
  let allCharacters = [];
  let featuredCharacters = [];

  /**
   * Initialize all summon systems
   */
  async function initialize() {
    try {
      // Load summon data
      await summonData.init();

      // Load character pool
      const charsResponse = await fetch('data/characters.json');
      const charsData = await charsResponse.json();
      allCharacters = Object.values(charsData);

      // Initialize character selector with pools
      if (window.CharacterSelector) {
        window.CharacterSelector.updatePools(allCharacters, featuredCharacters);
      }

      // Initialize UI controllers
      if (window.SummonUI) {
        window.SummonUI.init();
      }

      if (window.SummonAnimator) {
        window.SummonAnimator.init();
      }

      // Load first banner
      loadBanner(0);

      // Setup additional UI events
      setupUIEvents();

      console.log('✅ Summon system initialized successfully');
      console.log(`📊 Loaded ${allCharacters.length} characters`);
      console.log(`🎯 Featured pool: ${featuredCharacters.length} characters`);

    } catch (error) {
      console.error('❌ Failed to initialize summon system:', error);
    }
  }

  /**
   * Load a specific banner
   */
  function loadBanner(index) {
    const banner = summonData.getBanner(index);
    if (!banner) {
      console.warn('Banner not found:', index);
      return;
    }

    currentBannerIndex = index;

    // Update featured characters
    featuredCharacters = [];
    if (banner.featured && banner.featured.length > 0) {
      featuredCharacters = banner.featured.map(id => {
        return allCharacters.find(c => c.id === id);
      }).filter(c => c !== undefined);
    }

    // Update character selector
    if (window.CharacterSelector) {
      window.CharacterSelector.updatePools(allCharacters, featuredCharacters);
    }

    // Update UI
    if (window.SummonUI) {
      window.SummonUI.updateBannerInfo(banner);
    }

    // Reset summon engine if switching banners
    if (window.FibonacciSummonEngine) {
      window.FibonacciSummonEngine.resetSession();
    }

    console.log(`📜 Loaded banner: ${banner.name}`);
    console.log(`🎯 Featured: ${featuredCharacters.length} units`);
  }

  /**
   * Setup additional UI event handlers
   */
  function setupUIEvents() {
    // Rates button
    const ratesBtn = document.getElementById('btn-rates');
    if (ratesBtn) {
      ratesBtn.addEventListener('click', () => {
        if (window.SummonUI) {
          window.SummonUI.showRatesInfo();
        }
      });
    }

    // Featured button
    const featuredBtn = document.getElementById('btn-featured');
    if (featuredBtn) {
      featuredBtn.addEventListener('click', () => {
        showFeaturedUnits();
      });
    }

    // Contents button
    const contentsBtn = document.getElementById('btn-contents');
    if (contentsBtn) {
      contentsBtn.addEventListener('click', () => {
        showSummonContents();
      });
    }
  }

  /**
   * Show featured units modal
   */
  function showFeaturedUnits() {
    if (featuredCharacters.length === 0) {
      alert('No featured units in this banner.');
      return;
    }

    const names = featuredCharacters.map(c => `• ${c.name} (${c.rarity}★)`).join('\n');
    alert(`Featured Units:\n\n${names}`);
  }

  /**
   * Show summon contents
   */
  function showSummonContents() {
    const rates = window.FibonacciSummonEngine?.getRatesDisplay();
    if (!rates) return;

    const message = `
Summon Contents
━━━━━━━━━━━━━━━━━━━

Current Rates:
• Multi Step: ${rates.multiStep}
• Gold Chance: ${rates.goldChance}
• Featured Chance: ${rates.featuredChance}

Total Characters Available: ${allCharacters.length}
Featured Characters: ${featuredCharacters.length}

Session Statistics:
${rates.totalGolds}
${rates.featuredGolds}
    `;

    alert(message);
  }

  // Start initialization
  initialize();

  // Export for debugging
  window.SummonSystem = {
    loadBanner,
    getCurrentBanner: () => summonData.getBanner(currentBannerIndex),
    getFeaturedUnits: () => featuredCharacters,
    getAllCharacters: () => allCharacters,
    getStats: () => window.FibonacciSummonEngine?.getStats(),
    resetEngine: () => window.FibonacciSummonEngine?.resetSession()
  };

})();
