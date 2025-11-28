// js/missions.js — FINAL VERSION (Fully Restored Functionality + Modern UI)
// Loads mission categories, banners, difficulty icons, and routes to teams.html pre-battle mode

document.addEventListener('DOMContentLoaded', () => {
  const tabsContainer = document.querySelector('.mission-tabs');
  const listContainer = document.querySelector('.mission-list');

  let allMissions = [];

  /**
   * RENDER ALL MISSIONS FOR SELECTED CATEGORY
   */
  function renderMissionsForCategory(categoryName) {
    // Sort missions cleanly
    const missionsToRender = allMissions
      .filter(m => m.category === categoryName)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    listContainer.innerHTML = '';

    missionsToRender.forEach(mission => {
      const card = document.createElement('div');
      card.className = 'mission-card';

      // ----- Banner -----
      const banner = document.createElement('img');
      banner.className = 'mission-banner';
      banner.src = mission.banner;
      banner.alt = mission.name || 'Mission Banner';
      card.appendChild(banner);

      // ----- Mission Controls Container -----
      const controls = document.createElement('div');
      controls.className = 'mission-controls';

      // ----- Difficulty Icon Row -----
      const difficultyContainer = document.createElement('div');
      difficultyContainer.className = 'difficulty-icons-container';

      const availableDifficulties = Object.keys(mission.difficulties || {});
      let selectedDifficulty = availableDifficulties[0] || 'S';

      availableDifficulties.forEach(rank => {
        const btn = document.createElement('button');
        btn.className = 'difficulty-icon-btn';
        btn.dataset.difficulty = rank;

        const icon = document.createElement('img');
        icon.src = `assets/icons/rank_${rank.toLowerCase()}.png`;
        icon.alt = `${rank} Rank`;
        icon.onerror = () => {
          // fallback to text if missing icon
          icon.style.display = 'none';
          btn.textContent = rank;
          btn.style.color = '#FFD700';
          btn.style.fontSize = '22px';
          btn.style.fontWeight = 'bold';
        };

        btn.appendChild(icon);

        // initial selection highlight
        if (rank === selectedDifficulty) {
          btn.classList.add('active');
        }

        btn.addEventListener('click', () => {
          // toggle active class for ALL buttons
          difficultyContainer.querySelectorAll('.difficulty-icon-btn')
            .forEach(b => b.classList.remove('active'));

          btn.classList.add('active');
          selectedDifficulty = rank;
        });

        difficultyContainer.appendChild(btn);
      });

      controls.appendChild(difficultyContainer);

      // ----- Start Mission Button -----
      const startButton = document.createElement('button');
      startButton.className = 'start-btn';
      startButton.textContent = 'Start Mission';

      startButton.addEventListener('click', () => {
        // Save mission context for the battle page
        localStorage.setItem('currentMissionId', String(mission.id));
        localStorage.setItem('currentDifficulty', selectedDifficulty);
        localStorage.setItem('currentMissionName', mission.name || '');
        localStorage.setItem('currentMissionBanner', mission.banner || '');

        // small fade-out transition
        document.body.style.transition = 'opacity 0.25s linear';
        document.body.style.opacity = '0';

        setTimeout(() => {
          window.location.href = 'teams.html?mode=prebattle';
        }, 250);
      });

      controls.appendChild(startButton);

      // Attach controls under banner
      card.appendChild(controls);
      listContainer.appendChild(card);
    });

    // highlight active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.textContent === categoryName);
    });
  }

  /**
   * LOAD MISSION JSON
   */
  fetch('data/missions.json')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(missions => {
      allMissions = Array.isArray(missions) ? missions : [];

      if (allMissions.length === 0) {
        listContainer.innerHTML = '<p>No missions found.</p>';
        return;
      }

      // build unique category list
      const categoryNames = [...new Set(allMissions.map(m => m.category))];

      // render tabs
      tabsContainer.innerHTML = '';
      categoryNames.forEach(name => {
        const tab = document.createElement('button');
        tab.className = 'tab-btn';
        tab.textContent = name;
        tab.addEventListener('click', () => renderMissionsForCategory(name));
        tabsContainer.appendChild(tab);
      });

      // load first category automatically
      renderMissionsForCategory(categoryNames[0]);
    })
    .catch(err => {
      console.error('Mission load failed:', err);
      listContainer.innerHTML = '<p class="error-message">Failed to load missions.</p>';
    });
});
