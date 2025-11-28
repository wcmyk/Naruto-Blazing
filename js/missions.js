// js/missions.js (FULL FUNCTIONALITY — UPDATED FOR NEW CSS)
document.addEventListener('DOMContentLoaded', () => {
  const tabsContainer = document.querySelector('.mission-tabs');
  const listContainer = document.querySelector('.mission-list');

  let allMissions = [];

  // ============================================================
  // Render missions for a category
  // ============================================================
  function renderMissionsForCategory(categoryName) {
    // Sort missions cleanly
    const missionsToRender = allMissions
      .filter(m => m.category === categoryName)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    listContainer.innerHTML = '';

    missionsToRender.forEach(mission => {

      // ======================================================
      // Mission Card
      // ======================================================
      const card = document.createElement('div');
      card.className = 'mission-item'; // <-- Matches missions.css

      // -------------------- Banner --------------------------
      const banner = document.createElement('img');
      banner.className = 'mission-banner';
      banner.src = mission.banner;
      banner.alt = mission.name || 'Mission Banner';
      card.appendChild(banner);

      // ======================================================
      // Controls Section (difficulty + start)
      // ======================================================
      const controls = document.createElement('div');
      controls.className = 'mission-controls';

      // ======================================================
      // Difficulty Icons Container
      // ======================================================
      const difficultyContainer = document.createElement('div');
      difficultyContainer.className = 'difficulty-icons-container';

      const availableDifficulties = Object.keys(mission.difficulties || {});
      let selectedDifficulty = availableDifficulties[0] || 'S';

      availableDifficulties.forEach(rank => {
        const iconButton = document.createElement('button');
        iconButton.className = 'difficulty-icon-btn'; // <-- Styled in CSS
        iconButton.dataset.difficulty = rank;

        const icon = document.createElement('img');
        icon.src = `assets/icons/${rank.toLowerCase()}_icons.png`;
        icon.alt = `Rank ${rank}`;
        icon.className = 'difficulty-icon-img';

        icon.onerror = () => {
          // fallback to text if missing icon
          icon.style.display = 'none';
          iconButton.textContent = rank;
          iconButton.classList.add('difficulty-fallback');
        };

        btn.appendChild(icon);

        // Default selected difficulty
        if (rank === selectedDifficulty) {
          iconButton.classList.add('active');
        }

        // ----------------- Button Click Logic -------------------
        iconButton.addEventListener('click', () => {
          difficultyContainer
            .querySelectorAll('.difficulty-icon-btn')
            .forEach(btn => btn.classList.remove('active'));

          iconButton.classList.add('active');
          selectedDifficulty = rank;
        });

        difficultyContainer.appendChild(btn);
      });

      controls.appendChild(difficultyContainer);

      // ======================================================
      // START MISSION BUTTON
      // ======================================================
      const startButton = document.createElement('button');
      startButton.className = 'mission-start-btn'; // <-- Styled version
      startButton.textContent = 'Start Mission';

      startButton.addEventListener('click', () => {
        // Save context
        localStorage.setItem('currentMissionId', String(mission.id));
        localStorage.setItem('currentDifficulty', selectedDifficulty);
        localStorage.setItem('currentMissionName', mission.name || '');
        localStorage.setItem('currentMissionBanner', mission.banner || '');

        // Fade transition
        document.body.style.transition = 'opacity 0.2s linear';
        document.body.style.opacity = '0';

        setTimeout(() => {
          window.location.href = 'teams.html?mode=prebattle';
        }, 250);
      });

      controls.appendChild(startButton);
      card.appendChild(controls);
      listContainer.appendChild(card);
    });

    // ======================================================
    // Update active tab CSS
    // ======================================================
    document.querySelectorAll('.mission-tab').forEach(tab => {
      tab.classList.toggle('active', tab.textContent === categoryName);
    });
  }

  // ============================================================
  // Load missions.json
  // ============================================================
  fetch('data/missions.json')
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(missions => {
      allMissions = Array.isArray(missions) ? missions : [];

      if (allMissions.length === 0) {
        listContainer.innerHTML = '<p>No missions found.</p>';
        return;
      }

      // build unique category list
      const categoryNames = [...new Set(allMissions.map(m => m.category))];

      // Render category tabs
      tabsContainer.innerHTML = '';
      categoryNames.forEach(name => {
        const tab = document.createElement('button');
        tab.className = 'mission-tab'; // <-- UPDATED
        tab.textContent = name;
        tab.addEventListener('click', () => renderMissionsForCategory(name));
        tabsContainer.appendChild(tab);
      });

      // Load first category by default
      if (categoryNames.length > 0) {
        renderMissionsForCategory(categoryNames[0]);
      } else {
        listContainer.innerHTML = '<p class="error-message">No missions found.</p>';
      }
    })
    .catch(err => {
      console.error('Mission load failed:', err);
      listContainer.innerHTML = '<p class="error-message">Failed to load missions.</p>';
    });
});
