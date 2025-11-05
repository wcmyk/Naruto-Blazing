// js/battle-animations.js - Animation System for Battle
(() => {
  "use strict";

  const BattleAnimations = {
    /**
     * Display damage number with floating animation
     * @param {Object} unit - The unit taking damage
     * @param {number} amount - Damage amount
     * @param {boolean} isCritical - Whether it's a critical hit
     * @param {Object} dom - DOM references from BattleManager
     * @param {boolean} isHeal - Whether this is healing (optional)
     */
    showDamage(unit, amount, isCritical = false, dom, isHeal = false) {
      const unitEl = dom.scene?.querySelector(`[data-unit-id="${unit.id}"]`);
      if (!unitEl || !dom.damageLayer) return;

      const rect = unitEl.getBoundingClientRect();
      const sceneRect = dom.scene.getBoundingClientRect();

      const damageEl = document.createElement("div");
      damageEl.className = `damage-number ${isCritical ? 'critical' : ''} ${isHeal ? 'heal' : ''}`;
      damageEl.textContent = isHeal ? `+${amount}` : `-${amount}`;
      damageEl.style.position = 'absolute';
      damageEl.style.left = `${rect.left - sceneRect.left + rect.width / 2}px`;
      damageEl.style.top = `${rect.top - sceneRect.top}px`;
      damageEl.style.transform = 'translate(-50%, -100%)';
      damageEl.style.animation = 'damageFloat 1s ease-out forwards';
      damageEl.style.fontSize = isCritical ? '2.5rem' : '1.8rem';
      damageEl.style.fontWeight = 'bold';
      damageEl.style.color = isHeal ? '#2ecc71' : (isCritical ? '#ff4444' : '#ffffff');
      damageEl.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
      damageEl.style.zIndex = '500';
      damageEl.style.pointerEvents = 'none';

      dom.damageLayer.appendChild(damageEl);
      setTimeout(() => damageEl.remove(), 1000);
    },

    /**
     * Play skill animation (jutsu or ultimate)
     * @param {Object} unit - The unit casting the skill
     * @param {string} skillType - "jutsu" or "ultimate"
     * @param {string} gifPath - Path to animation GIF
     * @param {Object} dom - DOM references from BattleManager
     */
    playSkillAnimation(unit, skillType, gifPath, dom) {
      // Try to get animation from multiple sources
      if (!gifPath) {
        const base = unit._ref?.base;
        if (skillType === "ultimate") {
          gifPath = base?.ultimateAnimation || base?.skills?.ultimate?.animationGif;
        } else {
          gifPath = base?.jutsuAnimation || base?.skills?.jutsu?.animationGif;
        }
      }

      if (!gifPath || !dom.effectsLayer) {
        console.log("[Animations] No animation path for", skillType);
        return;
      }

      const unitEl = dom.scene?.querySelector(`[data-unit-id="${unit.id}"]`);
      if (!unitEl) return;

      const rect = unitEl.getBoundingClientRect();
      const sceneRect = dom.scene.getBoundingClientRect();

      const animEl = document.createElement("div");
      animEl.className = `skill-animation ${skillType}`;
      animEl.style.position = "absolute";
      animEl.style.left = `${rect.left - sceneRect.left - 100}px`;
      animEl.style.top = `${rect.top - sceneRect.top - 100}px`;
      animEl.style.width = "300px";
      animEl.style.height = "300px";
      animEl.style.pointerEvents = "none";
      animEl.style.zIndex = "200";

      animEl.innerHTML = `<img src="${gifPath}" style="width: 100%; height: 100%; object-fit: contain;" alt="skill" onerror="this.style.display='none'">`;

      dom.effectsLayer.appendChild(animEl);

      setTimeout(() => animEl.remove(), skillType === "ultimate" ? 2000 : 1500);
    },

    /**
     * Show visual effect for unit guarding
     * @param {Object} unit - The unit guarding
     * @param {Object} dom - DOM references from BattleManager
     */
    showGuardEffect(unit, dom) {
      const unitEl = dom.scene?.querySelector(`[data-unit-id="${unit.id}"]`);
      if (!unitEl || !dom.effectsLayer) return;

      const rect = unitEl.getBoundingClientRect();
      const sceneRect = dom.scene.getBoundingClientRect();

      const shieldEl = document.createElement("div");
      shieldEl.className = "guard-effect";
      shieldEl.style.position = "absolute";
      shieldEl.style.left = `${rect.left - sceneRect.left}px`;
      shieldEl.style.top = `${rect.top - sceneRect.top}px`;
      shieldEl.style.width = `${rect.width}px`;
      shieldEl.style.height = `${rect.height}px`;
      shieldEl.style.border = "3px solid #58b7ff";
      shieldEl.style.borderRadius = "50%";
      shieldEl.style.boxShadow = "0 0 20px #58b7ff";
      shieldEl.style.pointerEvents = "none";
      shieldEl.style.zIndex = "150";
      shieldEl.style.animation = "guardPulse 0.5s ease-out";

      dom.effectsLayer.appendChild(shieldEl);

      setTimeout(() => shieldEl.remove(), 500);
    },

    /**
     * Animate unit death/knockout
     * @param {Object} unit - The unit being knocked out
     * @param {Object} dom - DOM references from BattleManager
     */
    animateKnockout(unit, dom) {
      const unitEl = dom.scene?.querySelector(`[data-unit-id="${unit.id}"]`);
      if (!unitEl) return;

      unitEl.style.transition = "all 0.5s ease-out";
      unitEl.style.opacity = "0";
      unitEl.style.transform = "scale(0.8)";
      unitEl.style.filter = "grayscale(100%)";

      setTimeout(() => {
        unitEl.style.opacity = "0.35";
        unitEl.style.transform = "scale(1)";
        unitEl.style.pointerEvents = "none";
      }, 500);
    },

    /**
     * Show status effect icon on unit
     * @param {Object} unit - The unit with status effect
     * @param {string} statusType - Type of status (burn, poison, stun, etc.)
     * @param {Object} dom - DOM references from BattleManager
     */
    showStatusEffect(unit, statusType, dom) {
      const unitEl = dom.scene?.querySelector(`[data-unit-id="${unit.id}"]`);
      if (!unitEl) return;

      const statusContainer = unitEl.querySelector('.status-effects') || (() => {
        const container = document.createElement('div');
        container.className = 'status-effects';
        container.style.position = 'absolute';
        container.style.top = '-25px';
        container.style.left = '50%';
        container.style.transform = 'translateX(-50%)';
        container.style.display = 'flex';
        container.style.gap = '3px';
        container.style.zIndex = '10';
        unitEl.appendChild(container);
        return container;
      })();

      const statusIcon = document.createElement('div');
      statusIcon.className = `status-icon ${statusType}`;
      statusIcon.style.width = '20px';
      statusIcon.style.height = '20px';
      statusIcon.style.borderRadius = '50%';
      statusIcon.style.display = 'flex';
      statusIcon.style.alignItems = 'center';
      statusIcon.style.justifyContent = 'center';
      statusIcon.style.fontSize = '12px';
      statusIcon.style.fontWeight = 'bold';
      statusIcon.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

      // Set icon appearance based on status type
      const statusStyles = {
        burn: { bg: '#ff6b6b', icon: '🔥', text: 'Burn' },
        poison: { bg: '#a855f7', icon: '☠️', text: 'Poison' },
        stun: { bg: '#ffd93d', icon: '⚡', text: 'Stun' },
        freeze: { bg: '#6bcbff', icon: '❄️', text: 'Freeze' },
        buff: { bg: '#2ecc71', icon: '↑', text: 'Buff' },
        debuff: { bg: '#e74c3c', icon: '↓', text: 'Debuff' }
      };

      const style = statusStyles[statusType] || statusStyles.debuff;
      statusIcon.style.backgroundColor = style.bg;
      statusIcon.textContent = style.icon;
      statusIcon.title = style.text;

      statusContainer.appendChild(statusIcon);
    },

    /**
     * Animate unit taking a turn (highlight pulse)
     * @param {Object} unit - The unit taking turn
     * @param {Object} dom - DOM references from BattleManager
     */
    animateTurnStart(unit, dom) {
      const unitEl = dom.scene?.querySelector(`[data-unit-id="${unit.id}"]`);
      if (!unitEl) return;

      unitEl.style.animation = 'turnPulse 0.5s ease-out';

      setTimeout(() => {
        unitEl.style.animation = '';
      }, 500);
    },

    /**
     * Show area of effect indicator
     * @param {number} x - X position in pixels
     * @param {number} y - Y position in pixels
     * @param {number} radius - Radius of effect
     * @param {string} color - Color of the indicator
     * @param {Object} dom - DOM references from BattleManager
     */
    showAOEIndicator(x, y, radius, color, dom) {
      if (!dom.effectsLayer) return;

      const aoeEl = document.createElement('div');
      aoeEl.className = 'aoe-indicator';
      aoeEl.style.position = 'absolute';
      aoeEl.style.left = `${x - radius}px`;
      aoeEl.style.top = `${y - radius}px`;
      aoeEl.style.width = `${radius * 2}px`;
      aoeEl.style.height = `${radius * 2}px`;
      aoeEl.style.border = `3px solid ${color}`;
      aoeEl.style.borderRadius = '50%';
      aoeEl.style.backgroundColor = `${color}22`;
      aoeEl.style.boxShadow = `0 0 30px ${color}`;
      aoeEl.style.pointerEvents = 'none';
      aoeEl.style.zIndex = '100';
      aoeEl.style.animation = 'aoePulse 0.8s ease-out';

      dom.effectsLayer.appendChild(aoeEl);

      setTimeout(() => aoeEl.remove(), 800);
    },

    /**
     * Create screen shake effect
     * @param {number} intensity - Shake intensity (1-10)
     * @param {number} duration - Duration in ms
     * @param {Object} dom - DOM references from BattleManager
     */
    screenShake(intensity = 5, duration = 300, dom) {
      if (!dom.scene) return;

      const originalTransform = dom.scene.style.transform;
      let startTime = Date.now();

      const shake = () => {
        const elapsed = Date.now() - startTime;

        if (elapsed < duration) {
          const x = (Math.random() - 0.5) * intensity;
          const y = (Math.random() - 0.5) * intensity;
          dom.scene.style.transform = `translate(${x}px, ${y}px)`;
          requestAnimationFrame(shake);
        } else {
          dom.scene.style.transform = originalTransform;
        }
      };

      shake();
    },

    /**
     * Flash the screen with a color
     * @param {string} color - Color to flash
     * @param {number} duration - Duration in ms
     * @param {Object} dom - DOM references from BattleManager
     */
    screenFlash(color, duration = 200, dom) {
      if (!dom.scene) return;

      const flash = document.createElement('div');
      flash.style.position = 'absolute';
      flash.style.inset = '0';
      flash.style.backgroundColor = color;
      flash.style.opacity = '0.6';
      flash.style.pointerEvents = 'none';
      flash.style.zIndex = '1000';
      flash.style.animation = `flashFade ${duration}ms ease-out`;

      dom.scene.appendChild(flash);

      setTimeout(() => flash.remove(), duration);
    },

    /**
     * Animate chakra gain
     * @param {Object} unit - The unit gaining chakra
     * @param {number} amount - Amount of chakra gained
     * @param {Object} dom - DOM references from BattleManager
     */
    animateChakraGain(unit, amount, dom) {
      const unitEl = dom.scene?.querySelector(`[data-unit-id="${unit.id}"]`);
      if (!unitEl) return;

      const chakraContainer = unitEl.querySelector('.unit-chakra');
      if (!chakraContainer) return;

      chakraContainer.style.animation = 'chakraPulse 0.3s ease-out';

      setTimeout(() => {
        chakraContainer.style.animation = '';
      }, 300);
    }
  };

  // Export to window
  window.BattleAnimations = BattleAnimations;

  // Add CSS animations dynamically
  const style = document.createElement('style');
  style.textContent = `
    @keyframes damageFloat {
      0% {
        opacity: 1;
        transform: translate(-50%, -100%) scale(1);
      }
      50% {
        transform: translate(-50%, -150%) scale(1.2);
      }
      100% {
        opacity: 0;
        transform: translate(-50%, -200%) scale(0.8);
      }
    }

    @keyframes guardPulse {
      0% {
        opacity: 1;
        transform: scale(0.8);
      }
      100% {
        opacity: 0;
        transform: scale(1.3);
      }
    }

    @keyframes turnPulse {
      0%, 100% {
        filter: brightness(1);
      }
      50% {
        filter: brightness(1.4) drop-shadow(0 0 20px rgba(255,234,120,0.8));
      }
    }

    @keyframes aoePulse {
      0% {
        opacity: 1;
        transform: scale(0.5);
      }
      100% {
        opacity: 0;
        transform: scale(1.5);
      }
    }

    @keyframes flashFade {
      0% {
        opacity: 0.6;
      }
      100% {
        opacity: 0;
      }
    }

    @keyframes chakraPulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.1);
        filter: brightness(1.4);
      }
    }

    .skill-animation {
      transition: opacity 0.3s ease-out;
    }

    .skill-animation.ultimate img {
      filter: drop-shadow(0 0 15px rgba(255, 77, 77, 0.8));
    }

    .skill-animation.jutsu img {
      filter: drop-shadow(0 0 15px rgba(88, 183, 255, 0.8));
    }
  `;
  document.head.appendChild(style);

  console.log("[BattleAnimations] Module loaded");

})();
