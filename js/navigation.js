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
      window.location.href = url;
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
        navigateTo("inventory.html");
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

    console.log("✅ Navigation listeners attached to all found buttons!");
  });
})();
