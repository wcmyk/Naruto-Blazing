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

      // Difficulty icons instead of dropdown
      const difficultyContainer = document.createElement('div');
      difficultyContainer.className = 'difficulty-icons-container';
      difficultyContainer.style.cssText = `
        display: flex;
        gap: 0.5rem;
        align-items: center;
        margin-bottom: 1rem;
      `;

      const availableDifficulties = Object.keys(mission.difficulties || {});
      let selectedDifficulty = availableDifficulties[0] || 'S';

      availableDifficulties.forEach(rank => {
        const iconButton = document.createElement('button');
        iconButton.className = 'difficulty-icon-btn';
        iconButton.dataset.difficulty = rank;
        iconButton.style.cssText = `
          background: none;
          border: 3px solid transparent;
          border-radius: 8px;
          padding: 0.3rem;
          cursor: pointer;
          transition: all 0.2s;
          opacity: 0.5;
        `;

        const icon = document.createElement('img');
        icon.src = `assets/icons/${rank.toLowerCase()}_icons.png`;
        icon.alt = `Rank ${rank}`;
        icon.style.cssText = `
          width: 50px;
          height: 50px;
          display: block;
        `;
        icon.onerror = () => {
          // Fallback to text if icon not found
          icon.style.display = 'none';
          iconButton.textContent = rank;
          iconButton.style.fontSize = '1.5rem';
          iconButton.style.fontWeight = 'bold';
          iconButton.style.color = '#FFD700';
        };

        iconButton.appendChild(icon);

        // Selection logic
        if (rank === selectedDifficulty) {
          iconButton.style.opacity = '1';
          iconButton.style.borderColor = '#FFD700';
          iconButton.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.8)';
        }

        iconButton.addEventListener('click', () => {
          // Deselect all
          difficultyContainer.querySelectorAll('.difficulty-icon-btn').forEach(btn => {
            btn.style.opacity = '0.5';
            btn.style.borderColor = 'transparent';
            btn.style.boxShadow = 'none';
          });

          // Select clicked
          iconButton.style.opacity = '1';
          iconButton.style.borderColor = '#FFD700';
          iconButton.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.8)';
          selectedDifficulty = rank;
        });

        iconButton.addEventListener('mouseenter', () => {
          if (rank !== selectedDifficulty) {
            iconButton.style.opacity = '0.8';
            iconButton.style.transform = 'scale(1.1)';
          }
        });

        iconButton.addEventListener('mouseleave', () => {
          if (rank !== selectedDifficulty) {
            iconButton.style.opacity = '0.5';
            iconButton.style.transform = 'scale(1)';
          }
        });

        difficultyContainer.appendChild(iconButton);
      });

      controls.appendChild(difficultyContainer);

      // Start button -> go to Teams page in pre-battle mode
      const startButton = document.createElement('button');
      startButton.className = 'start-btn';
      startButton.textContent = 'Start Mission';
      startButton.addEventListener('click', () => {

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
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
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
