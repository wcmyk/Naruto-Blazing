/* ============================================
   js/characters.js  — CLEAN, FINAL VERSION
   - Characters grid + Blazing-style modal
   - Tabs: Status • Ninjutsu • F/B Skills
   - Level Up / Add / Remove / Awaken wired
   - Stars moved BELOW the name tube
   - Uses InventoryChar + (optional) Progression
   ============================================ */
(() => {
  "use strict";

  /* ---------- DOM ---------- */
  const GRID          = document.querySelector(".char-grid");
  const MODAL         = document.getElementById("char-modal");
  const MODAL_IMG     = document.getElementById("char-modal-img");
  const MODAL_CLOSE   = document.getElementById("char-modal-close");

  const NP_NAME       = document.getElementById("nameplate-name");
  const NP_VERSION    = document.getElementById("nameplate-version");
  const NP_STARS      = document.getElementById("nameplate-stars");

  const STATS_WRAP    = document.getElementById("char-stats");
  const LV_VALUE_EL   = document.getElementById("status-level");
  const LV_CAP_EL     = document.getElementById("status-cap");
  const TIP_EL        = document.getElementById("awaken-tip");

  const BTN_LVUP      = document.getElementById("btn-levelup");
  const BTN_ADD       = document.getElementById("btn-addcopy");
  const BTN_REMOVE    = document.getElementById("btn-removecopy");
  const BTN_AWAKEN    = document.getElementById("btn-awaken");
  const BTN_LIMITBREAK = document.getElementById("btn-limitbreak");

  const LB_INFO       = document.getElementById("limitbreak-info");
  const LB_CURRENT    = document.getElementById("lb-current");
  const LB_MAX        = document.getElementById("lb-max");
  const LB_BONUS      = document.getElementById("lb-bonus");
  const MATERIALS_DISPLAY = document.getElementById("materials-display");

  const SKILLS_WRAP   = document.getElementById("char-skills");
  const SUPPORT_WRAP  = document.getElementById("char-support");

  if (!GRID || !MODAL) {
    console.warn("[characters] Missing .char-grid or #char-modal in DOM");
    return;
  }
  if (typeof window.InventoryChar === "undefined") {
    console.error("[characters] InventoryChar is not loaded. Load js/character_inv.js before this file.");
    return;
  }

  /* ---------- Safe helpers ---------- */
  const hasProg = typeof window.Progression !== "undefined";
  const hasAwakening = typeof window.Awakening !== "undefined";
  const hasLimitBreak = typeof window.LimitBreak !== "undefined";
  const hasResources = typeof window.Resources !== "undefined";
  const safeStr = (v, d = "") => (typeof v === "string" && v.trim() ? v.trim() : d);
  const safeNum = (v, d = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
  };

  /* ---------- Tier helpers ---------- */
  const STAR_COUNT_BY_TIER = { "3S":3,"4S":4,"5S":5,"6S":6,"6SB":6,"7S":7,"7SL":7,"8S":8,"8SM":8,"9S":9,"9ST":9,"10SO":10 };
  const TIER_CAP_FALLBACK  = { "3S":50,"4S":70,"5S":100,"6S":100,"6SB":100,"7S":120,"7SL":150,"8S":150,"8SM":150,"9S":150,"9ST":200,"10SO":250 };

  const starsFromTier = (code) => STAR_COUNT_BY_TIER[code] ?? 0;
  const tierCap = (c, tier) => {
    if (hasProg && window.Progression.computeEffectiveStatsLoreTier) {
      const probe = window.Progression.computeEffectiveStatsLoreTier(c, 1, tier, { normalize:true });
      return probe?.cap ?? (TIER_CAP_FALLBACK[tier] || 70);
    }
    return TIER_CAP_FALLBACK[tier] || 70;
  };
  const minTier = (c) => c.starMinCode || `${c.rarity || 3}S`;
  const maxTier = (c) => c.starMaxCode || minTier(c);

  /* ---------- Art resolver ---------- */
  function resolveTierArt(c, tier) {
    const fbPortrait = c?.portrait || "assets/characters/_common/silhouette.png";
    const fbFull     = c?.full || fbPortrait;
    const map = c?.artByTier || {};
    if (map[tier]) return { portrait: map[tier].portrait || fbPortrait, full: map[tier].full || fbFull };
    return { portrait: fbPortrait, full: fbFull };
  }
  window.resolveTierArt = resolveTierArt;

  /* ---------- Stars HTML ---------- */
  const renderStars = (n) => new Array(Math.max(0, Math.min(10, n))).fill(0).map(() => "<span class='star'>★</span>").join("");
  window.renderStars = renderStars;
  window.starsFromTier = starsFromTier;

  /* ---------- Level badge (grid cards) ---------- */
  function levelBadgeHTML(c, inst) {
    const t   = inst.tierCode || minTier(c);
    const cap = tierCap(c, t);
    const lv  = safeNum(inst.level, 1);
    const isMax = lv >= cap;
    return isMax
      ? `<span class="lv">Lv</span> <span class="max">MAX</span>`
      : `<span class="lv">Lv</span> ${lv}`;
  }

  /* ---------- Data ---------- */
  let BASE = [];
  let BYID = Object.create(null);

  /* ---------- Load characters.json ---------- */
  async function loadBase() {
    const res = await fetch("data/characters.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    BASE = Array.isArray(json) ? json : (Array.isArray(json.characters) ? json.characters : []);
    BYID = BASE.reduce((acc, c) => (acc[c.id] = c, acc), Object.create(null));
  }

  /* ---------- Global accessor for character data ---------- */
  window.CharacterInventory = {
    getCharacterById: (id) => BYID[id] || null,
    getAllCharacters: () => BASE.slice()
  };

  /* ---------- Grid render ---------- */
  function renderGrid() {
    const instances = window.InventoryChar.allInstances();
    if (!instances.length) {
      GRID.innerHTML = `<div class="empty-msg">No characters in your roster yet.</div>`;
      return;
    }

    GRID.innerHTML = instances.map(inst => {
      const c = BYID[inst.charId];
      if (!c) {
        return `
          <button class="char-slot missing" type="button" data-uid="${inst.uid}" aria-label="Missing base">
            <div class="char-card-portrait" style="display:grid;place-items:center;background:#5b3;color:#fff;padding:10px;">
              <div style="text-align:center;font-size:12px">Missing base:<br><code>${safeStr(inst.charId,'unknown')}</code></div>
            </div>
            <div class="char-card-level"><span class="lv">Lv</span> ${safeNum(inst.level,1)}</div>
          </button>
        `;
      }
      const tier = inst.tierCode || minTier(c);
      const art  = resolveTierArt(c, tier);
      return `
        <button class="char-slot" type="button" data-uid="${inst.uid}">
          <img class="char-portrait-img" src="${safeStr(art.portrait, c.portrait)}" alt="${c.name} portrait"
               onerror="this.onerror=null;this.src='assets/characters/_common/silhouette.png';" />
          <div class="char-card-level">${levelBadgeHTML(c, inst)}</div>
        </button>
      `;
    }).join("");
  }
  window.refreshCharacterGrid = renderGrid;

  /* ---------- Modal open/close ---------- */
  function openModalByUid(uid) {
    const inst = window.InventoryChar.getByUid(uid);
    if (!inst) return;

    const c = BYID[inst.charId];
    if (!c) {
      NP_NAME.textContent = "Unknown Character";
      NP_VERSION.textContent = "Unlinked copy";
      NP_STARS.innerHTML = "";
      MODAL_IMG.src = "assets/characters/_common/silhouette.png";
      STATS_WRAP.innerHTML = `<div class="stat-row"><span class="stat-label">Note</span><span class="stat-value">Base '${safeStr(inst.charId,'unknown')}' not found in characters.json.</span></div>`;
      wireStatusButtons(null, inst, null);
      showModal();
      return;
    }

    const tier = inst.tierCode || minTier(c);
    const art  = resolveTierArt(c, tier);

    NP_NAME.textContent    = safeStr(c.name, "Unknown");
    NP_VERSION.textContent = safeStr(c.version, "");
    NP_STARS.innerHTML     = renderStars(starsFromTier(tier));

    MODAL_IMG.src = safeStr(art.full, art.portrait);
    MODAL_IMG.alt = `${c.name} full artwork`;

    renderStatusTab(c, inst, tier);
    renderSkillsTab(c, inst, tier);
    renderSupportTab(c);
    setActiveTab("status");

    showModal();
  }

  function showModal() {
    MODAL.classList.add("open");
    MODAL.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    MODAL.classList.remove("open");
    MODAL.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  MODAL_CLOSE?.addEventListener("click", closeModal);
  MODAL?.addEventListener("click", (e) => { if (e.target === MODAL) closeModal(); });
  window.addEventListener("keydown", (e) => { if (e.key === "Escape" && MODAL.classList.contains("open")) closeModal(); });

  /* ---------- Tabs ---------- */
  function setActiveTab(tab) {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.toggle("is-active", b.dataset.tab === tab));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.toggle("is-active", p.id === `tab-${tab}`));
  }
  function wireTabs() {
    document.querySelectorAll(".tab-btn").forEach(btn => btn.onclick = () => setActiveTab(btn.dataset.tab));
  }
  wireTabs();

  /* ---------- STATUS tab ---------- */
  async function renderStatusTab(c, inst, tier) {
    // Compute stats (with limit break if applicable)
    let stats = {};
    if (hasProg && window.Progression.computeEffectiveStatsLoreTier) {
      const comp = window.Progression.computeEffectiveStatsLoreTier(c, safeNum(inst.level,1), tier, { normalize:true });
      stats = comp?.stats || {};

      // Apply limit break bonuses if present
      if (hasLimitBreak && inst.limitBreakLevel && inst.limitBreakLevel > 0) {
        stats = window.LimitBreak.applyLimitBreakToStats(stats, inst.limitBreakLevel);
      }

      STATS_WRAP.innerHTML = `
        <div class="stat-row"><span class="stat-label">Health</span><span class="stat-value">${stats.hp ?? "-"}</span></div>
        <div class="stat-row"><span class="stat-label">Attack</span><span class="stat-value">${stats.atk ?? "-"}</span></div>
        <div class="stat-row"><span class="stat-label">Defense</span><span class="stat-value">${stats.def ?? "-"}</span></div>
        <div class="stat-row"><span class="stat-label">Speed</span><span class="stat-value">${stats.speed ?? "-"}</span></div>
        <div class="stat-row"><span class="stat-label">Chakra</span><span class="stat-value">${stats.chakra ?? "-"}</span></div>`;
    } else {
      const s = c.statsBase || {};
      STATS_WRAP.innerHTML = `
        <div class="stat-row"><span class="stat-label">Health</span><span class="stat-value">${s.hp ?? "-"}</span></div>
        <div class="stat-row"><span class="stat-label">Attack</span><span class="stat-value">${s.atk ?? "-"}</span></div>
        <div class="stat-row"><span class="stat-label">Defense</span><span class="stat-value">${s.def ?? "-"}</span></div>
        <div class="stat-row"><span class="stat-label">Speed</span><span class="stat-value">${s.speed ?? "-"}</span></div>
        <div class="stat-row"><span class="stat-label">Chakra</span><span class="stat-value">${s.chakra ?? "-"}</span></div>`;
    }

    const cap   = tierCap(c, tier);
    const level = Math.max(1, safeNum(inst.level, 1));
    const isMax = level >= cap;

    LV_VALUE_EL.textContent = isMax ? "MAX" : String(level);
    LV_CAP_EL.textContent   = String(cap);

    // Awakening check
    const canAwaken = hasProg && typeof window.Progression.canAwaken === "function" && isMax && window.Progression.canAwaken(inst, c);

    BTN_AWAKEN.disabled = !canAwaken;
    TIP_EL.textContent = canAwaken ? "Ready to awaken." : (isMax ? "Max level reached. Awaken when eligible." : "Level up to max to awaken.");

    // Limit break display
    const maxLB = hasLimitBreak ? window.LimitBreak.getMaxLimitBreakLevel(tier) : 0;
    const currentLB = inst.limitBreakLevel || 0;

    if (maxLB > 0 && LB_INFO) {
      LB_INFO.style.display = "block";
      if (LB_CURRENT) LB_CURRENT.textContent = currentLB;
      if (LB_MAX) LB_MAX.textContent = maxLB;

      if (LB_BONUS && currentLB > 0) {
        const bonus = window.LimitBreak.computeLimitBreakBonus(currentLB);
        LB_BONUS.innerHTML = `Stat Bonus: HP +${(bonus.hp * 100).toFixed(1)}%, ATK +${(bonus.atk * 100).toFixed(1)}%, DEF +${(bonus.def * 100).toFixed(1)}%`;
      } else if (LB_BONUS) {
        LB_BONUS.innerHTML = "No limit breaks applied yet.";
      }
    } else if (LB_INFO) {
      LB_INFO.style.display = "none";
    }

    // Limit break button
    const canLB = hasLimitBreak && window.LimitBreak.canLimitBreak(inst, c);
    const canAffordLB = hasLimitBreak && await window.LimitBreak.canAffordLimitBreak(inst, c);
    if (BTN_LIMITBREAK) {
      BTN_LIMITBREAK.disabled = !canLB || !canAffordLB;
    }

    // Display awakening materials
    if (hasAwakening && MATERIALS_DISPLAY) {
      await renderMaterials(inst, c, tier);
    }

    wireStatusButtons(c, inst, tier);
  }
  window.renderStatusTab = renderStatusTab;

  /* ---------- Materials Display ---------- */
  async function renderMaterials(inst, c, tier) {
    if (!hasAwakening || !hasResources) {
      MATERIALS_DISPLAY.innerHTML = "";
      return;
    }

    const reqs = await window.Awakening.getRequirements(tier);

    if (!reqs || !reqs.materials) {
      MATERIALS_DISPLAY.innerHTML = '<div class="no-requirements">No awakening materials required for this tier.</div>';
      return;
    }

    let html = '<div class="materials-title">Awakening Materials Required</div>';

    for (const [matId, required] of Object.entries(reqs.materials)) {
      const owned = window.Resources.get(matId);
      const matInfo = window.Resources.getMaterialInfo(matId);
      const sufficient = owned >= required;
      const className = sufficient ? "sufficient" : "insufficient";

      html += `
        <div class="material-item">
          <span class="material-name">${matInfo.name}</span>
          <span class="material-amount ${className}">${owned}/${required}</span>
        </div>
      `;
    }

    MATERIALS_DISPLAY.innerHTML = html;
  }

  function wireStatusButtons(c, inst, tierOrNull) {
    BTN_LVUP.onclick = () => {
      const t   = tierOrNull || (inst.tierCode || (c ? minTier(c) : "3S"));
      const cap = c ? tierCap(c, t) : 100;
      const upd = window.InventoryChar.levelUpInstance(inst.uid, 1, cap);
      LV_VALUE_EL.textContent = (upd.level >= cap) ? "MAX" : String(upd.level);
      if (c) window.renderStatusTab(c, upd, t);
      renderGrid();
    };

    BTN_ADD.onclick = () => {
      if (!c?.id) return;

      // Check if character has abilities that can be unlocked
      const hasAbilities = c.abilities && c.abilities.length > 0;
      const currentUnlocks = inst.dupeUnlocks || 0;
      const canUnlockMore = hasAbilities && currentUnlocks < c.abilities.length;

      if (canUnlockMore) {
        // Show dialog: Feed dupe to unlock ability OR add new copy
        const nextAbility = c.abilities[currentUnlocks];
        const feedDupe = confirm(
          `Feed duplicate to unlock ability?\n\n` +
          `Ability ${currentUnlocks + 1}/${c.abilities.length}: ${nextAbility.name}\n` +
          `${nextAbility.description}\n\n` +
          `Click OK to unlock this ability\n` +
          `Click Cancel to add a new copy instead`
        );

        if (feedDupe) {
          // Feed the dupe to unlock ability
          if (window.characterDupeAbilities) {
            const result = window.characterDupeAbilities.unlockNextAbility(inst.uid);
            if (result.success) {
              alert(`✅ Ability Unlocked!\n\n${result.abilityName}\n${result.abilityDescription}\n\nProgress: ${result.unlockedCount}/${result.maxAbilities}`);
              // Refresh both displays
              window.characterDupeAbilities.refresh();
              renderGrid();
            } else {
              alert(`⚠️ ${result.message}`);
            }
          }
          return;
        }
      }

      // Default: Add a new copy to inventory
      window.InventoryChar.addCopy(c.id, 1);
      renderGrid();
    };

    BTN_REMOVE.onclick = () => {
      window.InventoryChar.removeOneByUid(inst.uid);
      renderGrid();
      closeModal();
    };

    BTN_AWAKEN.onclick = async () => {
      if (!c) return;
      if (!(hasProg && typeof window.Progression.canAwaken === "function" && window.Progression.canAwaken(inst, c))) return;

      // Use new Awakening system if available
      let res;
      if (hasAwakening) {
        const canAfford = await window.Awakening.canAffordAwaken(inst, c);
        if (!canAfford) {
          alert("You don't have enough materials to awaken this character!");
          return;
        }

        res = await window.Awakening.performAwaken(inst, c, "reset");
      } else {
        // Fallback to old system
        res = (typeof window.InventoryChar.promoteTier === "function")
          ? window.InventoryChar.promoteTier(inst.uid, "reset", c)
          : window.Progression.promoteTier(inst, c, "reset");
      }

      if (!res?.ok) {
        alert(res.reason === "INSUFFICIENT_MATERIALS"
          ? "Insufficient materials for awakening!"
          : "Max tier reached or cannot awaken.");
        return;
      }

      if (!res.persisted && res.tier) {
        window.InventoryChar.updateInstance(inst.uid, { tierCode: res.tier, level: res.level ?? 1 });
      }

      const fresh = window.InventoryChar.getByUid(inst.uid);
      const newTier = fresh?.tierCode || maxTier(c);

      const art = resolveTierArt(c, newTier);
      MODAL_IMG.src = safeStr(art.full, art.portrait);
      NP_STARS.innerHTML = renderStars(starsFromTier(newTier));

      await window.renderStatusTab(c, fresh, newTier);
      renderSkillsTab(c, fresh, newTier);
      renderGrid();

      alert(`Successfully awakened ${c.name} to ${starsFromTier(newTier)} stars!`);
    };

    // Limit Break button
    if (BTN_LIMITBREAK) {
      BTN_LIMITBREAK.onclick = async () => {
        if (!c || !hasLimitBreak) return;

        const canLB = window.LimitBreak.canLimitBreak(inst, c);
        if (!canLB) {
          alert("This character cannot be limit broken yet. Must be at max tier and max level.");
          return;
        }

        const canAfford = await window.LimitBreak.canAffordLimitBreak(inst, c);
        if (!canAfford) {
          alert("You don't have enough materials for limit break!");
          return;
        }

        const tier = inst.tierCode || minTier(c);
        const cost = await window.LimitBreak.getLimitBreakCost(tier, inst.limitBreakLevel || 0, c);

        let costStr = "Cost:\n";
        for (const [matId, amt] of Object.entries(cost)) {
          const matInfo = window.Resources.getMaterialInfo(matId);
          costStr += `${matInfo.name}: ${amt}\n`;
        }

        if (!confirm(`Limit Break ${c.name}?\n\n${costStr}`)) {
          return;
        }

        const res = await window.LimitBreak.performLimitBreak(inst, c);

        if (!res?.ok) {
          alert(res.reason === "INSUFFICIENT_MATERIALS"
            ? "Insufficient materials!"
            : "Limit break failed!");
          return;
        }

        // Update instance
        window.InventoryChar.updateInstance(inst.uid, { limitBreakLevel: res.limitBreakLevel });
        const fresh = window.InventoryChar.getByUid(inst.uid);

        await window.renderStatusTab(c, fresh, tier);
        renderGrid();

        alert(`Limit Break successful! ${c.name} is now LB${res.limitBreakLevel}!`);
      };
    }
  }

  /* ---------- SKILLS tab ---------- */
  function pickTierSkillEntry(skillObj, tier, fallbackTier) {
    if (!skillObj?.byTier) return null;
    if (skillObj.byTier[tier]) return skillObj.byTier[tier];
    if (fallbackTier && skillObj.byTier[fallbackTier]) return skillObj.byTier[fallbackTier];
    const first = Object.keys(skillObj.byTier)[0];
    return first ? skillObj.byTier[first] : null;
  }

  function renderSkillsTab(c, inst, tier) {
    SKILLS_WRAP.innerHTML = "";
    const minT = minTier(c);
    const { jutsu=null, ultimate=null, secret=null } = c.skills || {};
    const cards = [];

    // Get character level for unlock checks
    const charLevel = Number(inst?.level || 1);
    const jutsuUnlocked = charLevel >= 20;
    const ultimateUnlocked = charLevel >= 50;

    if (jutsu) {
      const e = pickTierSkillEntry(jutsu, tier, minT);
      if (e) {
        // Check if jutsu is unlocked by level
        const lockStatus = jutsuUnlocked ? '' : ` <span style="color:#d8b86a">🔒 (Requires Lv 20)</span>`;
        const cardClass = jutsuUnlocked ? '' : ' locked';
        cards.push(`
          <div class="skill-card${cardClass}">
            <div class="skill-header"><span class="skill-type">Ninjutsu</span><span class="skill-name">${safeStr(jutsu.name,"Ninjutsu")}${lockStatus}</span></div>
            <div class="skill-meta">
              <span>Chakra: <strong>${safeNum(e.chakraCost,"-")}</strong></span>
              <span>CD: <strong>${safeNum(e.cooldown,"-")}</strong></span>
              <span>Range: <strong>${safeStr(e.range,"-")}</strong></span>
              <span>Hits: <strong>${safeNum(e.hits,"-")}</strong></span>
              <span>Mult: <strong>${safeStr(e.multiplier,"-")}</strong></span>
            </div>
            <div class="skill-desc">${safeStr(e.description,"")}</div>
          </div>
        `);
      }
    }

    if (ultimate) {
      const e = pickTierSkillEntry(ultimate, tier, null);
      if (e) {
        // Check if ultimate is unlocked by level
        const lockStatus = ultimateUnlocked ? '' : ` <span style="color:#d8b86a">🔒 (Requires Lv 50)</span>`;
        const cardClass = ultimateUnlocked ? '' : ' locked';
        cards.push(`
          <div class="skill-card ultimate${cardClass}">
            <div class="skill-header"><span class="skill-type">Ultimate</span><span class="skill-name">${safeStr(ultimate.name,"Ultimate")}${lockStatus}</span></div>
            <div class="skill-meta">
              <span>Chakra: <strong>${safeNum(e.chakraCost,"-")}</strong></span>
              <span>CD: <strong>${safeNum(e.cooldown,"-")}</strong></span>
              <span>Range: <strong>${safeStr(e.range,"-")}</strong></span>
              <span>Hits: <strong>${safeNum(e.hits,"-")}</strong></span>
              <span>Mult: <strong>${safeStr(e.multiplier,"-")}</strong></span>
            </div>
            <div class="skill-desc">${safeStr(e.description,"")}</div>
          </div>
        `);
      } else {
        cards.push(`
          <div class="skill-card ultimate locked">
            <div class="skill-header"><span class="skill-type">Ultimate</span><span class="skill-name">${safeStr(ultimate.name,"Ultimate")} <span style="color:#d8b86a">🔒 (Tier Locked)</span></span></div>
            <div class="skill-desc">Unlocks upon awakening to a higher star tier.</div>
          </div>
        `);
      }
    }

    /* === Secret Technique support (added without altering other logic) === */
    if (secret) {
      const e = pickTierSkillEntry(secret, tier, null);
      if (e) {
        cards.push(`
          <div class="skill-card secret">
            <div class="skill-header"><span class="skill-type">Secret</span><span class="skill-name">${safeStr(secret.name,"Secret Technique")}</span></div>
            <div class="skill-meta">
              <span>Chakra: <strong>${safeNum(e.chakraCost,"-")}</strong></span>
              <span>CD: <strong>${safeNum(e.cooldown,"-")}</strong></span>
              <span>Range: <strong>${safeStr(e.range,"-")}</strong></span>
            </div>
            <div class="skill-desc">${safeStr(e.description,"")}</div>
          </div>
        `);
      }
    }

    SKILLS_WRAP.innerHTML = cards.length ? cards.join("") : `<div class="skill-card">No skills available.</div>`;
  }
  window.renderSkillsTab = renderSkillsTab;

  /* ---------- F/B SKILLS tab ---------- */
  function renderSupportTab(c) {
    const blocks = [];
    if (c.fieldSkill) blocks.push(`<div class="support-box"><strong>Field Skill</strong><div>${c.fieldSkill}</div></div>`);
    if (c.buddySkill) blocks.push(`<div class="support-box"><strong>Buddy Skill</strong><div>${c.buddySkill}</div></div>`);
    if (Array.isArray(c.syncSkills) && c.syncSkills.length) {
      blocks.push(`<div class="support-box"><strong>Sync Skills</strong><ul>${c.syncSkills.map(s => `<li>${s.type ? `<em>${s.type}:</em> ` : ""}${s.effect || s}</li>`).join("")}</ul></div>`);
    }
    if (Array.isArray(c.abilities) && c.abilities.length) {
      blocks.push(`<div class="support-box"><strong>Abilities</strong><ul>${c.abilities.map(a => `<li>${a}</li>`).join("")}</ul></div>`);
    }
    SUPPORT_WRAP.innerHTML = blocks.length ? blocks.join("") : `<div class="support-box">No support skills.</div>`;
  }

  /* ---------- Grid clicks ---------- */
  GRID.addEventListener("click", (e) => {
    const slot = e.target.closest(".char-slot");
    if (!slot) return;
    const uid = slot.getAttribute("data-uid");
    if (uid) openModalByUid(uid);
  });

  /* ---------- Boot ---------- */
  (async function init() {
    try {
      await loadBase();
      renderGrid();
    } catch (err) {
      console.error("[characters] Failed to initialize:", err);
      GRID.innerHTML = `<div class="empty-msg">Failed to load characters.</div>`;
    }
  })();

})();

