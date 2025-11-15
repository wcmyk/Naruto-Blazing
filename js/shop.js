// Shop System - Handles purchasing items and resources
(() => {
  "use strict";

  const Shop = {
    shopData: null,
    playerResources: {
      ryo: 0,
      pearls: 0
    },
    currentItem: null,
    currentQuantity: 1,

    async init() {
      console.log("[Shop] Initializing shop system...");

      // Load shop data
      await this.loadShopData();

      // Load player resources
      this.loadPlayerResources();

      // Setup event listeners
      this.setupEventListeners();

      // Render initial tab
      this.renderTab('ramen');

      // Update resource display
      this.updateResourceDisplay();

      console.log("[Shop] ✅ Shop initialized");
    },

    async loadShopData() {
      try {
        const response = await fetch('data/shop.json');
        const data = await response.json();
        this.shopData = data.shop;
        console.log("[Shop] Shop data loaded:", this.shopData);
      } catch (error) {
        console.error("[Shop] Failed to load shop data:", error);
        this.shopData = { ramen: [], materials: [], resources: [] };
      }
    },

    loadPlayerResources() {
      // Load from localStorage
      const saved = localStorage.getItem('blazing_resources_v1');
      if (saved) {
        this.playerResources = JSON.parse(saved);
      } else {
        // Default starting resources
        this.playerResources = {
          ryo: 10000,
          pearls: 50
        };
        this.savePlayerResources();
      }
      console.log("[Shop] Player resources loaded:", this.playerResources);
    },

    savePlayerResources() {
      localStorage.setItem('blazing_resources_v1', JSON.stringify(this.playerResources));
    },

    updateResourceDisplay() {
      const ryoEl = document.getElementById('player-ryo');
      const pearlsEl = document.getElementById('player-pearls');

      if (ryoEl) ryoEl.textContent = this.playerResources.ryo.toLocaleString();
      if (pearlsEl) pearlsEl.textContent = this.playerResources.pearls.toLocaleString();
    },

    setupEventListeners() {
      // Tab switching
      document.querySelectorAll('.shop-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
          const tabName = e.target.dataset.tab;
          this.switchTab(tabName);
        });
      });

      // Purchase modal controls
      const qtyMinus = document.getElementById('qty-minus');
      const qtyPlus = document.getElementById('qty-plus');
      const qtyInput = document.getElementById('qty-input');

      if (qtyMinus) {
        qtyMinus.addEventListener('click', () => {
          const current = parseInt(qtyInput.value) || 1;
          if (current > 1) {
            qtyInput.value = current - 1;
            this.updatePurchaseCost();
          }
        });
      }

      if (qtyPlus) {
        qtyPlus.addEventListener('click', () => {
          const current = parseInt(qtyInput.value) || 1;
          if (current < 99) {
            qtyInput.value = current + 1;
            this.updatePurchaseCost();
          }
        });
      }

      if (qtyInput) {
        qtyInput.addEventListener('change', () => {
          let value = parseInt(qtyInput.value) || 1;
          value = Math.max(1, Math.min(99, value));
          qtyInput.value = value;
          this.updatePurchaseCost();
        });
      }

      // Confirm purchase
      const btnConfirm = document.getElementById('btn-confirm-purchase');
      if (btnConfirm) {
        btnConfirm.addEventListener('click', () => this.confirmPurchase());
      }

      // Cancel purchase
      const btnCancel = document.getElementById('btn-cancel-purchase');
      if (btnCancel) {
        btnCancel.addEventListener('click', () => this.closeModal('purchase-modal'));
      }

      // Close success modal
      const btnCloseSuccess = document.getElementById('btn-close-success');
      if (btnCloseSuccess) {
        btnCloseSuccess.addEventListener('click', () => this.closeModal('success-modal'));
      }

      // Bottom bar navigation
      document.getElementById('btn-home')?.addEventListener('click', () => window.location.href = 'index.html');
      document.getElementById('btn-team')?.addEventListener('click', () => window.location.href = 'team.html');
      document.getElementById('btn-fusion')?.addEventListener('click', () => window.location.href = 'fusion.html');
      document.getElementById('btn-missions')?.addEventListener('click', () => window.location.href = 'missions.html');
    },

    switchTab(tabName) {
      // Update tab buttons
      document.querySelectorAll('.shop-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
      });

      // Update tab content
      document.querySelectorAll('.shop-tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `tab-${tabName}`);
      });

      // Render tab content
      this.renderTab(tabName);
    },

    renderTab(tabName) {
      const items = this.shopData[tabName] || [];
      const gridId = `${tabName}-grid`;
      const grid = document.getElementById(gridId);

      if (!grid) return;

      grid.innerHTML = '';

      items.forEach(item => {
        const card = this.createItemCard(item, tabName);
        grid.appendChild(card);
      });
    },

    createItemCard(item, category) {
      const card = document.createElement('div');
      card.className = 'shop-item';

      // Determine cost display
      let costHTML = '';
      if (item.cost) {
        if (item.cost.ryo) {
          costHTML = `
            <div class="item-cost">
              <img src="assets/icons/ryo_icon.png" alt="Ryo" onerror="this.style.display='none'">
              <span>${item.cost.ryo.toLocaleString()}</span>
            </div>
          `;
        } else if (item.cost.pearls) {
          costHTML = `
            <div class="item-cost">
              <img src="assets/icons/pearl_icon.png" alt="Pearls" onerror="this.style.display='none'">
              <span>${item.cost.pearls.toLocaleString()}</span>
            </div>
          `;
        }
      }

      // Build tier display if exists
      const tierHTML = item.tier ? `<div class="item-tier">${item.tier}</div>` : '';

      // Build exp display if exists
      const expInfo = item.exp ? ` (+${item.exp.toLocaleString()} EXP)` : '';

      card.innerHTML = `
        <div class="item-header">
          <div class="item-icon">
            <img src="${item.icon}" alt="${item.name}" onerror="this.src='assets/characters/common/silhouette.png'">
          </div>
          <div class="item-info">
            <div class="item-name">${item.name}</div>
            ${tierHTML}
          </div>
        </div>
        <div class="item-description">${item.description}${expInfo}</div>
        <div class="item-footer">
          ${costHTML}
          <button class="btn-buy">Buy</button>
        </div>
      `;

      // Add click handler to buy button
      const buyBtn = card.querySelector('.btn-buy');
      buyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openPurchaseModal(item, category);
      });

      return card;
    },

    openPurchaseModal(item, category) {
      this.currentItem = { ...item, category };
      this.currentQuantity = 1;

      // Populate modal
      const modal = document.getElementById('purchase-modal');
      const icon = document.getElementById('purchase-item-icon');
      const name = document.getElementById('purchase-item-name');
      const desc = document.getElementById('purchase-item-desc');
      const qtyInput = document.getElementById('qty-input');

      if (icon) icon.src = item.icon;
      if (name) name.textContent = item.name;
      if (desc) desc.textContent = item.description;
      if (qtyInput) qtyInput.value = 1;

      this.updatePurchaseCost();

      // Show modal
      modal.classList.remove('hidden');
    },

    updatePurchaseCost() {
      const qtyInput = document.getElementById('qty-input');
      const quantity = parseInt(qtyInput?.value) || 1;
      const costEl = document.getElementById('purchase-total-cost');

      if (!this.currentItem || !costEl) return;

      const item = this.currentItem;
      let costHTML = '';

      if (item.cost.ryo) {
        const total = item.cost.ryo * quantity;
        costHTML = `<span style="display: flex; align-items: center; gap: 8px;">
          <img src="assets/icons/ryo_icon.png" alt="Ryo" style="width: 20px; height: 20px;" onerror="this.style.display='none'">
          ${total.toLocaleString()}
        </span>`;
      } else if (item.cost.pearls) {
        const total = item.cost.pearls * quantity;
        costHTML = `<span style="display: flex; align-items: center; gap: 8px;">
          <img src="assets/icons/pearl_icon.png" alt="Pearls" style="width: 20px; height: 20px;" onerror="this.style.display='none'">
          ${total.toLocaleString()}
        </span>`;
      }

      costEl.innerHTML = costHTML;
    },

    confirmPurchase() {
      const qtyInput = document.getElementById('qty-input');
      const quantity = parseInt(qtyInput?.value) || 1;
      const item = this.currentItem;

      if (!item) return;

      // Calculate total cost
      let totalCost = 0;
      let costType = '';

      if (item.cost.ryo) {
        totalCost = item.cost.ryo * quantity;
        costType = 'ryo';
      } else if (item.cost.pearls) {
        totalCost = item.cost.pearls * quantity;
        costType = 'pearls';
      }

      // Check if player has enough resources
      if (this.playerResources[costType] < totalCost) {
        alert(`Insufficient ${costType}! You need ${totalCost.toLocaleString()} but only have ${this.playerResources[costType].toLocaleString()}.`);
        return;
      }

      // Deduct cost
      this.playerResources[costType] -= totalCost;
      this.savePlayerResources();
      this.updateResourceDisplay();

      // Add items to inventory
      this.addItemsToInventory(item, quantity);

      // Close purchase modal
      this.closeModal('purchase-modal');

      // Show success modal
      this.showSuccessModal(item, quantity);

      console.log(`[Shop] Purchased ${quantity}x ${item.name} for ${totalCost} ${costType}`);
    },

    addItemsToInventory(item, quantity) {
      // Get or create inventory
      let inventory = JSON.parse(localStorage.getItem('blazing_shop_inventory_v1') || '{}');

      // Initialize category if doesn't exist
      if (!inventory[item.category]) {
        inventory[item.category] = {};
      }

      // Add or increment item count
      if (!inventory[item.category][item.id]) {
        inventory[item.category][item.id] = {
          ...item,
          count: 0
        };
      }

      inventory[item.category][item.id].count += quantity;

      // Save inventory
      localStorage.setItem('blazing_shop_inventory_v1', JSON.stringify(inventory));
      console.log(`[Shop] Added ${quantity}x ${item.name} to inventory`);
    },

    showSuccessModal(item, quantity) {
      const modal = document.getElementById('success-modal');
      const message = document.getElementById('success-message');

      if (message) {
        let itemInfo = `${quantity}x ${item.name}`;
        if (item.exp) {
          itemInfo += ` (Total: ${(item.exp * quantity).toLocaleString()} EXP)`;
        }
        message.innerHTML = `You successfully purchased:<br><strong style="color: #ffd700;">${itemInfo}</strong>`;
      }

      modal.classList.remove('hidden');
    },

    closeModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('hidden');
      }
    }
  };

  // Initialize shop when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Shop.init());
  } else {
    Shop.init();
  }

  // Export for external access
  window.Shop = Shop;
})();
