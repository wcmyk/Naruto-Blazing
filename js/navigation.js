// js/navigation.js - Shared navigation functionality for bottom bar
(() => {
  "use strict";

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
    // Village button
    const btnVillage = document.getElementById("btn-village");
    if (btnVillage) {
      btnVillage.addEventListener("click", () => {
        console.log("🏠 Village clicked");
        navigateTo("index.html");
      });
    }

    // Characters button
    const btnCharacters = document.getElementById("btn-characters");
    if (btnCharacters) {
      btnCharacters.addEventListener("click", () => {
        console.log("👤 Characters clicked");
        navigateTo("characters.html");
      });
    }

    // Fusion button
    const btnFusion = document.getElementById("btn-fusion");
    if (btnFusion) {
      btnFusion.addEventListener("click", () => {
        console.log("⚡ Fusion clicked");
        navigateTo("fusion.html");
      });
    }

    // Teams button
    const btnTeams = document.getElementById("btn-teams");
    if (btnTeams) {
      btnTeams.addEventListener("click", () => {
        console.log("👥 Teams clicked");
        navigateTo("teams.html");
      });
    }

    // Summon button
    const btnSummon = document.getElementById("btn-summon");
    if (btnSummon) {
      btnSummon.addEventListener("click", () => {
        console.log("🔮 Summon clicked");
        navigateTo("summon.html");
      });
    }

    // Missions button
    const btnMissions = document.getElementById("btn-missions");
    if (btnMissions) {
      btnMissions.addEventListener("click", () => {
        console.log("📜 Missions clicked");
        navigateTo("missions.html");
      });
    }

    // Inventory button
    const btnInventory = document.getElementById("btn-inventory");
    if (btnInventory) {
      btnInventory.addEventListener("click", () => {
        console.log("📦 Inventory clicked");
        navigateTo("inventory.html");
      });
    }

    // Shop button
    const btnShop = document.getElementById("btn-shop");
    if (btnShop) {
      btnShop.addEventListener("click", () => {
        console.log("🛒 Shop clicked");
        navigateTo("shop.html");
      });
    }

    console.log("✅ Navigation listeners attached!");
  });
})();
