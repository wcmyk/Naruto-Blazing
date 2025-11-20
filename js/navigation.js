// js/navigation.js
// Navigation System for Banner Buttons, Bottom Icons, and Summon Banners
// Handles all page navigation and deep linking

(function (global) {
  "use strict";

  // ---------- Navigation Function ----------
  function navigateTo(url, params = {}) {
    console.log(`[Navigation] Navigating to: ${url}`, params);

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
        console.log("[Navigation] Missions banner clicked");
        navigateTo('missions.html');
      });
    }

    // Characters
    const btnCharacters = document.querySelector('.banner-button.characters');
    if (btnCharacters) {
      btnCharacters.addEventListener('click', () => {
        console.log("[Navigation] Characters banner clicked");
        navigateTo('characters.html');
      });
    }

    // Summon
    const btnSummon = document.querySelector('.banner-button.summon');
    if (btnSummon) {
      btnSummon.addEventListener('click', () => {
        console.log("[Navigation] Summon banner clicked");
        navigateTo('summon.html');
      });
    }

    // Fusion
    const btnFusion = document.querySelector('.banner-button.fusion');
    if (btnFusion) {
      btnFusion.addEventListener('click', () => {
        console.log("[Navigation] Fusion banner clicked");
        navigateTo('fusion.html');
      });
    }

    // Shop
    const btnShop = document.querySelector('.banner-button.shop');
    if (btnShop) {
      btnShop.addEventListener('click', () => {
        console.log("[Navigation] Shop banner clicked");
        navigateTo('shop.html');
      });
    }
  }

  // ---------- Bottom Icon Navigation ----------
  function initBottomIcons() {
    console.log("[Navigation] Initializing bottom icons...");

    // Notice
    const iconNotice = document.querySelector('.bottom-icon[data-action="notice"]');
    console.log("[Navigation] Notice icon found:", iconNotice);
    if (iconNotice) {
      iconNotice.addEventListener('click', () => {
        console.log("[Navigation] Notice clicked");
        alert("Notice System\n\nNo new notices at this time.");
      });
    }

    // Present Box
    const iconPresents = document.querySelector('.bottom-icon[data-action="presents"]');
    if (iconPresents) {
      iconPresents.addEventListener('click', () => {
        console.log("[Navigation] Present Box clicked");
        alert("Present Box\n\nNo presents available.");
      });
    }

    // Achievements
    const iconAchievements = document.querySelector('.bottom-icon[data-action="achievements"]');
    if (iconAchievements) {
      iconAchievements.addEventListener('click', () => {
        console.log("[Navigation] Achievements clicked");
        alert("Achievements\n\nComing soon!");
      });
    }

    // Panel Missions
    const iconPanelMissions = document.querySelector('.bottom-icon[data-action="panel-missions"]');
    if (iconPanelMissions) {
      iconPanelMissions.addEventListener('click', () => {
        console.log("[Navigation] Panel Missions clicked");
        navigateTo('missions.html');
      });
    }

    // Chat
    const iconChat = document.querySelector('.bottom-icon[data-action="chat"]');
    if (iconChat) {
      iconChat.addEventListener('click', () => {
        console.log("[Navigation] Chat clicked");
        alert("Chat System\n\nComing soon!");
      });
    }

    // Inventory (Storage)
    const iconInventory = document.querySelector('.bottom-icon[data-action="inventory"]');
    if (iconInventory) {
      iconInventory.addEventListener('click', () => {
        console.log("[Navigation] Inventory clicked");
        navigateTo('inventory.html');
      });
    }

    // Teams
    const iconTeams = document.querySelector('.bottom-icon[data-action="teams"]');
    if (iconTeams) {
      iconTeams.addEventListener('click', () => {
        console.log("[Navigation] Teams clicked");
        navigateTo('teams.html');
      });
    }

    // Resources
    const iconResources = document.querySelector('.bottom-icon[data-action="resources"]');
    if (iconResources) {
      iconResources.addEventListener('click', () => {
        console.log("[Navigation] Resources clicked");
        navigateTo('resources.html');
      });
    }

    // Guilds
    const iconGuilds = document.querySelector('.bottom-icon[data-action="guilds"]');
    if (iconGuilds) {
      iconGuilds.addEventListener('click', () => {
        console.log("[Navigation] Guilds clicked");
        alert("Guilds System\n\nComing soon!");
      });
    }

    // Settings
    const iconSettings = document.querySelector('.bottom-icon[data-action="settings"]');
    if (iconSettings) {
      iconSettings.addEventListener('click', () => {
        console.log("[Navigation] Settings clicked");
        openSettingsMenu();
      });
    }

    console.log("[Navigation] Bottom icons initialized successfully");
  }

  // ---------- Summon Banner Carousel Navigation ----------
  async function initSummonBanners() {
    const carousel = document.querySelector('.summon-banner-carousel');
    if (!carousel) return;

    try {
      // Load summon banners data
      const response = await fetch('data/summon.json'); // Fixed: was summons.json
      const summonsData = await response.json();

      // Clear carousel
      carousel.innerHTML = '';

      // Create banner cards
      summonsData.banners.forEach((banner, index) => {
        const card = document.createElement('div');
        card.className = 'summon-banner-card';
        card.dataset.bannerId = banner.id;

        // Add banner type class for different gradient styles
        if (banner.type) {
          card.classList.add(`banner-type-${banner.type}`);
        }

        // Set background image from banner data (if it exists)
        if (banner.image) {
          // Try to preload the image to check if it exists
          const img = new Image();
          img.onload = () => {
            card.style.backgroundImage = `url("${banner.image}")`;
            console.log(`[Summon] Loaded image: ${banner.image}`);
          };
          img.onerror = () => {
            console.warn(`[Summon] Image not found: ${banner.image} - using gradient fallback`);
          };
          img.src = banner.image;
        }

        // Add title
        const title = document.createElement('div');
        title.className = 'summon-banner-title';
        title.textContent = banner.name;
        card.appendChild(title);

        // Add subtitle/description
        const subtitle = document.createElement('div');
        subtitle.className = 'summon-banner-subtitle';
        subtitle.textContent = banner.description || banner.subtitle || '';
        card.appendChild(subtitle);

        // Click handler - navigate to summon.html with banner ID
        card.addEventListener('click', () => {
          console.log(`[Summon] Banner clicked: ${banner.name}`);
          navigateTo('summon.html', { banner: banner.id });
        });

        carousel.appendChild(card);
      });

      console.log(`[Navigation] Loaded ${summonsData.banners.length} summon banners`);
    } catch (err) {
      console.error("[Navigation] Failed to load summon banners:", err);
    }
  }

  // ---------- Settings Menu ----------
  function openSettingsMenu() {
    navigateTo('settings.html');
  }

  // ---------- Background Changer ----------
  function changeBackground(num) {
    const el = document.getElementById("full-bg");
    if (!el) return;

    for (let i = 1; i <= 10; i++) {
      el.classList.remove(`bg-${i}`);
    }
    el.classList.add(`bg-${num}`);
    console.log(`[Navigation] Background changed to bg-${num}`);
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
        console.log("[Navigation] Navigation system initialized");
      });
    } else {
      initBannerButtons();
      initBottomIcons();
      initSummonBanners();
      initUsernameClick();
      console.log("[Navigation] Navigation system initialized");
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
