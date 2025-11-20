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
     * Get all skills for unit (jutsu + ultimate + secret)
     */
    getUnitSkills(unit) {
      const base = unit._ref?.base;
      const tier = this.getTierForUnit(unit);
      if (!base?.skills) return { tier, jutsu: null, ultimate: null, secret: null };

      const j = base.skills.jutsu ? this.getSkillEntry(base.skills.jutsu, tier) : null;
      const u = base.skills.ultimate ? this.getSkillEntry(base.skills.ultimate, tier) : null;
      const s = base.skills.secret ? this.getSkillEntry(base.skills.secret, tier) : null;

      return {
        tier,
        jutsu: j ? { meta: base.skills.jutsu, data: j } : null,
        ultimate: u ? { meta: base.skills.ultimate, data: u } : null,
        secret: s ? { meta: base.skills.secret, data: s } : null
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

      // Get passive ability modifiers from BattlePassives
      const attackerPassives = window.BattlePassives?.getActiveModifiers?.(attacker) || {
        atkFlat: 0,
        critRatePercent: 0,
        critDmgPercent: 0,
        jutsuDamagePercent: 0
      };

      const defenderPassives = window.BattlePassives?.getActiveModifiers?.(defender) || {
        defFlat: 0,
        damageReductionPercent: 0
      };

      // Base stats with validation
      const baseAtk = Math.max(0, Number(attacker.stats.atk) || 100);
      const baseDef = Math.max(0, Number(defender.stats.def) || 0);

      // Apply buff and passive modifiers to stats
      const effectiveAtk = baseAtk + attackerBuffs.atkFlat + attackerPassives.atkFlat;
      const effectiveDef = baseDef + defenderBuffs.defFlat + defenderPassives.defFlat;

      // Base damage from ATK stat and multiplier
      let damage = effectiveAtk * mult;

      // Subtract defender's DEF (50% effectiveness)
      damage -= effectiveDef * 0.5;

      // Guard reduces damage by 50%
      if (defender.isGuarding) {
        damage *= 0.5;
      }

      // Apply damage reduction from buffs and passives
      const totalDamageReduction = defenderBuffs.damageReductionPercent + defenderPassives.damageReductionPercent;
      if (totalDamageReduction > 0) {
        damage *= (1 - totalDamageReduction / 100);
      }

      // Random variance (90% - 110%)
      damage *= (0.9 + Math.random() * 0.2);

      // Critical hit chance (15% base + buff bonus + passive bonus)
      const critChance = 0.15 + (attackerBuffs.critRatePercent / 100) + (attackerPassives.critRatePercent / 100);
      const isCritical = Math.random() < critChance;

      if (isCritical) {
        // Critical damage multiplier (1.5x base + buff bonus + passive bonus)
        const critMultiplier = 1.5 + (attackerBuffs.critDmgPercent / 100) + (attackerPassives.critDmgPercent / 100);
        damage *= critMultiplier;
      }

      // Apply barrier absorption
      if (defenderBuffs.barrierHP > 0) {
        // Find barrier buff in defender's status effects
        const barrierBuff = defender.statusEffects?.find(se =>
          se.kind === 'buff' && se.payload?.barrierHP > 0
        );

        // Bug #9: Validate payload exists before accessing
        if (barrierBuff && barrierBuff.payload && barrierBuff.payload.barrierHP > 0) {
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

      const defReduction = Math.floor(effectiveDef * 0.5);

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
        isCritical,
        breakdown: {
          atk: Math.floor(effectiveAtk),
          multiplier: mult.toFixed(1),
          defReduction: defReduction,
          guard: defender.isGuarding,
          critical: isCritical,
          critMultiplier: isCritical ? (1.5 + (attackerBuffs.critDmgPercent / 100)).toFixed(2) : null
        }
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

      const {damage, isCritical, breakdown} = this.calculateDamage(attacker, target, 1.0);
      target.stats.hp = Math.max(0, target.stats.hp - damage);

      // Apply knockback
      if (window.BattlePhysics) {
        window.BattlePhysics.applyKnockback(target, attacker, 30, core);
      }

      // Award chakra for attacking
      if (core.chakra) {
        core.chakra.addChakra(attacker, 1, core);
      } else {
        attacker.chakra = Math.min(attacker.maxChakra, attacker.chakra + 1);
      }

      // Track basic attack for Last Stand Ultimate system
      if (window.BattleEquippedUltimate) {
        window.BattleEquippedUltimate.onBasicAttack(attacker.id);
      }

      // Show damage animation with breakdown
      if (window.BattleAnimations) {
        window.BattleAnimations.showDamage(target, damage, isCritical, core.dom, false, breakdown);
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

      // Delay battle end check to allow HP bar animation to complete
      setTimeout(() => {
        core.checkBattleEnd();
      }, 400);
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

      // Reset basic attack count when using ninjutsu
      if (window.BattleEquippedUltimate) {
        window.BattleEquippedUltimate.onNinjutsuUse(attacker.id);
      }

      // Get multiplier from skill data
      let mult = 2.0;
      const m = String(j.data.multiplier || "").match(/([\d.]+)x/i);
      // Bug #2: Check if match exists and has captured group
      if (m && m[1]) mult = Number(m[1]) || 2.0;

      console.log(`[Combat] ${attacker.name} uses ${j.meta.name} (${mult}x) on ${target.name}`);

      // Display attack name BEFORE animation (Storm 4 style)
      if (window.BattleAttackNames) {
        const attackName = j.data.name || j.data.skillName || j.meta.name;
        window.BattleAttackNames.showAttackName(attackName, 'jutsu');
      }

      // Narrate action
      if (window.BattleNarrator) {
        window.BattleNarrator.narrateJutsu(attacker, target, core);
      }

      // Wait 700ms for attack name to breathe before playing animation
      setTimeout(() => {
        // Play animation
        const animGif = j.data.animationGif || attacker._ref?.base?.jutsuAnimation;
        if (window.BattleAnimations) {
          window.BattleAnimations.playSkillAnimation(attacker, "jutsu", animGif, core.dom);
        }
      }, 700);

      // Calculate and apply damage
      const {damage, isCritical, breakdown} = this.calculateDamage(attacker, target, mult);
      target.stats.hp = Math.max(0, target.stats.hp - damage);

      // Apply knockback after animation
      setTimeout(() => {
        if (window.BattlePhysics) {
          window.BattlePhysics.applyKnockback(target, attacker, 50, core);
        }
      }, 300);

      // Show damage after animation delay
      setTimeout(() => {
        if (window.BattleAnimations) {
          window.BattleAnimations.showDamage(target, damage, isCritical, core.dom, false, breakdown);
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
      // Bug #2: Check if match exists and has captured group
      if (m && m[1]) mult = Number(m[1]) || 1.5;

      console.log(`[Combat] ${attacker.name} uses ${u.meta.name} (${mult}x) on ${targets.length} targets`);

      // Display attack name BEFORE animation (Storm 4 style)
      if (window.BattleAttackNames) {
        const attackName = u.data.name || u.data.skillName || u.meta.name;
        window.BattleAttackNames.showAttackName(attackName, 'ultimate');
      }

      // Narrate action
      if (window.BattleNarrator) {
        window.BattleNarrator.narrateUltimate(attacker, targets, core);
      }

      // Wait 700ms for attack name to breathe before playing animation
      setTimeout(() => {
        // Play animation
        const animGif = u.data.animationGif || attacker._ref?.base?.ultimateAnimation;
        if (window.BattleAnimations) {
          window.BattleAnimations.playSkillAnimation(attacker, "ultimate", animGif, core.dom);
        }
      }, 700);

      // Hit all targets with delay
      targets.forEach((target, i) => {
        setTimeout(() => {
          const {damage, isCritical, breakdown} = this.calculateDamage(attacker, target, mult);
          target.stats.hp = Math.max(0, target.stats.hp - damage);

          // Check if this defeats the final enemy (trigger shockwave + screen shake)
          const remainingEnemies = core.enemyTeam.filter(e => e.stats.hp > 0).length;
          const shouldFinish = window.BattleFinish?.shouldTriggerFinish(target, remainingEnemies, true);

          if (shouldFinish) {
            // Trigger finish effects (shockwave + screen shake, NO text)
            setTimeout(() => {
              if (window.BattleFinish) {
                window.BattleFinish.playFinishEffects(attacker, target, core);
              }
            }, 300);
          }

          // Apply knockback for ultimate
          if (window.BattlePhysics) {
            window.BattlePhysics.applyKnockback(target, attacker, 60, core);
          }

          setTimeout(() => {
            if (window.BattleAnimations) {
              window.BattleAnimations.showDamage(target, damage, isCritical, core.dom, false, breakdown);
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
          const {damage, isCritical, breakdown} = this.calculateDamage(attacker, target, 1.0);
          target.stats.hp = Math.max(0, target.stats.hp - damage);

          // Apply knockback
          if (window.BattlePhysics) {
            window.BattlePhysics.applyKnockback(target, attacker, 35, core);
          }

          if (window.BattleAnimations) {
            window.BattleAnimations.showDamage(target, damage, isCritical, core.dom, false, breakdown);
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

      // Track basic attack for Last Stand Ultimate system
      if (window.BattleEquippedUltimate) {
        window.BattleEquippedUltimate.onBasicAttack(attacker.id);
      }

      if (core.units) {
        core.units.updateUnitDisplay(attacker, core);
      } else {
        core.updateUnitDisplay(attacker);
      }

      setTimeout(() => {
        core.updateTeamHP();
        // Delay battle end check to allow HP bar animation to complete
        setTimeout(() => {
          core.checkBattleEnd();
        }, 400);
      }, targets.length * 150 + 300);
    },

    /**
     * Perform proximity combo attack
     * Hits nearby enemies with basic attacks as a combo
     */
    performProximityCombo(attacker, targets, core) {
      if (targets.length === 0) return;

      console.log(`[Combat] ${attacker.name} proximity combo on ${targets.length} targets`);

      // Narrate the combo
      if (window.BattleNarrator) {
        window.BattleNarrator.narrate(`${attacker.name} triggers proximity combo!`, core);
      }

      targets.forEach((target, i) => {
        setTimeout(() => {
          const {damage, isCritical, breakdown} = this.calculateDamage(attacker, target, 0.6); // 60% damage for combo
          target.stats.hp = Math.max(0, target.stats.hp - damage);

          // Apply knockback
          if (window.BattlePhysics) {
            window.BattlePhysics.applyKnockback(target, attacker, 40, core);
          }

          if (window.BattleAnimations) {
            window.BattleAnimations.showDamage(target, damage, isCritical, core.dom, false, breakdown);
            // Show combo indicator
            setTimeout(() => {
              const comboText = document.createElement('div');
              comboText.textContent = 'COMBO!';
              comboText.style.position = 'absolute';
              comboText.style.fontSize = '1.2rem';
              comboText.style.fontWeight = 'bold';
              comboText.style.color = '#ffaa00';
              comboText.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
              comboText.style.zIndex = '500';
              comboText.style.pointerEvents = 'none';
              comboText.style.animation = 'damageFloat 0.8s ease-out forwards';

              const unitEl = core.dom.scene?.querySelector(`[data-unit-id="${target.id}"]`);
              if (unitEl && core.dom.damageLayer) {
                const rect = unitEl.getBoundingClientRect();
                const sceneRect = core.dom.scene.getBoundingClientRect();
                comboText.style.left = `${rect.left - sceneRect.left + rect.width / 2}px`;
                comboText.style.top = `${rect.top - sceneRect.top - 30}px`;
                comboText.style.transform = 'translate(-50%, -100%)';
                core.dom.damageLayer.appendChild(comboText);
                setTimeout(() => comboText.remove(), 800);
              }
            }, 100);
          }

          if (core.units) {
            core.units.updateUnitDisplay(target, core);
          } else {
            core.updateUnitDisplay(target);
          }
        }, i * 120);
      });

      setTimeout(() => {
        core.updateTeamHP();
        // Delay battle end check to allow HP bar animation to complete
        setTimeout(() => {
          core.checkBattleEnd();
        }, 400);
      }, targets.length * 120 + 200);
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

      // Reset basic attack count when using ninjutsu
      if (window.BattleEquippedUltimate) {
        window.BattleEquippedUltimate.onNinjutsuUse(attacker.id);
      }

      // Get multiplier
      let mult = 2.0;
      const m = String(j.data.multiplier || "").match(/([\d.]+)x/i);
      // Bug #2: Check if match exists and has captured group
      if (m && m[1]) mult = Number(m[1]) || 2.0;

      console.log(`[Combat] ${attacker.name} multi-jutsu ${targets.length} enemies`);

      // Play animation
      const animGif = j.data.animationGif || attacker._ref?.base?.jutsuAnimation;
      if (window.BattleAnimations) {
        window.BattleAnimations.playSkillAnimation(attacker, "jutsu", animGif, core.dom);
      }

      // Hit all targets
      targets.forEach((target, i) => {
        setTimeout(() => {
          const {damage, isCritical, breakdown} = this.calculateDamage(attacker, target, mult);
          target.stats.hp = Math.max(0, target.stats.hp - damage);

          // Apply knockback for multi-jutsu
          if (window.BattlePhysics) {
            window.BattlePhysics.applyKnockback(target, attacker, 45, core);
          }

          setTimeout(() => {
            if (window.BattleAnimations) {
              window.BattleAnimations.showDamage(target, damage, isCritical, core.dom, false, breakdown);
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

    /* ===== Secret Technique (Team Buff) ===== */

    /**
     * Perform secret technique - buffs all allies
     * Only available for 6S+ tier characters
     * @param {Object} caster - Unit casting secret technique
     * @param {Object} core - BattleCore reference
     * @returns {boolean} Success status
     */
    performSecret(caster, core) {
      const skills = this.getUnitSkills(caster);
      const secret = skills.secret;

      if (!secret) {
        console.warn(`[Combat] ${caster.name} has no secret technique`);
        return false;
      }

      // Check if secret is unlocked (6S+ tier)
      if (!this.isSecretUnlocked(caster)) {
        const tier = this.getTierForUnit(caster);
        console.warn(`[Combat] ${caster.name}'s secret is locked (Tier ${tier}, requires 6S+)`);
        if (window.BattleNarrator) {
          window.BattleNarrator.narrate(`${caster.name}'s secret technique is locked! Requires 6★ or higher.`, core);
        }
        return false;
      }

      const cost = Number(secret.data.chakraCost ?? 12);

      // Check and spend chakra
      if (core.chakra) {
        if (!core.chakra.spendChakra(caster, cost, core)) {
          return false;
        }
      } else {
        if (caster.chakra < cost) {
          console.warn(`[Combat] ${caster.name} not enough chakra (has ${caster.chakra}, needs ${cost})`);
          return false;
        }
        caster.chakra -= cost;
      }

      console.log(`[Combat] ${caster.name} uses SECRET: ${secret.meta.name}`);

      // Display attack name BEFORE effects apply (Storm 4 style)
      if (window.BattleAttackNames) {
        const attackName = secret.data.name || secret.data.skillName || secret.meta.name;
        window.BattleAttackNames.showAttackName(attackName, 'secret');
      }

      // Narrate action
      if (window.BattleNarrator) {
        window.BattleNarrator.showAction(secret.meta.name, "secret", core.dom);
      }

      // Get effects from secret technique
      const effects = secret.data.effects;

      if (!effects) {
        console.warn(`[Combat] No effects defined for ${secret.meta.name}`);
        return false;
      }

      // Determine targets based on effects.target
      let targets = [];
      if (effects.target === "allAllies") {
        targets = core.activeTeam.filter(u => u.stats.hp > 0);
      } else if (effects.target === "self") {
        targets = [caster];
      } else {
        // Default to all allies
        targets = core.activeTeam.filter(u => u.stats.hp > 0);
      }

      console.log(`[Combat] Applying ${secret.meta.name} buffs to ${targets.length} allies`);

      // Apply buffs to all targets using BattleBuffs system
      if (window.BattleBuffs) {
        window.BattleBuffs.applyBuffEffects(core, caster, targets, effects, "secret");
      }

      // Show visual effect for buff application
      if (window.BattleAnimations) {
        targets.forEach((target, i) => {
          setTimeout(() => {
            // Show buff indicator
            const buffText = document.createElement('div');
            buffText.textContent = '▲ BUFFED!';
            buffText.style.cssText = `
              position: absolute;
              font-size: 1.5rem;
              font-weight: bold;
              color: #5efc82;
              text-shadow: 0 0 10px rgba(94, 252, 130, 0.8);
              pointer-events: none;
              z-index: 1000;
              animation: floatUp 1.5s ease-out forwards;
            `;

            const unitEl = core.dom.scene?.querySelector(`[data-unit-id="${target.id}"]`);
            if (unitEl) {
              unitEl.appendChild(buffText);
              setTimeout(() => buffText.remove(), 1500);
            }
          }, i * 150);
        });
      }

      // Update displays
      targets.forEach(target => {
        if (core.units) {
          core.units.updateUnitDisplay(target, core);
        } else {
          core.updateUnitDisplay(target);
        }
      });

      if (core.units) {
        core.units.updateUnitDisplay(caster, core);
      } else {
        core.updateUnitDisplay(caster);
      }

      return true;
    },

    /**
     * Get secret technique for unit
     */
    getSecretTechnique(unit) {
      const base = unit._ref?.base;
      const tier = this.getTierForUnit(unit);
      if (!base?.skills?.secret) return null;

      const s = this.getSkillEntry(base.skills.secret, tier);
      return s ? { meta: base.skills.secret, data: s } : null;
    },

    /* ===== AI Combat Logic ===== */

    /**
     * Perform AI turn action selection
     * AI chooses between attack, jutsu, ultimate, or guard
     */
    performAITurn(unit, core) {
      console.log(`[Combat] AI Turn for ${unit.name} (isPlayer: ${unit.isPlayer})`);

      const targets = (unit.isPlayer ? core.enemyTeam : core.activeTeam).filter(u => u.stats.hp > 0);

      console.log(`[Combat] AI found ${targets.length} valid targets:`, targets.map(t => t.name));

      if (targets.length === 0) {
        console.warn("[Combat] No valid targets for AI turn!");
        return;
      }

      const target = targets[Math.floor(Math.random() * targets.length)];
      const skills = this.getUnitSkills(unit);

      console.log(`[Combat] AI selected target: ${target.name}, has skills:`, {
        jutsu: !!skills.jutsu,
        ultimate: !!skills.ultimate
      });

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
        console.log("[Combat] AI using ultimate");
        this.performUltimate(unit, targets, core);
      } else if (preferJut) {
        console.log("[Combat] AI using jutsu");
        this.performJutsu(unit, target, core);
      } else if (unit.stats.hp < unit.stats.maxHP * 0.3 && Math.random() > 0.6) {
        // Guard if low HP
        console.log("[Combat] AI guarding");
        this.performGuard(unit, core);
      } else {
        // Default to basic attack
        console.log("[Combat] AI attacking");
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
