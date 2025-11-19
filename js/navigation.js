// js/navigation.js
// Navigation System for Banner Buttons, Bottom Icons, and Summon Banners
// Handles all page navigation and deep linking

(function (global) {
  "use strict";

  // ---------- Navigation Function ----------
  function navigateTo(url, params = {}) {
    console.log(`🚀 Navigating to: ${url}`, params);

    // Add query parameters if provided
    let fullUrl = url;
    if (Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(params).toString();
      fullUrl = `${url}?${queryString}`;
    }

    // Fade out transition
    document.body.style.transition = "opacity 0.2s linear";
    document.body.style.opacity = "0";

    setTimeout(() => {
      window.location.href = fullUrl;
    }, 200);
  }

  // ---------- Banner Button Navigation ----------
  function initBannerButtons() {
    // Missions
    const btnMissions = document.querySelector('.banner-button.missions');
    if (btnMissions) {
      btnMissions.addEventListener('click', () => {
        console.log("📜 Missions banner clicked");
        navigateTo('missions.html');
      });
    }

    // Characters
    const btnCharacters = document.querySelector('.banner-button.characters');
    if (btnCharacters) {
      btnCharacters.addEventListener('click', () => {
        console.log("👤 Characters banner clicked");
        navigateTo('characters.html');
      });
    }

    // Summon
    const btnSummon = document.querySelector('.banner-button.summon');
    if (btnSummon) {
      btnSummon.addEventListener('click', () => {
        console.log("🔮 Summon banner clicked");
        navigateTo('summon.html');
      });
    }

    // Fusion
    const btnFusion = document.querySelector('.banner-button.fusion');
    if (btnFusion) {
      btnFusion.addEventListener('click', () => {
        console.log("⚡ Fusion banner clicked");
        navigateTo('fusion.html');
      });
    }

    // Shop
    const btnShop = document.querySelector('.banner-button.shop');
    if (btnShop) {
      btnShop.addEventListener('click', () => {
        console.log("🛒 Shop banner clicked");
        navigateTo('shop.html');
      });
    }
  }

  // ---------- Bottom Icon Navigation ----------
  function initBottomIcons() {
    // Notice
    const iconNotice = document.querySelector('.bottom-icon[data-action="notice"]');
    if (iconNotice) {
      iconNotice.addEventListener('click', () => {
        console.log("🔔 Notice clicked");
        alert("Notice System\n\nNo new notices at this time.");
      });
    }

    // Present Box
    const iconPresents = document.querySelector('.bottom-icon[data-action="presents"]');
    if (iconPresents) {
      iconPresents.addEventListener('click', () => {
        console.log("🎁 Present Box clicked");
        alert("Present Box\n\nNo presents available.");
      });
    }

    // Achievements
    const iconAchievements = document.querySelector('.bottom-icon[data-action="achievements"]');
    if (iconAchievements) {
      iconAchievements.addEventListener('click', () => {
        console.log("🏆 Achievements clicked");
        alert("Achievements\n\nComing soon!");
      });
    }

    // Panel Missions
    const iconPanelMissions = document.querySelector('.bottom-icon[data-action="panel-missions"]');
    if (iconPanelMissions) {
      iconPanelMissions.addEventListener('click', () => {
        console.log("📋 Panel Missions clicked");
        navigateTo('missions.html');
      });
    }

    // Chat
    const iconChat = document.querySelector('.bottom-icon[data-action="chat"]');
    if (iconChat) {
      iconChat.addEventListener('click', () => {
        console.log("💬 Chat clicked");
        alert("Chat System\n\nComing soon!");
      });
    }

    // Inventory (Storage)
    const iconInventory = document.querySelector('.bottom-icon[data-action="inventory"]');
    if (iconInventory) {
      iconInventory.addEventListener('click', () => {
        console.log("📦 Inventory clicked");
        navigateTo('inventory.html');
      });
    }

    // Teams
    const iconTeams = document.querySelector('.bottom-icon[data-action="teams"]');
    if (iconTeams) {
      iconTeams.addEventListener('click', () => {
        console.log("👥 Teams clicked");
        navigateTo('teams.html');
      });
    }

    // Resources
    const iconResources = document.querySelector('.bottom-icon[data-action="resources"]');
    if (iconResources) {
      iconResources.addEventListener('click', () => {
        console.log("💎 Resources clicked");
        navigateTo('resources.html');
      });
    }

    // Guilds
    const iconGuilds = document.querySelector('.bottom-icon[data-action="guilds"]');
    if (iconGuilds) {
      iconGuilds.addEventListener('click', () => {
        console.log("🤝 Guilds clicked");
        alert("Guilds System\n\nComing soon!");
      });
    }

    // Settings
    const iconSettings = document.querySelector('.bottom-icon[data-action="settings"]');
    if (iconSettings) {
      iconSettings.addEventListener('click', () => {
        console.log("⚙️ Settings clicked");
        openSettingsMenu();
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

})(window);
