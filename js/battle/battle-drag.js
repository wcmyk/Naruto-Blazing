// js/battle/battle-drag.js - Drag & Drop Targeting System
(() => {
  "use strict";

  /**
   * BattleDrag Module
   * Handles drag & drop mechanics for positioning and targeting
   *
   * Features:
   * - Active unit dragging
   * - Targeting overlay visualization
   * - Multi-target area attacks
   * - Drag-to-cast mechanics
   * - Position updates
   * - Visual targeting markers
   * - Proximity combo detection
   */
  const BattleDrag = {
    // ===== State =====
    draggingUnit: null,
    dragStartPos: null,
    dragAction: null,
    isDragging: false,
    currentTargets: [], // Track currently targeted units
    targetMarkers: new Map(), // Store target marker elements

    /* ===== Targeting Markers ===== */

    /**
     * Create a targeting marker on a unit
     */
    createTargetMarker(unit, core) {
      const unitEl = core.dom.scene?.querySelector(`[data-unit-id="${unit.id}"]`);
      if (!unitEl) return null;

      // Remove existing marker if present
      this.removeTargetMarker(unit);

      const marker = document.createElement('div');
      marker.className = 'target-marker';
      marker.style.position = 'absolute';
      marker.style.top = '-5px';
      marker.style.left = '-5px';
      marker.style.right = '-5px';
      marker.style.bottom = '-5px';
      marker.style.border = '3px solid #ff4444';
      marker.style.borderRadius = '12px';
      marker.style.boxShadow = '0 0 20px #ff4444, inset 0 0 20px rgba(255, 68, 68, 0.3)';
      marker.style.pointerEvents = 'none';
      marker.style.zIndex = '15';
      marker.style.animation = 'targetPulse 1s ease-in-out infinite';

      unitEl.appendChild(marker);
      this.targetMarkers.set(unit.id, marker);

      return marker;
    },

    /**
     * Remove targeting marker from unit
     */
    removeTargetMarker(unit) {
      const marker = this.targetMarkers.get(unit.id);
      if (marker) {
        marker.remove();
        this.targetMarkers.delete(unit.id);
      }
    },

    /**
     * Clear all target markers
     */
    clearAllTargetMarkers() {
      this.targetMarkers.forEach(marker => marker.remove());
      this.targetMarkers.clear();
      this.currentTargets = [];
    },

    /**
     * Update target markers based on current drag position
     */
    updateTargetMarkers(x, y, core) {
      if (!this.isDragging || !this.draggingUnit) return;

      const targets = this.findUnitsInRange(x, y, this.dragAction, core);

      // Clear markers for units no longer targeted
      this.currentTargets.forEach(target => {
        if (!targets.includes(target)) {
          this.removeTargetMarker(target);
        }
      });

      // Add markers for newly targeted units
      targets.forEach(target => {
        if (!this.currentTargets.includes(target)) {
          this.createTargetMarker(target, core);
        }
      });

      this.currentTargets = targets;
    },

    /* ===== Targeting Overlay ===== */

    /**
     * Create targeting canvas overlay
     */
    makeOverlay(root) {
      let canvas = document.getElementById("battle-targeting");
      if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.id = "battle-targeting";
        canvas.style.position = "absolute";
        canvas.style.inset = "0";
        canvas.style.pointerEvents = "none";
        canvas.style.zIndex = "100";
        root.appendChild(canvas);
      }

      const fit = () => {
        const r = root.getBoundingClientRect();
        canvas.width = r.width;
        canvas.height = r.height;
      };
      fit();
      window.addEventListener("resize", fit);

      const ctx = canvas.getContext("2d");
      return {
        clear() { ctx.clearRect(0, 0, canvas.width, canvas.height); },
        draw(shape, color, args, origin) {
          const c = color === "ultimate" ? "#ff4d4d" : "#58b7ff";
          ctx.save();
          ctx.lineWidth = 3;
          ctx.strokeStyle = c;
          ctx.globalAlpha = 0.9;
          ctx.shadowColor = c;
          ctx.shadowBlur = 16;
          ctx.beginPath();

          if (shape === "circle") {
            const r = args?.radius ?? 140;
            ctx.arc(origin.x, origin.y, r, 0, Math.PI * 2);
          } else if (shape === "rect") {
            const w = args?.w ?? 320, h = args?.h ?? 140;
            ctx.rect(origin.x - w / 2, origin.y - h / 2, w, h);
          } else if (shape === "line") {
            const len = args?.length ?? 360, w = args?.width ?? 28;
            ctx.rect(origin.x, origin.y - w / 2, len, w);
          } else if (shape === "sector") {
            const r = args?.radius ?? 260;
            const a = ((args?.angleDeg ?? 90) * Math.PI) / 180;
            ctx.moveTo(origin.x, origin.y);
            ctx.arc(origin.x, origin.y, r, -a / 2, a / 2);
            ctx.closePath();
          }

          ctx.stroke();
          ctx.restore();
        },
      };
    },

    /* ===== Drag Handlers ===== */

    /**
     * Handle drag start for active unit
     */
    handleActiveDragStart(e, unit, core) {
      // Only allow drag if it's this unit's turn
      if (core.turns && core.turns.currentUnit !== unit) return;

      this.draggingUnit = unit;
      this.dragStartPos = { ...unit.pos };
      this.isDragging = true;

      // Determine action based on queued action
      if (core.queuedAction === "attack") {
        this.dragAction = "attack";
      } else if (core.queuedAction === "jutsu") {
        this.dragAction = "jutsu";
      } else if (core.queuedAction === "ultimate") {
        this.dragAction = "ultimate";
      } else {
        this.dragAction = "move";
      }

      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", unit.id);
      e.currentTarget.style.opacity = "0.7";

      console.log(`[Drag] Dragging ${unit.name}, action: ${this.dragAction}`);
    },

    /**
     * Handle scene drag over
     */
    handleSceneDragOver(e, core) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";

      if (!this.isDragging || !this.draggingUnit) return;

      const rect = core.dom.scene.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Show targeting preview for combat actions
      if (this.dragAction === "attack" || this.dragAction === "jutsu" || this.dragAction === "ultimate") {
        this.showDragTargetingPreview(x, y, core);
        this.updateTargetMarkers(x, y, core);
      }
    },

    /**
     * Handle scene drop
     */
    handleSceneDrop(e, core) {
      e.preventDefault();

      if (!this.isDragging || !this.draggingUnit) return;

      const rect = core.dom.scene.getBoundingClientRect();
      const dropX = e.clientX - rect.left;
      const dropY = e.clientY - rect.top;

      const dropXPercent = (dropX / rect.width) * 100;
      const dropYPercent = (dropY / rect.height) * 100;

      console.log(`[Drag] Drop at (${dropXPercent.toFixed(1)}%, ${dropYPercent.toFixed(1)}%), action: ${this.dragAction}`);

      // Handle different drag actions
      if (this.dragAction === "attack" || this.dragAction === "jutsu") {
        // Update position
        this.draggingUnit.pos = {
          x: Math.max(0, Math.min(100, dropXPercent)),
          y: Math.max(0, Math.min(100, dropYPercent))
        };

        // Find targets in range
        const targets = this.findUnitsInRange(dropX, dropY, this.dragAction, core);

        if (targets.length > 0) {
          console.log(`[Drag] Multi-hit: ${this.draggingUnit.name} hits ${targets.length} targets`);

          // Check for proximity combo attacks
          const proximityTargets = this.findProximityTargets(targets, core);

          if (this.dragAction === "jutsu" && window.BattleCombat) {
            window.BattleCombat.performMultiJutsu(this.draggingUnit, targets, core);
            // Trigger proximity combo attacks after jutsu
            if (proximityTargets.length > 0) {
              setTimeout(() => {
                window.BattleCombat.performProximityCombo(this.draggingUnit, proximityTargets, core);
              }, 600);
            }
          } else if (window.BattleCombat) {
            window.BattleCombat.performMultiAttack(this.draggingUnit, targets, core);
            // Trigger proximity combo attacks
            if (proximityTargets.length > 0) {
              setTimeout(() => {
                window.BattleCombat.performProximityCombo(this.draggingUnit, proximityTargets, core);
              }, 400);
            }
          }

          if (core.turns) core.turns.endTurn(core);
        } else {
          // No targets hit, just reposition
          if (core.units) {
            core.units.updateUnitPosition(this.draggingUnit, core);
          }
          if (core.turns) core.turns.endTurn(core);
        }
      } else if (this.dragAction === "ultimate") {
        // Update position
        this.draggingUnit.pos = {
          x: Math.max(0, Math.min(100, dropXPercent)),
          y: Math.max(0, Math.min(100, dropYPercent))
        };

        // Ultimate hits all enemies
        const targets = core.enemyTeam.filter(u => u.stats.hp > 0);
        if (window.BattleCombat) {
          window.BattleCombat.performUltimate(this.draggingUnit, targets, core);
        }
        if (core.turns) core.turns.endTurn(core);
      }

      this.handleDragEnd(e, core);
    },

    /**
     * Handle drag end
     */
    handleDragEnd(e, core) {
      this.isDragging = false;
      this.draggingUnit = null;
      this.dragAction = null;
      this.dragStartPos = null;

      // Clear all targeting markers
      this.clearAllTargetMarkers();

      if (core.overlay) core.overlay.clear();
      if (core.units) core.units.resetOpacity(core);
    },

    /**
     * Handle drag over (for drop zones)
     */
    handleDragOver(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    },

    /**
     * Handle drop on unit (for swapping)
     */
    handleDrop(e, targetUnit, core) {
      e.preventDefault();
      e.stopPropagation();

      if (!this.isDragging) return;

      const draggedId = e.dataTransfer.getData("text/plain");

      // Check if swapping with bench unit
      const benchUnit = core.benchTeam.find(u => u.id === draggedId);

      if (benchUnit && targetUnit.isPlayer && !targetUnit.isBench && core.swap) {
        core.swap.swapActiveWithBench(targetUnit, benchUnit, core);
      }

      this.handleDragEnd(e, core);
    },

    /* ===== Targeting System ===== */

    /**
     * Show targeting preview during drag
     */
    showDragTargetingPreview(x, y, core) {
      if (!this.draggingUnit || !core.overlay) return;

      const skills = window.BattleCombat?.getUnitSkills(this.draggingUnit);
      let shape, args, color;

      if (this.dragAction === "ultimate" && skills?.ultimate) {
        shape = skills.ultimate.data?.shape || "sector";
        args = skills.ultimate.data?.shapeArgs || { radius: 260, angleDeg: 90 };
        color = "ultimate";
      } else if (this.dragAction === "jutsu" && skills?.jutsu) {
        shape = skills.jutsu.data?.shape || "circle";
        args = skills.jutsu.data?.shapeArgs || { radius: 140 };
        color = "jutsu";
      } else {
        shape = "circle";
        args = { radius: 100 };
        color = "jutsu";
      }

      core.overlay.clear();
      core.overlay.draw(shape, color, args, { x, y });
    },

    /**
     * Find units within range of drop position
     */
    findUnitsInRange(x, y, actionType, core) {
      const skills = window.BattleCombat?.getUnitSkills(this.draggingUnit);
      let radius;

      if (actionType === "jutsu" && skills?.jutsu) {
        const shape = skills.jutsu.data?.shape;
        const args = skills.jutsu.data?.shapeArgs || {};
        radius = args.radius || 140;

        if (shape === "rect") {
          radius = Math.sqrt((args.w || 320) ** 2 + (args.h || 140) ** 2) / 2;
        }
        if (shape === "line") {
          radius = args.length || 360;
        }
      } else {
        radius = 100; // Basic attack range
      }

      const targets = [];
      for (const unit of core.enemyTeam) {
        if (unit.stats.hp <= 0) continue;

        const unitEl = core.dom.scene?.querySelector(`[data-unit-id="${unit.id}"]`);
        if (!unitEl) continue;

        const rect = unitEl.getBoundingClientRect();
        const sceneRect = core.dom.scene.getBoundingClientRect();

        const unitCenterX = rect.left - sceneRect.left + rect.width / 2;
        const unitCenterY = rect.top - sceneRect.top + rect.height / 2;

        const dist = Math.sqrt((x - unitCenterX) ** 2 + (y - unitCenterY) ** 2);
        if (dist <= radius) targets.push(unit);
      }

      return targets;
    },

    /**
     * Find proximity targets (enemies near the main targets)
     * These will receive basic attacks as combo damage
     */
    findProximityTargets(mainTargets, core) {
      const PROXIMITY_RADIUS = 120; // Distance to trigger proximity combo
      const proximityTargets = [];

      // For each main target, find nearby enemies
      mainTargets.forEach(mainTarget => {
        const mainEl = core.dom.scene?.querySelector(`[data-unit-id="${mainTarget.id}"]`);
        if (!mainEl) return;

        const mainRect = mainEl.getBoundingClientRect();
        const sceneRect = core.dom.scene.getBoundingClientRect();
        const mainX = mainRect.left - sceneRect.left + mainRect.width / 2;
        const mainY = mainRect.top - sceneRect.top + mainRect.height / 2;

        // Check all enemies
        core.enemyTeam.forEach(enemy => {
          // Skip if already a main target or dead
          if (mainTargets.includes(enemy) || enemy.stats.hp <= 0) return;
          // Skip if already in proximity list
          if (proximityTargets.includes(enemy)) return;

          const enemyEl = core.dom.scene?.querySelector(`[data-unit-id="${enemy.id}"]`);
          if (!enemyEl) return;

          const enemyRect = enemyEl.getBoundingClientRect();
          const enemyX = enemyRect.left - sceneRect.left + enemyRect.width / 2;
          const enemyY = enemyRect.top - sceneRect.top + enemyRect.height / 2;

          const dist = Math.sqrt((mainX - enemyX) ** 2 + (mainY - enemyY) ** 2);
          if (dist <= PROXIMITY_RADIUS) {
            proximityTargets.push(enemy);
          }
        });
      });

      return proximityTargets;
    },

    /**
     * Find unit at specific position
     */
    findUnitAtPosition(x, y, isPlayer, core) {
      const targets = isPlayer ? core.activeTeam : core.enemyTeam;
      const threshold = 60; // Hit detection radius

      for (const unit of targets) {
        if (unit.stats.hp <= 0 || unit.isBench) continue;

        const unitEl = core.dom.scene?.querySelector(`[data-unit-id="${unit.id}"]`);
        if (!unitEl) continue;

        const rect = unitEl.getBoundingClientRect();
        const sceneRect = core.dom.scene.getBoundingClientRect();

        const unitCenterX = rect.left - sceneRect.left + rect.width / 2;
        const unitCenterY = rect.top - sceneRect.top + rect.height / 2;

        const dist = Math.sqrt((x - unitCenterX) ** 2 + (y - unitCenterY) ** 2);
        if (dist < threshold) return unit;
      }

      return null;
    }
  };

  // Export to window
  window.BattleDrag = BattleDrag;

  // Add CSS for target markers
  const style = document.createElement('style');
  style.textContent = `
    @keyframes targetPulse {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.6;
        transform: scale(1.05);
      }
    }

    .target-marker {
      animation: targetPulse 1s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);

  console.log("[BattleDrag] Module loaded ✅ (with targeting markers & proximity detection)");
})();
