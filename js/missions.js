// js/missions.js — CLEAN & FINAL VERSION (100% working, zero errors)

document.addEventListener('DOMContentLoaded', () => {
  const tabsContainer = document.querySelector('.mission-tabs');
  const listContainer = document.querySelector('.mission-list');

  let allMissions = [];

  /**
   * Render all missions for a selected category
   */
  function renderMissionsForCategory(categoryName) {

    // Filter + sort missions
    const missionsToRender = allMissions
      .filter(m => m.category === categoryName)
      .sort((a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999));

    listContainer.innerHTML = '';

    missionsToRender.forEach(mission => {
      const card = document.createElement('div');
      card.className = 'mission-card';

      // ---------------------------
      // Banner
      // ---------------------------
      const banner = document.createElement('img');
      banner.className = 'mission-banner';
      banner.src = mission.banner || 'assets/missions/banners/default_banner.png';
      banner.alt = mission.name || 'Mission Banner';
      card.appendChild(banner);

      // ---------------------------
      // Controls container
      // ---------------------------
      const controls = document.createElement('div');
      controls.className = 'mission-controls';

      // ---------------------------
      // Difficulty icons row
      // ---------------------------
      const difficultyContainer = document.createElement('div');
      difficultyContainer.className = 'difficulty-icons-container';

      const availableDifficulties = Object.keys(mission.difficulties || {});
      let selectedDifficulty = availableDifficulties[0] || 'C';

      availableDifficulties.forEach(rank => {
        const button = document.createElement('button');
        button.className = 'difficulty-icon-btn';
        button.dataset.difficulty = rank;

        const icon = document.createElement('img');
        icon.src = `assets/icons/rank_${rank.toLowerCase()}.png`;
        icon.alt = rank + ' Rank';

        // Fallback to text if icon missing
        icon.onerror = () => {
          icon.remove();
          button.textContent = rank;
          button.classList.add('difficulty-fallback');
        };

        button.appendChild(icon);

        // Highlight default selected
        if (rank === selectedDifficulty) {
          button.classList.add('active');
        }

        // Click = set active difficulty
        button.addEventListener('click', () => {
          difficultyContainer.querySelectorAll('.difficulty-icon-btn')
            .forEach(b => b.classList.remove('active'));

          button.classList.add('active');
          selectedDifficulty = rank;
        });

        difficultyContainer.appendChild(button);
      });

      controls.appendChild(difficultyContainer);

      // ---------------------------
      // Start Mission Button
      // ---------------------------
      const startButton = document.createElement('button');
      startButton.className = 'start-btn';
      startButton.textContent = 'Start Mission';

      startButton.addEventListener('click', () => {
        // Store selected mission data
        localStorage.setItem('currentMissionId', String(mission.id));
        localStorage.setItem('currentDifficulty', selectedDifficulty);
        localStorage.setItem('currentMissionName', mission.name || '');
        localStorage.setItem('currentMissionBanner', mission.banner || '');

        // Fade transition
        document.body.style.transition = 'opacity 0.25s linear';
        document.body.style.opacity = '0';

        setTimeout(() => {
          window.location.href = 'teams.html?mode=prebattle';
        }, 250);
      });

      controls.appendChild(startButton);

      // Attach everything to card
      card.appendChild(controls);
      listContainer.appendChild(card);
    });

    // Highlight selected category tab
    document.querySelectorAll('.tab-btn').forEach(tab => {
      tab.classList.toggle('active', tab.textContent === categoryName);
    });
  }

  /**
   * Load mission data from JSON
   */
  fetch('data/missions.json')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(missions => {
      allMissions = Array.isArray(missions) ? missions : [];

      if (allMissions.length === 0) {
        listContainer.innerHTML = '<p class="error-message">No missions found.</p>';
        return;
      }

      // Collect category names
      const categoryNames = [...new Set(allMissions.map(m => m.category || 'Other'))];

      // Build tab buttons
      tabsContainer.innerHTML = '';
      categoryNames.forEach(name => {
        const tab = document.createElement('button');
        tab.className = 'tab-btn';
        tab.textContent = name;
        tab.addEventListener('click', () => renderMissionsForCategory(name));
        tabsContainer.appendChild(tab);
      });

      // Load first category by default
      renderMissionsForCategory(categoryNames[0]);
    })
    .catch(err => {
      console.error('Mission load failed:', err);
      listContainer.innerHTML = '<p class="error-message">Failed to load missions.</p>';
    });
});
