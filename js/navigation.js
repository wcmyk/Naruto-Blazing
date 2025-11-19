// js/navigation.js - Shared navigation functionality for bottom bar
console.log('🧭 Navigation.js loading...');

(() => {
  "use strict";

  console.log('🧭 Navigation IIFE executing...');

  // Navigation function with fade transition
  function navigateTo(url) {
    console.log(`🚀 Navigating to: ${url}`);
    document.body.style.transition = "opacity 0.2s linear";
    document.body.style.opacity = "0";

    setTimeout(() => {
      window.location.href = fullUrl;
    }, 200);
  }

  // Initialize navigation when DOM is ready
  document.addEventListener("DOMContentLoaded", () => {
    console.log('🧭 Navigation DOMContentLoaded fired!');

    // Village button
    const btnVillage = document.getElementById("btn-village");
    console.log('btn-village found:', !!btnVillage);
    if (btnVillage) {
      btnVillage.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("🏠 Village clicked");
        navigateTo("index.html");
      });
    }

    // Characters button
    const btnCharacters = document.getElementById("btn-characters");
    console.log('btn-characters found:', !!btnCharacters);
    if (btnCharacters) {
      btnCharacters.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("👤 Characters clicked");
        navigateTo("characters.html");
      });
    }

    // Fusion button
    const btnFusion = document.getElementById("btn-fusion");
    console.log('btn-fusion found:', !!btnFusion);
    if (btnFusion) {
      btnFusion.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("⚡ Fusion clicked");
        navigateTo("fusion.html");
      });
    }

    // Teams button
    const btnTeams = document.getElementById("btn-teams");
    console.log('btn-teams found:', !!btnTeams);
    if (btnTeams) {
      btnTeams.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("👥 Teams clicked");
        navigateTo("teams.html");
      });
    }
  }

    // Summon button
    const btnSummon = document.getElementById("btn-summon");
    console.log('btn-summon found:', !!btnSummon);
    if (btnSummon) {
      btnSummon.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("🔮 Summon clicked");
        navigateTo("summon.html");
      });
    }

    // Missions button
    const btnMissions = document.getElementById("btn-missions");
    console.log('btn-missions found:', !!btnMissions);
    if (btnMissions) {
      btnMissions.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("📜 Missions clicked");
        navigateTo("missions.html");
      });
    }

    // Inventory button
    const btnInventory = document.getElementById("btn-inventory");
    console.log('btn-inventory found:', !!btnInventory);
    if (btnInventory) {
      btnInventory.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("📦 Inventory clicked");
        navigateTo('inventory.html');
      });
    }

    // Shop button
    const btnShop = document.getElementById("btn-shop");
    console.log('btn-shop found:', !!btnShop);
    if (btnShop) {
      btnShop.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("🛒 Shop clicked");
        navigateTo("shop.html");
      });
    }
  }

  // ---------- Summon Banner Carousel Navigation ----------
  async function initSummonBanners() {
    const carousel = document.querySelector('.summon-banner-carousel');
    if (!carousel) return;

    try {
      // Load summon banners data
      const response = await fetch('data/summons.json');
      const summonsData = await response.json();

      // Clear carousel
      carousel.innerHTML = '';

      // Create banner cards
      summonsData.banners.forEach(banner => {
        const card = document.createElement('div');
        card.className = 'summon-banner-card';
        card.dataset.bannerId = banner.id;

        // Add title
        const title = document.createElement('div');
        title.className = 'summon-banner-title';
        title.textContent = banner.name;
        card.appendChild(title);

        // Add subtitle (if exists)
        if (banner.subtitle) {
          const subtitle = document.createElement('div');
          subtitle.className = 'summon-banner-subtitle';
          subtitle.textContent = banner.subtitle;
          card.appendChild(subtitle);
        }

        // Click handler - navigate to summon.html with banner ID
        card.addEventListener('click', () => {
          console.log(`🔮 Summon banner clicked: ${banner.name}`);
          navigateTo('summon.html', { banner: banner.id });
        });

        carousel.appendChild(card);
      });

      console.log(`✅ Loaded ${summonsData.banners.length} summon banners`);
    } catch (err) {
      console.error("[Navigation] Failed to load summon banners:", err);
    }
  }

  // ---------- Settings Menu ----------
  function openSettingsMenu() {
    const choice = prompt(
      "Settings Menu:\n" +
      "1. Change Username\n" +
      "2. Change Background (1-10)\n" +
      "3. View Resources\n" +
      "4. Select Character Display\n" +
      "5. Cancel\n\n" +
      "Enter your choice:"
    );

    if (choice === "1") {
      if (typeof window.Username !== "undefined") {
        window.Username.openEditor();
      } else {
        alert("Username system not loaded. Please reload the page.");
      }
    } else if (choice === "2") {
      const bgNum = prompt("Enter background number (1-10):");
      const num = parseInt(bgNum);
      if (num >= 1 && num <= 10) {
        changeBackground(num);
      } else {
        alert("Invalid background number. Please enter 1-10.");
      }
    } else if (choice === "3") {
      navigateTo("resources.html");
    } else if (choice === "4") {
      if (typeof window.CharacterVignette !== "undefined") {
        window.CharacterVignette.openCharacterSelector();
      } else {
        alert("Character Vignette system not loaded. Please reload the page.");
      }
    }
  }

  // ---------- Background Changer ----------
  function changeBackground(num) {
    const el = document.getElementById("full-bg");
    if (!el) return;

    for (let i = 1; i <= 10; i++) {
      el.classList.remove(`bg-${i}`);
    }
    el.classList.add(`bg-${num}`);
    console.log(`🎨 Background changed to bg-${num}`);
  }

  // ---------- Username Click Handler ----------
  function initUsernameClick() {
    const usernameElement = document.getElementById('player-username');
    if (usernameElement) {
      usernameElement.addEventListener('click', () => {
        if (typeof window.Username !== "undefined") {
          window.Username.openEditor();
        }
      });
    }
  }

  // ---------- Initialization ----------
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initBannerButtons();
        initBottomIcons();
        initSummonBanners();
        initUsernameClick();
        console.log("✅ Navigation system initialized");
      });
    } else {
      initBannerButtons();
      initBottomIcons();
      initSummonBanners();
      initUsernameClick();
      console.log("✅ Navigation system initialized");
    }
  }

  // Auto-initialize
  init();

  // Public API
  global.Navigation = {
    navigateTo,
    openSettingsMenu,
    changeBackground
  };

    console.log("✅ Navigation listeners attached to all found buttons!");
  });
})();
