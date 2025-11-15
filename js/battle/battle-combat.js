// js/battle/battle-combat.js - Combat System (Damage, Skills, Actions)
(() => {
  "use strict";

  /**
   * BattleCombat Module
   * Handles all combat calculations, attacks, skills, and damage
   *
   * Features:
   * - Damage calculation with DEF, criticals, variance
   * - Basic attacks with chakra gain
   * - Jutsu system with multipliers
   * - Ultimate abilities (multi-target)
   * - Multi-hit attacks
   * - Guard action with damage reduction
   * - Skill tier resolution
   */
  const BattleCombat = {

    /* ===== Skill Resolution ===== */

    /**
     * Get tier code for unit (3S, 4S, 5S, etc.)
     */
    getTierForUnit(unit) {
      return unit._ref?.inst?.tierCode || unit._ref?.base?.starMinCode || "3S";
    },

    /**
     * Get skill entry for specific tier
     */
    getSkillEntry(skill, tierCode) {
      if (!skill?.byTier) return null;
      if (skill.byTier[tierCode]) return skill.byTier[tierCode];
      const k = Object.keys(skill.byTier)[0];
      return k ? skill.byTier[k] : null;
    },

    /**
     * Get all skills for unit (jutsu + ultimate)
     */
    getUnitSkills(unit) {
      const base = unit._ref?.base;
      const tier = this.getTierForUnit(unit);
      if (!base?.skills) return { tier, jutsu: null, ultimate: null };

      const j = base.skills.jutsu ? this.getSkillEntry(base.skills.jutsu, tier) : null;
      const u = base.skills.ultimate ? this.getSkillEntry(base.skills.ultimate, tier) : null;

      return {
        tier,
        jutsu: j ? { meta: base.skills.jutsu, data: j } : null,
        ultimate: u ? { meta: base.skills.ultimate, data: u } : null
      };
    },

    /* ===== Skill Unlocking System ===== */

    /**
     * Get character level from unit reference
     */
    getUnitLevel(unit) {
      return Number(unit._ref?.inst?.level || 1);
    },

    /**
     * Check if jutsu is unlocked (requires level 20)
     */
    isJutsuUnlocked(unit) {
      const level = this.getUnitLevel(unit);
      return level >= 20;
    },

    /**
     * Check if ultimate is unlocked (requires level 50)
     */
    isUltimateUnlocked(unit) {
      const level = this.getUnitLevel(unit);
      return level >= 50;
    },

    /**
     * Check if secret technique is unlocked (requires tier 6S+)
     */
    isSecretUnlocked(unit) {
      const tier = this.getTierForUnit(unit);
      const tierOrder = ['3S', '4S', '5S', '6S', '6SB', '7S', '7SL', '8S', '8SM', '9S', '9ST', '10SO'];
      const currentIndex = tierOrder.indexOf(tier);
      const minIndex = tierOrder.indexOf('6S');
      return currentIndex >= minIndex;
    },

    /**
     * Get unlock requirements for skill type
     */
    getSkillUnlockRequirement(skillType) {
      const requirements = {
        jutsu: { level: 20, tier: null },
        ultimate: { level: 50, tier: null },
        secret: { level: null, tier: '6S+' }
      };
      return requirements[skillType] || null;
    },

    /* ===== Damage Calculation ===== */

    /**
     * Calculate damage with ATK, DEF, buffs, criticals, and variance
     * @param {Object} attacker - Attacking unit
     * @param {Object} defender - Defending unit
     * @param {number} multiplier - Skill multiplier (1.0 = basic attack)
     * @returns {Object} {damage, isCritical}
     */
    calculateDamage(attacker, defender, multiplier = 1) {
      // Validate inputs
      if (!attacker?.stats || !defender?.stats) {
        console.warn("[Combat] Invalid attacker or defender stats", { attacker, defender });
        return { damage: 0, isCritical: false };
      }

      // Validate and parse multiplier
      let mult = 1;
      if (typeof multiplier === 'string') {
        const match = multiplier.match(/([\d.]+)/);
        mult = match ? parseFloat(match[1]) : 1;
      } else {
        mult = Number(multiplier) || 1;
      }

      // Ensure multiplier is valid
      if (isNaN(mult) || mult <= 0) {
        console.warn("[Combat] Invalid multiplier, using 1.0", { multiplier });
        mult = 1;
      }

      // Get buff modifiers from BattleBuffs
      const attackerBuffs = window.BattleBuffs?.aggregateBuffModifiers?.(attacker) || {
        atkFlat: 0,
        critRatePercent: 0,
        critDmgPercent: 0
      };

      const defenderBuffs = window.BattleBuffs?.aggregateBuffModifiers?.(defender) || {
        defFlat: 0,
        damageReductionPercent: 0,
        barrierHP: 0
      };

      // Base stats with validation
      const baseAtk = Math.max(0, Number(attacker.stats.atk) || 100);
      const baseDef = Math.max(0, Number(defender.stats.def) || 0);

      // Apply buff modifiers to stats
      const effectiveAtk = baseAtk + attackerBuffs.atkFlat;
      const effectiveDef = baseDef + defenderBuffs.defFlat;

      // Base damage from ATK stat and multiplier
      let damage = effectiveAtk * mult;

      // Subtract defender's DEF (50% effectiveness)
      damage -= effectiveDef * 0.5;

      // Guard reduces damage by 50%
      if (defender.isGuarding) {
        damage *= 0.5;
      }

      // Apply damage reduction from buffs
      if (defenderBuffs.damageReductionPercent > 0) {
        damage *= (1 - defenderBuffs.damageReductionPercent / 100);
      }

      // Random variance (90% - 110%)
      damage *= (0.9 + Math.random() * 0.2);

      // Critical hit chance (15% base + buff bonus)
      const critChance = 0.15 + (attackerBuffs.critRatePercent / 100);
      const isCritical = Math.random() < critChance;

      if (isCritical) {
        // Critical damage multiplier (1.5x base + buff bonus)
        const critMultiplier = 1.5 + (attackerBuffs.critDmgPercent / 100);
        damage *= critMultiplier;
      }

      // Apply barrier absorption
      if (defenderBuffs.barrierHP > 0) {
        // Find barrier buff in defender's status effects
        const barrierBuff = defender.statusEffects?.find(se =>
          se.kind === 'buff' && se.payload?.barrierHP > 0
        );

        if (barrierBuff) {
          const absorbed = Math.min(damage, barrierBuff.payload.barrierHP);
          barrierBuff.payload.barrierHP -= absorbed;
          damage -= absorbed;

          // Remove barrier if depleted
          if (barrierBuff.payload.barrierHP <= 0) {
            defender.statusEffects = defender.statusEffects.filter(se => se !== barrierBuff);
          }
        }
      }

      // Ensure minimum damage of 1 (unless fully blocked)
      const finalDamage = Math.max(0, Math.floor(damage));

      console.log(`[Combat] Damage calculated:`, {
        attacker: attacker.name,
        defender: defender.name,
        multiplier: mult,
        effectiveAtk,
        effectiveDef,
        rawDamage: damage,
        finalDamage: finalDamage > 0 ? Math.max(1, finalDamage) : 0,
        isCritical,
        attackerBuffs,
        defenderBuffs
      });

      return {
        damage: finalDamage > 0 ? Math.max(1, finalDamage) : 0,
        isCritical
      };
    },

    /* ===== Basic Attack ===== */

    /**
     * Perform basic attack (single target)
     * Awards 1 chakra on hit
     */
    performAttack(attacker, target, core) {
      console.log(`[Combat] ${attacker.name} attacks ${target.name}`);

      // Narrate action
      if (window.BattleNarrator) {
        window.BattleNarrator.narrateAttack(attacker, target, core);
      }

      const {damage, isCritical} = this.calculateDamage(attacker, target, 1.0);
      target.stats.hp = Math.max(0, target.stats.hp - damage);

      // Award chakra for attacking
      if (core.chakra) {
        core.chakra.addChakra(attacker, 1, core);
      } else {
        attacker.chakra = Math.min(attacker.maxChakra, attacker.chakra + 1);
      }

      // Show damage animation
      if (window.BattleAnimations) {
        window.BattleAnimations.showDamage(target, damage, isCritical, core.dom);
      }

      // Update displays
      if (core.units) {
        core.units.updateUnitDisplay(attacker, core);
        core.units.updateUnitDisplay(target, core);
      } else {
        core.updateUnitDisplay(attacker);
        core.updateUnitDisplay(target);
      }

      core.updateTeamHP();
      core.checkBattleEnd();
    },

    /* ===== Jutsu (Single Target Skill) ===== */

    /**
     * Perform jutsu skill on single target
     * Costs chakra, has multiplier
     * @returns {boolean} Success status
     */
    performJutsu(attacker, target, core) {
      const skills = this.getUnitSkills(attacker);
      const j = skills.jutsu;

      if (!j) {
        console.warn(`[Combat] ${attacker.name} has no jutsu skill`);
        return false;
      }

      // Check if jutsu is unlocked
      if (!this.isJutsuUnlocked(attacker)) {
        const level = this.getUnitLevel(attacker);
        console.warn(`[Combat] ${attacker.name}'s jutsu is locked (Level ${level}/20)`);
        if (window.BattleNarrator) {
          window.BattleNarrator.narrate(`${attacker.name}'s jutsu is locked! Requires Level 20.`, core);
        }
        return false;
      }

      const cost = Number(j.data.chakraCost ?? 4);

      // Check and spend chakra
      if (core.chakra) {
        if (!core.chakra.spendChakra(attacker, cost, core)) {
          return false;
        }
      } else {
        if (attacker.chakra < cost) return false;
        attacker.chakra -= cost;
      }

      // Get multiplier from skill data
      let mult = 2.0;
      const m = String(j.data.multiplier || "").match(/([\d.]+)x/i);
      if (m) mult = Number(m[1] || "2.0");

      console.log(`[Combat] ${attacker.name} uses ${j.meta.name} (${mult}x) on ${target.name}`);

      // Narrate action
      if (window.BattleNarrator) {
        window.BattleNarrator.narrateJutsu(attacker, target, core);
      }

      // Play animation
      const animGif = j.data.animationGif || attacker._ref?.base?.jutsuAnimation;
      if (window.BattleAnimations) {
        window.BattleAnimations.playSkillAnimation(attacker, "jutsu", animGif, core.dom);
      }

      // Calculate and apply damage
      const {damage, isCritical} = this.calculateDamage(attacker, target, mult);
      target.stats.hp = Math.max(0, target.stats.hp - damage);

      // Show damage after animation delay
      setTimeout(() => {
        if (window.BattleAnimations) {
          window.BattleAnimations.showDamage(target, damage, isCritical, core.dom);
        }
      }, 400);

      // Update displays
      if (core.units) {
        core.units.updateUnitDisplay(attacker, core);
        core.units.updateUnitDisplay(target, core);
      } else {
        core.updateUnitDisplay(attacker);
        core.updateUnitDisplay(target);
      }

      core.updateTeamHP();

      // Check battle end after animation
      setTimeout(() => core.checkBattleEnd(), 600);

      return true;
    },

    /* ===== Ultimate (Multi-Target Skill) ===== */

    /**
     * Perform ultimate skill on multiple targets
     * Costs more chakra, hits all enemies
     * @returns {boolean} Success status
     */
    performUltimate(attacker, targets, core) {
      const skills = this.getUnitSkills(attacker);
      const u = skills.ultimate;

      if (!u) {
        console.warn(`[Combat] ${attacker.name} has no ultimate skill`);
        return false;
      }

      // Check if ultimate is unlocked
      if (!this.isUltimateUnlocked(attacker)) {
        const level = this.getUnitLevel(attacker);
        console.warn(`[Combat] ${attacker.name}'s ultimate is locked (Level ${level}/50)`);
        if (window.BattleNarrator) {
          window.BattleNarrator.narrate(`${attacker.name}'s ultimate is locked! Requires Level 50.`, core);
        }
        return false;
      }

      const cost = Number(u.data.chakraCost ?? 8);

      // Check and spend chakra
      if (core.chakra) {
        if (!core.chakra.spendChakra(attacker, cost, core)) {
          return false;
        }
      } else {
        if (attacker.chakra < cost) return false;
        attacker.chakra -= cost;
      }

      // Get multiplier
      let mult = 1.5;
      const m = String(u.data.multiplier || "").match(/([\d.]+)x/i);
      if (m) mult = Number(m[1] || "1.5");

      console.log(`[Combat] ${attacker.name} uses ${u.meta.name} (${mult}x) on ${targets.length} targets`);

      // Narrate action
      if (window.BattleNarrator) {
        window.BattleNarrator.narrateUltimate(attacker, targets, core);
      }

      // Play animation
      const animGif = u.data.animationGif || attacker._ref?.base?.ultimateAnimation;
      if (window.BattleAnimations) {
        window.BattleAnimations.playSkillAnimation(attacker, "ultimate", animGif, core.dom);
      }

      // Hit all targets with delay
      targets.forEach((target, i) => {
        setTimeout(() => {
          const {damage, isCritical} = this.calculateDamage(attacker, target, mult);
          target.stats.hp = Math.max(0, target.stats.hp - damage);

          setTimeout(() => {
            if (window.BattleAnimations) {
              window.BattleAnimations.showDamage(target, damage, isCritical, core.dom);
            }
          }, 150);

          if (core.units) {
            core.units.updateUnitDisplay(target, core);
          } else {
            core.updateUnitDisplay(target);
          }
        }, i * 200);
      });

      // Update attacker
      if (core.units) {
        core.units.updateUnitDisplay(attacker, core);
      } else {
        core.updateUnitDisplay(attacker);
      }

      core.updateTeamHP();

      // Check battle end after all hits
      setTimeout(() => core.checkBattleEnd(), targets.length * 200 + 700);

      return true;
    },

    /* ===== Multi-Hit Attacks ===== */

    /**
     * Perform multi-target basic attack
     * Used for AoE basic attacks
     */
    performMultiAttack(attacker, targets, core) {
      console.log(`[Combat] ${attacker.name} multi-attacks ${targets.length} enemies`);

      targets.forEach((target, i) => {
        setTimeout(() => {
          const {damage, isCritical} = this.calculateDamage(attacker, target, 1.0);
          target.stats.hp = Math.max(0, target.stats.hp - damage);

          if (window.BattleAnimations) {
            window.BattleAnimations.showDamage(target, damage, isCritical, core.dom);
          }

          if (core.units) {
            core.units.updateUnitDisplay(target, core);
          } else {
            core.updateUnitDisplay(target);
          }
        }, i * 150);
      });

      // Award chakra for multi-hit
      if (core.chakra) {
        core.chakra.addChakra(attacker, 1, core);
      } else {
        attacker.chakra = Math.min(attacker.maxChakra, attacker.chakra + 1);
      }

      if (core.units) {
        core.units.updateUnitDisplay(attacker, core);
      } else {
        core.updateUnitDisplay(attacker);
      }

      setTimeout(() => {
        core.updateTeamHP();
        core.checkBattleEnd();
      }, targets.length * 150 + 300);
    },

    /**
     * Perform multi-target jutsu
     * Used for AoE jutsu skills
     * @returns {boolean} Success status
     */
    performMultiJutsu(attacker, targets, core) {
      const skills = this.getUnitSkills(attacker);
      const j = skills.jutsu;

      if (!j) return false;

      const cost = Number(j.data.chakraCost ?? 4);

      // Check and spend chakra
      if (core.chakra) {
        if (!core.chakra.spendChakra(attacker, cost, core)) {
          return false;
        }
      } else {
        if (attacker.chakra < cost) return false;
        attacker.chakra -= cost;
      }

      // Get multiplier
      let mult = 2.0;
      const m = String(j.data.multiplier || "").match(/([\d.]+)x/i);
      if (m) mult = Number(m[1] || "2.0");

      console.log(`[Combat] ${attacker.name} multi-jutsu ${targets.length} enemies`);

      // Play animation
      const animGif = j.data.animationGif || attacker._ref?.base?.jutsuAnimation;
      if (window.BattleAnimations) {
        window.BattleAnimations.playSkillAnimation(attacker, "jutsu", animGif, core.dom);
      }

      // Hit all targets
      targets.forEach((target, i) => {
        setTimeout(() => {
          const {damage, isCritical} = this.calculateDamage(attacker, target, mult);
          target.stats.hp = Math.max(0, target.stats.hp - damage);

          setTimeout(() => {
            if (window.BattleAnimations) {
              window.BattleAnimations.showDamage(target, damage, isCritical, core.dom);
            }
          }, 150);

          if (core.units) {
            core.units.updateUnitDisplay(target, core);
          } else {
            core.updateUnitDisplay(target);
          }
        }, i * 200 + 400);
      });

      if (core.units) {
        core.units.updateUnitDisplay(attacker, core);
      } else {
        core.updateUnitDisplay(attacker);
      }

      setTimeout(() => {
        core.updateTeamHP();
        core.checkBattleEnd();
      }, targets.length * 200 + 800);

      return true;
    },

    /* ===== Guard Action ===== */

    /**
     * Perform guard action
     * Reduces incoming damage by 50% until next turn
     * Awards 2 chakra
     */
    performGuard(unit, core) {
      console.log(`[Combat] ${unit.name} guards`);

      unit.isGuarding = true;

      // Award chakra for guarding
      if (core.chakra) {
        core.chakra.addChakra(unit, 2, core);
      } else {
        unit.chakra = Math.min(unit.maxChakra, unit.chakra + 2);
      }

      if (core.units) {
        core.units.updateUnitDisplay(unit, core);
      } else {
        core.updateUnitDisplay(unit);
      }
    },

    /* ===== AI Combat Logic ===== */

    /**
     * Perform AI turn action selection
     * AI chooses between attack, jutsu, ultimate, or guard
     */
    performAITurn(unit, core) {
      const targets = (unit.isPlayer ? core.enemyTeam : core.activeTeam).filter(u => u.stats.hp > 0);
      if (targets.length === 0) return;

      const target = targets[Math.floor(Math.random() * targets.length)];
      const skills = this.getUnitSkills(unit);

      // Check if ultimate is available and random chance
      const preferUlt = skills.ultimate &&
                       unit.chakra >= Number(skills.ultimate.data.chakraCost ?? 8) &&
                       Math.random() > 0.7;

      // Check if jutsu is available and random chance
      const preferJut = skills.jutsu &&
                       unit.chakra >= Number(skills.jutsu.data.chakraCost ?? 4) &&
                       Math.random() > 0.5;

      // Execute chosen action
      if (preferUlt) {
        this.performUltimate(unit, targets, core);
      } else if (preferJut) {
        this.performJutsu(unit, target, core);
      } else if (unit.stats.hp < unit.stats.maxHP * 0.3 && Math.random() > 0.6) {
        // Guard if low HP
        this.performGuard(unit, core);
      } else {
        // Default to basic attack
        this.performAttack(unit, target, core);
      }
    },

    /* ===== Utility Functions ===== */

    /**
     * Get skill cost for unit
     */
    getSkillCost(unit, skillType) {
      const skills = this.getUnitSkills(unit);

      if (skillType === "jutsu" && skills.jutsu) {
        return Number(skills.jutsu.data.chakraCost ?? 4);
      } else if (skillType === "ultimate" && skills.ultimate) {
        return Number(skills.ultimate.data.chakraCost ?? 8);
      }

      return 0;
    },

    /**
     * Check if unit can use skill
     */
    canUseSkill(unit, skillType) {
      const cost = this.getSkillCost(unit, skillType);
      return unit.chakra >= cost;
    },

    /**
     * Get damage preview (without applying)
     */
    previewDamage(attacker, defender, multiplier = 1) {
      return this.calculateDamage(attacker, defender, multiplier);
    },

    /**
     * Apply status effect (for future expansion)
     */
    applyStatusEffect(target, effect, core) {
      if (!target.statusEffects) {
        target.statusEffects = [];
      }

      target.statusEffects.push(effect);
      console.log(`[Combat] ${target.name} afflicted with ${effect.type}`);
    },

    /**
     * Remove status effect
     */
    removeStatusEffect(target, effectType) {
      if (!target.statusEffects) return;

      target.statusEffects = target.statusEffects.filter(e => e.type !== effectType);
      console.log(`[Combat] ${target.name} recovered from ${effectType}`);
    },

    /**
     * Get effective multiplier with all bonuses
     */
    getEffectiveMultiplier(attacker, base = 1.0) {
      let mult = base;

      // Add status effect bonuses
      if (attacker.statusEffects) {
        attacker.statusEffects.forEach(effect => {
          if (effect.type === "ATK_BOOST") {
            mult *= 1.5;
          }
        });
      }

      return mult;
    }
  };

  // Export to window
  window.BattleCombat = BattleCombat;

  console.log("[BattleCombat] Module loaded ✅");
})();
