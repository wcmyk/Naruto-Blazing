// js/battle/battle-finish.js - Ultimate Finish Animations
(() => {
  "use strict";

  /**
   * BattleFinish Module
   * Handles dramatic finish animations when defeating final enemy with ultimate
   *
   * Features:
   * - Slow-motion effect
   * - Screen shake
   * - Particle explosions
   * - Dramatic camera zoom
   * - Victory pose
   */
  const BattleFinish = {

    /**
     * Check if this is an ultimate finish (final enemy defeated by ultimate)
     */
    isUltimateFinish(target, remainingEnemies, wasUltimate) {
      return wasUltimate && remainingEnemies <= 1 && target.stats.hp <= 0;
    },

    /**
     * Play ultimate finish sequence
     */
    async playUltimateFinish(attacker, target, core) {
      console.log("[Finish] ULTIMATE FINISH!");

      // Trigger slow motion
      if (window.BattleParticles) {
        window.BattleParticles.slowMotion(2000, 0.2);
      }

      // Massive screen shake
      if (window.BattleParticles) {
        window.BattleParticles.screenShake(core.dom.scene, 15, 1000);
      }

      // Create explosion particles
      this.createExplosionEffect(target, core);

      // Zoom in on defeated enemy
      await this.dramaticZoom(target, core);

      // Victory text
      await this.delay(500);
      this.showVictoryText(core);

      // Fade out defeated enemy
      await this.fadeOutUnit(target, core);
    },

    /**
     * Create explosion particle effect
     */
    createExplosionEffect(unit, core) {
      const unitEl = core.dom.scene?.querySelector(`[data-unit-id="${unit.id}"]`);
      if (!unitEl) return;

      const rect = unitEl.getBoundingClientRect();
      const sceneRect = core.dom.scene.getBoundingClientRect();

      const centerX = ((rect.left + rect.width / 2 - sceneRect.left) / sceneRect.width) * 100;
      const centerY = ((rect.top + rect.height / 2 - sceneRect.top) / sceneRect.height) * 100;

      // Create multiple particle bursts
      if (window.BattleParticles) {
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            window.BattleParticles.createElementalParticles('fire', centerX, centerY, core.dom.scene);
          }, i * 200);
        }
      }

      // Create shockwave
      this.createShockwave(centerX, centerY, core);
    },

    /**
     * Create shockwave effect
     */
    createShockwave(x, y, core) {
      if (!core.dom.scene) return;

      const shockwave = document.createElement('div');
      shockwave.className = 'shockwave-effect';

      shockwave.style.cssText = `
        position: absolute;
        left: ${x}%;
        top: ${y}%;
        transform: translate(-50%, -50%);
        width: 50px;
        height: 50px;
        border: 3px solid rgba(255, 255, 255, 0.8);
        border-radius: 50%;
        pointer-events: none;
        z-index: 100;
        animation: shockwaveExpand 1s ease-out forwards;
      `;

      core.dom.scene.appendChild(shockwave);
      setTimeout(() => shockwave.remove(), 1000);
    },

    /**
     * Dramatic zoom on target
     */
    async dramaticZoom(unit, core) {
      const unitEl = core.dom.scene?.querySelector(`[data-unit-id="${unit.id}"]`);
      if (!unitEl) return;

      // Zoom in
      unitEl.style.transition = 'transform 0.8s ease-out, filter 0.8s ease-out';
      unitEl.style.transform = 'scale(1.5)';
      unitEl.style.filter = 'brightness(1.5)';

      await this.delay(800);

      // Zoom out
      unitEl.style.transform = 'scale(1)';
      unitEl.style.filter = 'brightness(1)';

      await this.delay(400);
    },

    /**
     * Show dramatic victory text
     */
    showVictoryText(core) {
      if (!core.dom.scene) return;

      const victoryText = document.createElement('div');
      victoryText.className = 'ultimate-finish-text';
      victoryText.textContent = 'ULTIMATE FINISH!';

      victoryText.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        font-size: 4rem;
        font-weight: bold;
        font-family: 'Cinzel', serif;
        color: #ffd700;
        text-shadow:
          0 0 20px rgba(255, 215, 0, 1),
          0 0 40px rgba(255, 215, 0, 0.8),
          3px 3px 6px rgba(0, 0, 0, 0.9);
        z-index: 9999;
        pointer-events: none;
        letter-spacing: 4px;
        animation: ultimateFinishText 2s ease-out forwards;
      `;

      document.body.appendChild(victoryText);
      setTimeout(() => victoryText.remove(), 2000);
    },

    /**
     * Fade out defeated unit
     */
    async fadeOutUnit(unit, core) {
      const unitEl = core.dom.scene?.querySelector(`[data-unit-id="${unit.id}"]`);
      if (!unitEl) return;

      unitEl.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
      unitEl.style.opacity = '0';
      unitEl.style.transform = 'scale(0.5)';

      await this.delay(1000);
    },

    /**
     * Check if skill was an ultimate
     */
    wasUltimateUsed(skillType) {
      return skillType === 'ultimate' || skillType === 'secret';
    },

    /**
     * Delay helper
     */
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Initialize finish animation styles
     */
    initializeStyles() {
      if (document.getElementById('finish-styles')) return;

      const style = document.createElement('style');
      style.id = 'finish-styles';
      style.textContent = `
        @keyframes shockwaveExpand {
          0% {
            width: 50px;
            height: 50px;
            opacity: 1;
          }
          100% {
            width: 300px;
            height: 300px;
            opacity: 0;
            border-width: 1px;
          }
        }

        @keyframes ultimateFinishText {
          0% {
            transform: translate(-50%, -50%) scale(0) rotate(-10deg);
            opacity: 0;
          }
          20% {
            transform: translate(-50%, -50%) scale(1.3) rotate(5deg);
            opacity: 1;
          }
          40% {
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
          }
          80% {
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(0.8) rotate(0deg);
            opacity: 0;
          }
        }
      `;

      document.head.appendChild(style);
      console.log("[Finish] Styles initialized");
    }
  };

  // Initialize styles on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => BattleFinish.initializeStyles());
  } else {
    BattleFinish.initializeStyles();
  }

  // Export globally
  window.BattleFinish = BattleFinish;
})();
