// js/missions.js (Dropdown Version — routes to Teams page in pre-battle mode)
document.addEventListener('DOMContentLoaded', () => {
  const tabsContainer = document.querySelector('.mission-tabs');
  const listContainer = document.querySelector('.mission-list');
  let allMissions = [];

  function renderMissionsForCategory(categoryName) {
    const missionsToRender = allMissions
      .filter(m => m.category === categoryName)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    listContainer.innerHTML = '';

    missionsToRender.forEach(mission => {
      const card = document.createElement('div');
      card.className = 'mission-card';

      const banner = document.createElement('img');
      banner.className = 'mission-banner';
      banner.src = mission.banner;
      banner.alt = mission.name;
      card.appendChild(banner);

      const controls = document.createElement('div');
      controls.className = 'mission-controls';

      // Difficulty dropdown
      const select = document.createElement('select');
      select.className = 'difficulty-select';
      const availableDifficulties = Object.keys(mission.difficulties || {});
      availableDifficulties.forEach(rank => {
        const option = document.createElement('option');
        option.value = rank;
        option.textContent = `Rank ${rank}`;
        select.appendChild(option);
      });
      controls.appendChild(select);

      // Start button -> go to Teams page in pre-battle mode
      const startButton = document.createElement('button');
      startButton.className = 'start-btn';
      startButton.textContent = 'Start Mission';
      startButton.addEventListener('click', () => {
        const selectedDifficulty = select.value || availableDifficulties[0] || 'S';

        // Save context for the next pages
        localStorage.setItem('currentMissionId', String(mission.id));
        localStorage.setItem('currentDifficulty', selectedDifficulty);
        localStorage.setItem('currentMissionName', mission.name || '');
        localStorage.setItem('currentMissionBanner', mission.banner || '');

        // Transition to teams.html in pre-battle mode
        document.body.style.transition = 'opacity 0.2s linear';
        document.body.style.opacity = '0';
        setTimeout(() => {
          window.location.href = 'teams.html?mode=prebattle';
        }, 200);
      });
      controls.appendChild(startButton);

      card.appendChild(controls);
      listContainer.appendChild(card);
    });

    // Tab active state
    document.querySelectorAll('.tab-btn').forEach(tab => {
      tab.classList.toggle('active', tab.textContent === categoryName);
    });
  }

  // Load missions
  fetch('data/missions.json')
    .then(response => response.json())
    .then(missions => {
      allMissions = Array.isArray(missions) ? missions : [];
      const categoryNames = [...new Set(allMissions.map(m => m.category))];

      tabsContainer.innerHTML = '';
      categoryNames.forEach(name => {
        const tab = document.createElement('button');
        tab.className = 'tab-btn';
        tab.textContent = name;
        tab.addEventListener('click', () => renderMissionsForCategory(name));
        tabsContainer.appendChild(tab);
      });

      if (categoryNames.length > 0) {
        renderMissionsForCategory(categoryNames[0]);
      } else {
        listContainer.innerHTML = '<p class="error-message">No missions found.</p>';
      }
    })
    .catch(error => {
      console.error('Failed to load missions:', error);
      listContainer.innerHTML = '<p class="error-message">Could not load missions.</p>';
    });
});