/* ===== Awaken Button Fix (runs AFTER main code) ===== */
(function fixAwakenButton(){
  console.log("[Awaken Fix] Patch loading...");

  function waitForRenderStatusTab() {
    if (typeof window.renderStatusTab !== "function") {
      setTimeout(waitForRenderStatusTab, 100);
      return;
    }
    applyPatch();
  }

  function applyPatch() {
    const originalRenderStatusTab = window.renderStatusTab;

    window.renderStatusTab = function(c, inst, tier) {
      originalRenderStatusTab(c, inst, tier);

      const btn = document.getElementById("btn-awaken");
      const tip = document.getElementById("awaken-tip");

      if (!btn || !c || !inst) return;

      const level = Number(inst.level) || 1;
      const cap = window.Progression?.levelCapForCode?.(tier) || 100;
      const isMaxLevel = level >= cap;
      const canPromote = window.Progression?.canPromoteTier?.(inst, c) || false;
      const canAwaken = isMaxLevel && canPromote;

      console.log("[Awaken]", c.name, "Lv", level, "/", cap, "canAwaken:", canAwaken);

      btn.disabled = !canAwaken;

      if (tip) {
        tip.textContent = !isMaxLevel ? "Level up to max to awaken." :
                         !canPromote ? "Max tier reached." :
                         "Ready to awaken!";
      }

      btn.onclick = function() {
        if (btn.disabled) return;

        const freshInst = window.InventoryChar?.getByUid(inst.uid);
        if (!freshInst) {
          alert("Character not found.");
          return;
        }

        let res;
        if (typeof window.InventoryChar?.promoteTier === "function") {
          res = window.InventoryChar.promoteTier(freshInst.uid, "reset", c);
        } else if (typeof window.Progression?.promoteTier === "function") {
          res = window.Progression.promoteTier(freshInst, c, "reset");
          if (res?.ok) {
            window.InventoryChar?.updateInstance(freshInst.uid, {
              tierCode: res.tier,
              level: 1
            });
          }
        }

        if (!res?.ok) {
          alert("Cannot awaken: " + (res?.reason || "Unknown error"));
          return;
        }

        const updated = window.InventoryChar?.getByUid(freshInst.uid);
        const newTier = updated?.tierCode || tier;

        const img = document.getElementById("char-modal-img");
        if (img && typeof window.resolveTierArt === "function") {
          const art = window.resolveTierArt(c, newTier);
          img.src = art.full || art.portrait || img.src;
        }

        const starsEl = document.getElementById("nameplate-stars");
        if (starsEl && typeof window.starsFromTier === "function" && typeof window.renderStars === "function") {
          starsEl.innerHTML = window.renderStars(window.starsFromTier(newTier));
        }

        if (typeof window.renderStatusTab === "function") {
          window.renderStatusTab(c, updated, newTier);
        }
        if (typeof window.renderSkillsTab === "function") {
          window.renderSkillsTab(c, updated, newTier);
        }
        if (typeof window.refreshCharacterGrid === "function") {
          window.refreshCharacterGrid();
        }
      };
    };

    console.log("[Awaken Fix] Applied!");
  }

  waitForRenderStatusTab();
})();
