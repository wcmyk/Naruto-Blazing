// js/awakening-animation.js
// Awakening Animation System - Epic transformation animation with Japanese characters

(function (global) {
  "use strict";

  // Japanese characters meaning "Awakening" / "Evolution" / "Power"
  const KANJI_CHARACTERS = ["覚", "醒", "進", "化", "力"];

  /**
   * Play the awakening animation
   * @param {string} oldCharacterName - Name of the base character
   * @param {string} newCharacterName - Name of the evolved character
   * @param {string} newArtworkUrl - Full artwork URL of the evolved character
   * @param {Function} onComplete - Callback when animation finishes
   */
  async function playAwakeningAnimation(oldCharacterName, newCharacterName, newArtworkUrl, onComplete) {
    console.log("[Awakening Animation] Starting animation...");

    // Create overlay
    const overlay = document.createElement("div");
    overlay.className = "awakening-overlay";
    document.body.appendChild(overlay);

    // Create container
    const container = document.createElement("div");
    container.className = "awakening-container";
    overlay.appendChild(container);

    // Add Japanese characters
    KANJI_CHARACTERS.forEach((kanji, index) => {
      const kanjiEl = document.createElement("div");
      kanjiEl.className = "awakening-kanji";
      kanjiEl.textContent = kanji;

      // Position characters in a circle pattern
      const angle = (index / KANJI_CHARACTERS.length) * Math.PI * 2;
      const radius = 150;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      kanjiEl.style.left = `calc(50% + ${x}px)`;
      kanjiEl.style.top = `calc(50% + ${y}px)`;
      kanjiEl.style.transform = `translate(-50%, -50%)`;

      container.appendChild(kanjiEl);
    });

    // Add golden circle
    const circle = document.createElement("div");
    circle.className = "awakening-circle";
    container.appendChild(circle);

    // Add sparkle particles
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement("div");
      particle.className = "awakening-particle";

      // Random position and movement
      const angle = Math.random() * Math.PI * 2;
      const distance = 50 + Math.random() * 100;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;

      particle.style.setProperty('--tx', `${tx}px`);
      particle.style.setProperty('--ty', `${ty}px`);
      particle.style.left = '50%';
      particle.style.top = '50%';
      particle.style.animationDelay = `${1 + Math.random() * 2}s`;

      container.appendChild(particle);
    }

    // Add energy beams
    for (let i = 0; i < 4; i++) {
      const beam = document.createElement("div");
      beam.className = "awakening-beam";
      container.appendChild(beam);
    }

    // Add ripple effects
    for (let i = 0; i < 3; i++) {
      const ripple = document.createElement("div");
      ripple.className = "awakening-ripple";
      ripple.style.animationDelay = `${1.5 + i * 0.5}s`;
      container.appendChild(ripple);
    }

    // Add flash effect
    const flash = document.createElement("div");
    flash.className = "awakening-flash";
    container.appendChild(flash);

    // Preload the new character image
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = newArtworkUrl;
    });

    // Add character image (will appear after flash)
    const characterContainer = document.createElement("div");
    characterContainer.className = "awakening-character";
    const characterImg = document.createElement("img");
    characterImg.src = newArtworkUrl;
    characterImg.alt = `${newCharacterName} awakened form`;
    characterContainer.appendChild(characterImg);
    container.appendChild(characterContainer);

    // Add success text
    const successText = document.createElement("div");
    successText.className = "awakening-success";
    successText.innerHTML = `
      <div>${oldCharacterName}</div>
      <div style="font-size: 24px; margin: 10px 0;">↓</div>
      <div>${newCharacterName}</div>
      <div style="font-size: 20px; margin-top: 15px; color: #ffaa00;">AWAKENING COMPLETE!</div>
    `;
    container.appendChild(successText);

    // Activate overlay
    setTimeout(() => {
      overlay.classList.add("active");
    }, 10);

    // Play sound effect if available
    if (global.AudioManager && typeof global.AudioManager.playSFX === 'function') {
      setTimeout(() => global.AudioManager.playSFX('awakening'), 2000);
    }

    // Auto-close after animation completes
    setTimeout(() => {
      overlay.classList.remove("active");
      setTimeout(() => {
        overlay.remove();
        console.log("[Awakening Animation] Animation complete");
        if (onComplete) onComplete();
      }, 300);
    }, 4500); // Total animation duration: 4.5 seconds

    // Allow click to skip
    overlay.addEventListener('click', () => {
      overlay.classList.remove("active");
      setTimeout(() => {
        overlay.remove();
        console.log("[Awakening Animation] Animation skipped by user");
        if (onComplete) onComplete();
      }, 300);
    });
  }

  // Export to global
  global.AwakeningAnimation = {
    play: playAwakeningAnimation
  };

  console.log("[Awakening Animation] Module loaded");

})(window);
