// js/panel-missions.js - Panel Mission System

class PanelMissions {
  constructor() {
    this.panels = [];
    this.currentPanel = null;
  }

  async init() {
    await this.loadPanels();
    this.loadPanelProgress();
    console.log('✅ Panel Missions initialized');
  }

  async loadPanels() {
    try {
      const response = await fetch('data/panel.json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      this.panels = data.panels || [];
      console.log(`Loaded ${this.panels.length} panel missions`);
    } catch (error) {
      console.error('Failed to load panel missions:', error);
      this.panels = [];
    }
  }

  loadPanelProgress() {
    try {
      const saved = localStorage.getItem('blazing_panel_progress');
      if (saved) {
        const progress = JSON.parse(saved);
        // Merge saved progress with panels
        this.panels.forEach(panel => {
          const savedPanel = progress.find(p => p.id === panel.id);
          if (savedPanel) {
            panel.rewards.forEach((reward, index) => {
              const savedReward = savedPanel.rewards[index];
              if (savedReward) {
                reward.unlocked = savedReward.unlocked || false;
              }
            });
          }
        });
      }
    } catch (error) {
      console.error('Failed to load panel progress:', error);
    }
  }

  savePanelProgress() {
    try {
      const progress = this.panels.map(panel => ({
        id: panel.id,
        rewards: panel.rewards.map(r => ({ unlocked: r.unlocked }))
      }));
      localStorage.setItem('blazing_panel_progress', JSON.stringify(progress));
    } catch (error) {
      console.error('Failed to save panel progress:', error);
    }
  }

  unlockReward(panelId, position) {
    const panel = this.panels.find(p => p.id === panelId);
    if (!panel) return { success: false, message: 'Panel not found' };

    const reward = panel.rewards.find(r => r.position === position);
    if (!reward) return { success: false, message: 'Reward not found' };

    if (reward.unlocked) {
      return { success: false, message: 'Reward already unlocked' };
    }

    reward.unlocked = true;
    this.savePanelProgress();

    // Give reward to player
    this.giveReward(reward);

    return {
      success: true,
      message: `Unlocked: ${reward.description}`,
      reward: reward
    };
  }

  giveReward(reward) {
    // Give the reward based on type
    switch (reward.type) {
      case 'character':
        if (window.InventoryChar) {
          for (let i = 0; i < reward.quantity; i++) {
            window.InventoryChar.addCopy(reward.characterId, 1, reward.tierCode || '3S');
          }
          console.log(`Gave character: ${reward.characterId} x${reward.quantity}`);
        }
        break;

      case 'resource':
        if (window.ResourceManager) {
          const resourceKey = reward.resourceName.toLowerCase().replace(/\s+/g, '_');
          window.ResourceManager.addResource(resourceKey, reward.quantity);
          console.log(`Gave resource: ${reward.resourceName} x${reward.quantity}`);
        }
        break;

      case 'item':
        // TODO: Implement item system
        console.log(`Gave item: ${reward.itemId} x${reward.quantity}`);
        break;
    }
  }

  openPanelModal() {
    if (this.panels.length === 0) {
      alert('No panel missions available');
      return;
    }

    this.showPanelListModal();
  }

  showPanelListModal() {
    const panelsHTML = this.panels.map(panel => {
      const totalRewards = panel.rewards.length;
      const unlockedCount = panel.rewards.filter(r => r.unlocked).length;
      const progressPercent = Math.floor((unlockedCount / totalRewards) * 100);

      return `
        <div class="panel-item" onclick="window.PanelMissions.showPanelDetails('${panel.id}')">
          <img src="${panel.bannerImage}" alt="${panel.name}" class="panel-banner" onerror="this.src='assets/placeholder.png';">
          <div class="panel-info">
            <div class="panel-name">${panel.name}</div>
            <div class="panel-progress">
              <div class="panel-progress-bar">
                <div class="panel-progress-fill" style="width: ${progressPercent}%"></div>
              </div>
              <div class="panel-progress-text">${unlockedCount}/${totalRewards} Complete</div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const modalHTML = `
      <div class="panel-modal" id="panel-modal">
        <div class="panel-overlay" onclick="window.PanelMissions.closePanelModal()"></div>
        <div class="panel-content">
          <div class="panel-header">
            <h2>Panel Missions</h2>
            <button class="panel-close" onclick="window.PanelMissions.closePanelModal()">✕</button>
          </div>
          <div class="panel-list">
            ${panelsHTML}
          </div>
        </div>
      </div>
    `;

    // Remove existing modal if present
    const existingModal = document.getElementById('panel-modal');
    if (existingModal) {
      existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.injectPanelStyles();
  }

  showPanelDetails(panelId) {
    const panel = this.panels.find(p => p.id === panelId);
    if (!panel) return;

    this.currentPanel = panel;

    // Create 3x3 grid of rewards
    const rewardsHTML = panel.rewards.map(reward => {
      const unlockedClass = reward.unlocked ? 'unlocked' : 'locked';
      const icon = this.getRewardIcon(reward);

      return `
        <div class="reward-cell ${unlockedClass}" data-position="${reward.position}">
          <div class="reward-icon">${icon}</div>
          <div class="reward-description">${reward.description}</div>
          <div class="reward-requirement">${reward.requirement}</div>
          ${!reward.unlocked ? `<button class="btn-unlock-reward" onclick="window.PanelMissions.unlockReward('${panelId}', ${reward.position})">Unlock</button>` : '<div class="reward-unlocked-badge">✓</div>'}
        </div>
      `;
    }).join('');

    const modalHTML = `
      <div class="panel-detail-modal" id="panel-detail-modal">
        <div class="panel-detail-overlay" onclick="window.PanelMissions.closePanelDetails()"></div>
        <div class="panel-detail-content" style="background: url('assets/Main Background/mission-panel.png') center/cover no-repeat;">
          <div class="panel-detail-header">
            <button class="panel-back" onclick="window.PanelMissions.closePanelDetails()">← Back</button>
            <h2>${panel.name}</h2>
            <button class="panel-close" onclick="window.PanelMissions.closePanelDetails()">✕</button>
          </div>
          <div class="panel-detail-description">${panel.description}</div>
          <div class="panel-rewards-grid">
            ${rewardsHTML}
          </div>
        </div>
      </div>
    `;

    // Remove existing detail modal if present
    const existingModal = document.getElementById('panel-detail-modal');
    if (existingModal) {
      existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.injectPanelDetailStyles();
  }

  getRewardIcon(reward) {
    switch (reward.type) {
      case 'character':
        return '👤';
      case 'resource':
        if (reward.resourceName.includes('Pearl')) return '💎';
        if (reward.resourceName.includes('Ryo')) return '💰';
        if (reward.resourceName.includes('Shinobite')) return '✨';
        return '📦';
      case 'item':
        return '🍜';
      default:
        return '🎁';
    }
  }

  closePanelModal() {
    const modal = document.getElementById('panel-modal');
    if (modal) {
      modal.remove();
    }
  }

  closePanelDetails() {
    const modal = document.getElementById('panel-detail-modal');
    if (modal) {
      modal.remove();
    }
    // Show the list again
    this.showPanelListModal();
  }

  injectPanelStyles() {
    if (document.getElementById('panel-modal-styles')) return;

    const styles = `
      <style id="panel-modal-styles">
        .panel-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .panel-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(5px);
        }

        .panel-content {
          position: relative;
          background: linear-gradient(135deg, rgba(26, 31, 58, 0.98), rgba(15, 20, 35, 0.98));
          border: 3px solid #b8985f;
          border-radius: 16px;
          padding: 30px;
          max-width: 800px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 10px 50px rgba(0, 0, 0, 0.9);
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid rgba(184, 152, 95, 0.3);
        }

        .panel-header h2 {
          font-family: 'Times New Roman', Times, serif;
          font-size: 28px;
          font-weight: 700;
          color: #d4af37;
          margin: 0;
        }

        .panel-close {
          background: rgba(220, 53, 69, 0.2);
          border: 2px solid rgba(220, 53, 69, 0.5);
          color: #ff6b6b;
          font-size: 24px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .panel-close:hover {
          background: rgba(220, 53, 69, 0.4);
          transform: scale(1.1);
        }

        .panel-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .panel-item {
          background: rgba(20, 20, 30, 0.6);
          border: 2px solid rgba(139, 115, 85, 0.4);
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          gap: 15px;
        }

        .panel-item:hover {
          border-color: rgba(212, 175, 55, 0.7);
          transform: translateX(5px);
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
        }

        .panel-banner {
          width: 200px;
          height: 100px;
          object-fit: cover;
        }

        .panel-info {
          flex: 1;
          padding: 15px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .panel-name {
          font-family: 'Times New Roman', Times, serif;
          font-size: 20px;
          font-weight: 700;
          color: #d4af37;
          margin-bottom: 10px;
        }

        .panel-progress-bar {
          background: rgba(0, 0, 0, 0.5);
          height: 12px;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 5px;
        }

        .panel-progress-fill {
          background: linear-gradient(90deg, #d4af37, #f0e6d1);
          height: 100%;
          transition: width 0.3s ease;
        }

        .panel-progress-text {
          font-size: 12px;
          color: #b8985f;
          text-align: right;
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
  }

  injectPanelDetailStyles() {
    if (document.getElementById('panel-detail-styles')) return;

    const styles = `
      <style id="panel-detail-styles">
        .panel-detail-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .panel-detail-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
        }

        .panel-detail-content {
          position: relative;
          border: 3px solid #d4af37;
          border-radius: 16px;
          padding: 30px;
          max-width: 900px;
          width: 90%;
          max-height: 85vh;
          overflow-y: auto;
          box-shadow: 0 10px 50px rgba(0, 0, 0, 0.9);
          background-color: rgba(0, 0, 0, 0.7);
          background-blend-mode: darken;
        }

        .panel-detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 2px solid rgba(184, 152, 95, 0.3);
        }

        .panel-detail-header h2 {
          font-family: 'Times New Roman', Times, serif;
          font-size: 28px;
          font-weight: 700;
          color: #d4af37;
          margin: 0;
          flex: 1;
          text-align: center;
        }

        .panel-back {
          background: rgba(139, 115, 85, 0.2);
          border: 2px solid rgba(139, 115, 85, 0.5);
          color: #b8985f;
          font-family: 'Times New Roman', Times, serif;
          font-size: 16px;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .panel-back:hover {
          background: rgba(139, 115, 85, 0.4);
          color: #d4af37;
        }

        .panel-detail-description {
          font-family: 'Times New Roman', Times, serif;
          font-size: 16px;
          color: #f0e6d1;
          margin-bottom: 25px;
          text-align: center;
        }

        .panel-rewards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }

        .reward-cell {
          background: rgba(20, 20, 30, 0.8);
          border: 2px solid rgba(139, 115, 85, 0.4);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          transition: all 0.3s ease;
          position: relative;
        }

        .reward-cell.unlocked {
          border-color: rgba(107, 207, 127, 0.6);
          background: rgba(40, 167, 69, 0.1);
        }

        .reward-cell.locked:hover {
          border-color: rgba(212, 175, 55, 0.7);
          transform: translateY(-5px);
        }

        .reward-icon {
          font-size: 48px;
          margin-bottom: 10px;
        }

        .reward-description {
          font-family: 'Times New Roman', Times, serif;
          font-size: 14px;
          font-weight: 700;
          color: #d4af37;
          margin-bottom: 8px;
        }

        .reward-requirement {
          font-size: 12px;
          color: #b8985f;
          margin-bottom: 15px;
        }

        .btn-unlock-reward {
          background: linear-gradient(135deg, #b8985f, #d4af37);
          border: 2px solid #d4af37;
          color: #1a1f3a;
          font-family: 'Times New Roman', Times, serif;
          font-size: 14px;
          font-weight: 700;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
        }

        .btn-unlock-reward:hover {
          background: linear-gradient(135deg, #d4af37, #f0e6d1);
          transform: translateY(-2px);
        }

        .reward-unlocked-badge {
          background: rgba(107, 207, 127, 0.2);
          border: 2px solid rgba(107, 207, 127, 0.6);
          color: #6bcf7f;
          font-size: 32px;
          font-weight: 700;
          padding: 10px;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
  }
}

// Global instance
window.PanelMissions = new PanelMissions();

console.log('✅ Panel Missions module loaded');
