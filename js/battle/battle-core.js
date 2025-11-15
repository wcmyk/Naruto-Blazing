// js/battle/battle-core.js - Core Battle Manager (Fixed Integration)
(() => {
  "use strict";

  async function fetchJSON(url, fallback = null) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return fallback;
      return await res.json();
    } catch (e) {
      console.warn(`[fetchJSON] ${url} ->`, e);
      return fallback;
    }
  }

  /**
   * BattleCore Module
   * Central manager that coordinates all battle modules
   * Handles initialization, data loading, and module orchestration
   */
  const BattleCore = {
    // ===== State =====
    missionData: null,
    difficulty: "S",
    currentStageIndex: 0,
    currentWaveIndex: 0,

    activeTeam: [],
    benchTeam: [],
    enemyTeam: [],
    combatants: [],

    isPaused: true,
    speedMultiplier: 1,
    queuedAction: null,

    enemiesData: [],
    charactersData: [],
    dom: {},
    overlay: null,

    // Constants
    GAUGE_MAX: 1200,
    SPEED_TICK_INTERVAL: 50,

    // Module references (will be set by battle.js)
    chakra: null,
    combat: null,
    units: null,
    drag: null,
    swap: null,
    turns: null,

    /* ===== Initialization ===== */

    async init() {
      console.log("[BattleCore] ⚔️ Initializing battle system...");

      this.cacheDOM();
      this.setupEventListeners();

      const missionId = localStorage.getItem("currentMissionId") || "m_001";
      const preferredDifficulty = localStorage.getItem("currentDifficulty") || "C";

      const [missions, enemies, characters] = await Promise.all([
        fetchJSON("data/missions.json", []),
        fetchJSON("data/enemies.json", []),
        fetchJSON("data/characters.json", [])
      ]);

      this.enemiesData = enemies;
      this.charactersData = Array.isArray(characters) ? characters : (characters?.characters || []);
      this.missionData = (Array.isArray(missions) ? missions : []).find(m => m.id === missionId);

      if (!this.missionData) {
        console.error(`[BattleCore] Mission ${missionId} not found!`);
        return;
      }

      const diffs = Object.keys(this.missionData.difficulties || {});
      this.difficulty = diffs.includes(preferredDifficulty) ? preferredDifficulty : (diffs[0] || "C");

      // Set mission title
      if (this.dom.missionTitle) {
        this.dom.missionTitle.textContent = this.missionData.name;
      }

      // Load background map
      const firstStage = this.missionData?.difficulties?.[this.difficulty]?.[0];
      if (firstStage?.map && this.dom.scene) {
        this.dom.scene.style.backgroundImage = `url('${firstStage.map}')`;
        this.dom.scene.style.backgroundSize = 'cover';
        this.dom.scene.style.backgroundPosition = 'center';
        console.log("[BattleCore] 🌄 Map loaded:", firstStage.map);
      }

      // Create overlay if drag module available
      if (this.dom.scene && this.drag) {
        this.overlay = this.drag.makeOverlay(this.dom.scene);
      }

      // Load player team
      this.loadPlayerTeamFromStorage();

      // Initialize missions module if available
      if (window.BattleMissions) {
        window.BattleMissions.init(this);
      }

      // Initialize modifiers if available
      if (window.BattleModifiers) {
        window.BattleModifiers.init(this);
      }

      // Play entrance animations if available
      if (window.BattleEntrance) {
        await window.BattleEntrance.playEntranceSequence(this);
      }

      // Start speed gauge system if turns module available
      if (this.turns) {
        this.turns.startSpeedGaugeTick(this);
      }

      console.log("[BattleCore] ✅ Battle initialized successfully");
    },

    /* ===== DOM Caching ===== */

    cacheDOM() {
      this.dom = {
        scene: document.getElementById("battle-scene"),
        grid: document.getElementById("battlefield-grid"),
        damageLayer: document.getElementById("damage-numbers"),
        effectsLayer: document.getElementById("effects-layer"),
        turnOrderEl: document.getElementById("turn-icons"),
        actionPanel: document.getElementById("action-panel"),
        benchContainer: document.getElementById("bench-units"),

        waveCurrent: document.getElementById("wave-current"),
        waveTotal: document.getElementById("wave-total"),
        missionTitle: document.getElementById("mission-title"),
        teamHPBar: document.getElementById("team-hp-bar"),
        teamHPText: document.getElementById("team-hp-text"),

        actionPortrait: document.getElementById("action-portrait"),
        actionName: document.getElementById("action-name"),
        actionHP: document.getElementById("action-hp"),
        actionChakra: document.getElementById("action-chakra"),
        actionSkillName: document.getElementById("action-skill-name"),
        actionUltName: document.getElementById("action-ult-name"),
        actionSecretName: document.getElementById("action-secret-name"),

        btnAttack: document.getElementById("btn-attack"),
        btnJutsu: document.getElementById("btn-jutsu"),
        btnUltimate: document.getElementById("btn-ultimate"),
        btnSecret: document.getElementById("btn-secret"),        // ⭐ NEW: Secret Technique button
        btnGuard: document.getElementById("btn-guard"),
        btnAuto: document.getElementById("btn-auto"),
        btnSpeed: document.getElementById("btn-speed"),

        speedGaugeTrack: document.getElementById("speed-gauge-track"),

        battleResult: document.getElementById("battle-result"),
        resultTitle: document.getElementById("result-title"),
        resultStats: document.getElementById("result-stats"),
        btnContinue: document.getElementById("btn-continue")
      };

      console.log("[BattleCore] DOM cached:", Object.keys(this.dom).filter(k => this.dom[k]).length, "elements found");
    },

    /* ===== Event Listeners ===== */

    setupEventListeners() {
      if (this.turns) {
        this.dom.btnAttack?.addEventListener("click", () => this.turns.handleAttackButton(this));
        this.dom.btnJutsu?.addEventListener("click", () => this.turns.handleJutsuButton(this));
        this.dom.btnUltimate?.addEventListener("click", () => this.turns.handleUltimateButton(this));
        this.dom.btnSecret?.addEventListener("click", () => this.turns.handleSecretButton(this)); // ⭐ NEW: wire Secret
        this.dom.btnGuard?.addEventListener("click", () => this.turns.handleGuardButton(this));
        this.dom.btnAuto?.addEventListener("click", () => this.turns.toggleAutoMode(this));
        this.dom.btnSpeed?.addEventListener("click", () => this.turns.changeSpeedMultiplier(this));
      }

      this.dom.btnContinue?.addEventListener("click", () => {
        window.location.href = "missions.html";
      });

      if (this.dom.scene && this.drag) {
        this.dom.scene.addEventListener("dragover", (e) => this.drag.handleSceneDragOver(e, this));
        this.dom.scene.addEventListener("drop", (e) => this.drag.handleSceneDrop(e, this));
      }
    },

    /* ===== Team Loading ===== */

    loadPlayerTeamFromStorage() {
      const teamsData = JSON.parse(localStorage.getItem("blazing_teams_v1") || "{}");
      const currentTeamNum = 1;
      const teamSlots = teamsData[currentTeamNum] || {};

      console.log("[BattleCore] Loading team slots:", teamSlots);

      // FIXED: Use 4 active slots (front-1 through front-4)
      const frontSlots = ["front-1", "front-2", "front-3", "front-4"];
      const backSlots = ["back-1", "back-2", "back-3", "back-4"];

      this.activeTeam = frontSlots.map((slotId, i) => {
        const slot = teamSlots[slotId];
        if (!slot?.uid) return null;

        const inst = window.InventoryChar?.getByUid(slot.uid);
        const base = this.charactersData.find(c => c.id === slot.charId);

        if (!inst || !base) {
          console.warn(`[BattleCore] Missing data for slot ${slotId}`, { inst, base });
          return null;
        }

        const tier = inst.tierCode || base.starMinCode || "3S";

        // Use units module if available, otherwise inline
        const art = this.units ?
          this.units.resolveTierArt(base, tier) :
          this.resolveTierArtFallback(base, tier);

        const stats = this.units ?
          this.units.computeStats(base, inst) :
          this.computeStatsFallback(base, inst);

        const unit = this.units ?
          this.units.createCombatant({
            ...base,
            ...inst,
            portrait: art.portrait,
            isPlayer: true,
            positionId: i + 1,
            isActive: true,
            stats,
            pos: { x: 20 + (i % 2 * 15), y: 25 + Math.floor(i / 2) * 25 }
          }) :
          this.createCombatantFallback({
            ...base,
            ...inst,
            portrait: art.portrait,
            isPlayer: true,
            positionId: i + 1,
            isActive: true,
            stats,
            pos: { x: 20 + (i % 2 * 15), y: 25 + Math.floor(i / 2) * 25 }
          });

        unit._ref = { base, inst, tier };

        // Initialize passive abilities
        if (window.BattlePassives) {
          window.BattlePassives.initializePassives(unit, this);
        }

        console.log(`[BattleCore] Active unit ${i + 1}:`, unit.name, tier, art.portrait);
        return unit;
      }).filter(Boolean);

      // FIXED: Load 4 bench units (back-1 through back-4)
      this.benchTeam = backSlots.map((slotId, i) => {
        const slot = teamSlots[slotId];
        if (!slot?.uid) return null;

        const inst = window.InventoryChar?.getByUid(slot.uid);
        const base = this.charactersData.find(c => c.id === slot.charId);

        if (!inst || !base) return null;

        const tier = inst.tierCode || base.starMinCode || "3S";

        const art = this.units ?
          this.units.resolveTierArt(base, tier) :
          this.resolveTierArtFallback(base, tier);

        const stats = this.units ?
          this.units.computeStats(base, inst) :
          this.computeStatsFallback(base, inst);

        const unit = this.units ?
          this.units.createCombatant({
            ...base,
            ...inst,
            portrait: art.portrait,
            isPlayer: true,
            positionId: i + 1,
            isActive: false,
            isBench: true,
            stats,
            pos: { x: 0, y: 0 }
          }) :
          this.createCombatantFallback({
            ...base,
            ...inst,
            portrait: art.portrait,
            isPlayer: true,
            positionId: i + 1,
            isActive: false,
            isBench: true,
            stats,
            pos: { x: 0, y: 0 }
          });

        unit._ref = { base, inst, tier };

        // Initialize passive abilities
        if (window.BattlePassives) {
          window.BattlePassives.initializePassives(unit, this);
        }

        console.log(`[BattleCore] Bench unit ${i + 1}:`, unit.name, tier);
        return unit;
      }).filter(Boolean);

      console.log("[BattleCore] ✅ Loaded:", this.activeTeam.length, "active,", this.benchTeam.length, "bench");

      // Fallback if no team loaded
      if (this.activeTeam.length === 0) {
        console.warn("[BattleCore] No active team! Creating fallback...");
        this.createFallbackTeam();
      }

      // Render using modules if available
      if (this.units) {
        this.units.renderBenchUnits(this);
      }
      this.updateTeamHP();
      this.updateCombatants();
    },

    /* ===== Fallback Methods (when modules not loaded) ===== */

    resolveTierArtFallback(char, tier) {
      const fbPortrait = char?.portrait || "assets/characters/common/silhouette.png";
      const fbFull = char?.full || fbPortrait;
      const map = char?.artByTier || {};

      if (map[tier]) {
        return {
          portrait: map[tier].portrait || fbPortrait,
          full: map[tier].full || fbFull
        };
      }

      return { portrait: fbPortrait, full: fbFull };
    },

    computeStatsFallback(char, instance) {
      if (window.Progression?.computeEffectiveStatsLoreTier) {
        const tier = instance?.tierCode || char?.starMinCode || "5S";
        const lvl = Number(instance?.level || 1);
        const result = window.Progression.computeEffectiveStatsLoreTier(
          char, lvl, tier, { normalize: true }
        );
        const s = result?.stats || {};

        return {
          hp: s.hp ?? 1000,
          maxHP: s.hp ?? 1000,
          atk: s.atk ?? 100,
          def: s.def ?? 50,
          speed: s.speed ?? 100,
          chakraBase: s.chakra ?? 10
        };
      }

      const base = char?.statsMax || char?.statsBase || {};
      return {
        hp: base.hp || 1000,
        maxHP: base.hp || 1000,
        atk: base.atk || 100,
        def: base.def || 50,
        speed: base.speed || 100,
        chakraBase: base.chakra || 10
      };
    },

    createCombatantFallback(data) {
      const unit = {
        id: data.uid || `unit-${Date.now()}-${Math.random()}`,
        name: data.name || "Unknown",
        portrait: data.portrait || "assets/characters/common/silhouette.png",
        isPlayer: data.isPlayer || false,
        positionId: data.positionId || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
        isBench: data.isBench || false,
        pos: data.pos || { x: 50, y: 50 },
        stats: data.stats,
        chakra: 0,
        maxChakra: 10,
        speedGauge: Math.floor(Math.random() * 200),
        isPaused: false,
        isGuarding: false,
        statusEffects: [],
        chakraMode: "NONE",
        _ref: null
      };

      return unit;
    },

    createFallbackTeam() {
      const inventory = window.InventoryChar?.allInstances() || [];

      // Create 4 active units
      this.activeTeam = inventory.slice(0, 4).map((inst, i) => {
        const base = this.charactersData.find(c => c.id === inst.charId) || {};
        const tier = inst.tierCode || base.starMinCode || "3S";
        const art = this.resolveTierArtFallback(base, tier);
        const stats = this.computeStatsFallback(base, inst);

        const unit = this.createCombatantFallback({
          ...base,
          ...inst,
          portrait: art.portrait,
          isPlayer: true,
          positionId: i + 1,
          isActive: true,
          stats,
          pos: { x: 20 + (i % 2 * 15), y: 25 + Math.floor(i / 2) * 25 }
        });
        unit._ref = { base, inst, tier };
        return unit;
      });

      // Create 4 bench units
      this.benchTeam = inventory.slice(4, 8).map((inst, i) => {
        const base = this.charactersData.find(c => c.id === inst.charId) || {};
        const tier = inst.tierCode || base.starMinCode || "3S";
        const art = this.resolveTierArtFallback(base, tier);
        const stats = this.computeStatsFallback(base, inst);

        const unit = this.createCombatantFallback({
          ...base,
          ...inst,
          portrait: art.portrait,
          isPlayer: true,
          positionId: i + 1,
          isActive: false,
          isBench: true,
          stats,
          pos: { x: 0, y: 0 }
        });
        unit._ref = { base, inst, tier };
        return unit;
      });
    },

    /* ===== Core Functions ===== */

    updateCombatants() {
      // Only active (non-benched) units participate in combat
      this.combatants = [...this.activeTeam, ...this.enemyTeam].filter(u => !u.isBench && u.isActive);
      console.log("[BattleCore] Combatants updated:", this.combatants.length);
      console.log("[BattleCore] Active team:", this.activeTeam.map(u => `${u.name} (Player: ${u.isPlayer})`));
      console.log("[BattleCore] Enemy team:", this.enemyTeam.map(u => `${u.name} (Player: ${u.isPlayer})`));
      console.log("[BattleCore] Final combatants:", this.combatants.map(u => `${u.name} (Player: ${u.isPlayer}, Active: ${u.isActive}, Bench: ${u.isBench})`));
    },

    updateTeamHP() {
      const current = this.activeTeam.reduce((sum, u) => sum + u.stats.hp, 0);
      const max = this.activeTeam.reduce((sum, u) => sum + u.stats.maxHP, 0);
      const percent = max ? (current / max) * 100 : 0;

      if (this.dom.teamHPBar) this.dom.teamHPBar.style.width = `${percent}%`;
      if (this.dom.teamHPText) this.dom.teamHPText.textContent = `${current.toLocaleString()} / ${max.toLocaleString()}`;
    },

    checkBattleEnd() {
      const playersAlive = this.activeTeam.filter(u => u.stats.hp > 0).length;
      const enemiesAlive = this.enemyTeam.filter(u => u.stats.hp > 0).length;

      if (playersAlive === 0) {
        setTimeout(() => {
          if (window.BattleMissions) {
            window.BattleMissions.declareDefeat(this);
          }
        }, 600);
      } else if (enemiesAlive === 0) {
        this.isPaused = true;

        // Delay to allow HP bars to finish animating to 0
        setTimeout(() => {
          if (window.BattleMissions) {
            window.BattleMissions.handleWaveComplete(this);
          }
        }, 600);
      }
    },

    /* ===== Legacy Compatibility Methods ===== */

    updateUnitDisplay(unit) {
      if (this.units) {
        this.units.updateUnitDisplay(unit, this);
      }
    },

    renderAllUnits() {
      if (this.units) {
        this.units.renderAllUnits(this);
      }
    },

    startTurn(unit) {
      if (this.turns) {
        this.turns.startTurn(unit, this);
      }
    },

    endTurn() {
      if (this.turns) {
        this.turns.endTurn(this);
      }
    }
  };

  // Export to window
  window.BattleCore = BattleCore;

  console.log("[BattleCore] Module loaded ✅");
})();
