// js/inventory.js - Item Inventory Management
document.addEventListener('DOMContentLoaded', () => {
  // Initialize inventory from localStorage
  const INVENTORY_KEY = 'player_inventory';

  // Default item database
  const ITEMS_DATABASE = {
    awakening: [
      { id: 'scroll_3star', name: '3★ Awakening Scroll', icon: 'assets/items/scroll_3star.png', description: 'Used to awaken 3★ characters to 4★.' },
      { id: 'scroll_4star', name: '4★ Awakening Scroll', icon: 'assets/items/scroll_4star.png', description: 'Used to awaken 4★ characters to 5★.' },
      { id: 'scroll_5star', name: '5★ Awakening Scroll', icon: 'assets/items/scroll_5star.png', description: 'Used to awaken 5★ characters to 6★.' },
      { id: 'crystal_fire', name: 'Fire Crystal', icon: 'assets/items/crystal_fire.png', description: 'Fire-attribute awakening material.' },
      { id: 'crystal_water', name: 'Water Crystal', icon: 'assets/items/crystal_water.png', description: 'Water-attribute awakening material.' },
      { id: 'crystal_earth', name: 'Earth Crystal', icon: 'assets/items/crystal_earth.png', description: 'Earth-attribute awakening material.' },
      { id: 'crystal_wind', name: 'Wind Crystal', icon: 'assets/items/crystal_wind.png', description: 'Wind-attribute awakening material.' },
      { id: 'crystal_lightning', name: 'Lightning Crystal', icon: 'assets/items/crystal_lightning.png', description: 'Lightning-attribute awakening material.' }
    ],
    enhancement: [
      { id: 'pill_hp', name: 'HP Pill', icon: 'assets/items/pill_hp.png', description: 'Increases HP stat permanently.' },
      { id: 'pill_atk', name: 'ATK Pill', icon: 'assets/items/pill_atk.png', description: 'Increases ATK stat permanently.' },
      { id: 'pill_def', name: 'DEF Pill', icon: 'assets/items/pill_def.png', description: 'Increases DEF stat permanently.' },
      { id: 'pill_speed', name: 'Speed Pill', icon: 'assets/items/pill_speed.png', description: 'Increases Speed stat permanently.' }
    ],
    ramen: [
      { id: 'ramen_1star', name: '1★ Ramen', icon: 'assets/items/ramen_1star.png', description: 'Provides 500 EXP. Best for low-level characters.' },
      { id: 'ramen_2star', name: '2★ Ramen', icon: 'assets/items/ramen_2star.png', description: 'Provides 1,500 EXP. Good for mid-level characters.' },
      { id: 'ramen_3star', name: '3★ Ramen', icon: 'assets/items/ramen_3star.png', description: 'Provides 5,000 EXP. Great for high-level characters.' },
      { id: 'ramen_4star', name: '4★ Ramen', icon: 'assets/items/ramen_4star.png', description: 'Provides 15,000 EXP. Excellent for max-level characters.' },
      { id: 'ramen_5star', name: '5★ Ramen', icon: 'assets/items/ramen_5star.png', description: 'Provides 50,000 EXP. The ultimate experience boost.' }
    ],
    scrolls: [
      { id: 'limit_break_crystal', name: 'Limit Break Crystal', icon: 'assets/items/lb_crystal.png', description: 'Used to perform Limit Break on max-level characters.' },
      { id: 'acquisition_stone', name: 'Acquisition Stone', icon: 'assets/items/acq_stone.png', description: 'Can be exchanged for specific characters in the shop.' },
      { id: 'granny_coin', name: 'Granny Cat Coin', icon: 'assets/items/granny_coin.png', description: 'Special currency for Granny Cat Shop.' }
    ]
  };

  // Get or initialize inventory
  function getInventory() {
    const stored = localStorage.getItem(INVENTORY_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize with sample items
    return {
      'scroll_3star': 5,
      'scroll_4star': 3,
      'scroll_5star': 1,
      'crystal_fire': 10,
      'crystal_water': 8,
      'ramen_1star': 25,
      'ramen_2star': 15,
      'ramen_3star': 8,
      'pill_hp': 5,
      'pill_atk': 3,
      'limit_break_crystal': 2
    };
  }

  function saveInventory(inventory) {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
  }

  // Render items for a specific category
  function renderItems(category) {
    const grid = document.getElementById(`${category}-grid`);
    if (!grid) return;

    const items = ITEMS_DATABASE[category] || [];
    const inventory = getInventory();
    grid.innerHTML = '';

    if (items.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📦</div>
          <div class="empty-state-text">No items in this category</div>
          <div class="empty-state-subtext">Complete missions to obtain items!</div>
        </div>
      `;
      return;
    }

    items.forEach(item => {
      const quantity = inventory[item.id] || 0;

      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `
        <img src="${item.icon}" alt="${item.name}" class="item-icon" onerror="this.src='assets/items/placeholder.png'">
        <div class="item-name">${item.name}</div>
        <div class="item-quantity">×${quantity}</div>
      `;

      card.addEventListener('click', () => showItemDetails(item, quantity));
      grid.appendChild(card);
    });
  }

  // Show item details modal
  function showItemDetails(item, quantity) {
    const modal = document.getElementById('item-modal');
    const icon = document.getElementById('modal-item-icon');
    const name = document.getElementById('modal-item-name');
    const description = document.getElementById('modal-item-description');
    const quantityDisplay = document.getElementById('modal-item-quantity');

    icon.src = item.icon;
    icon.onerror = () => { icon.src = 'assets/items/placeholder.png'; };
    name.textContent = item.name;
    description.textContent = item.description;
    quantityDisplay.textContent = quantity;

    modal.classList.remove('hidden');
  }

  // Close modal
  function closeModal() {
    const modal = document.getElementById('item-modal');
    modal.classList.add('hidden');
  }

  document.getElementById('close-modal')?.addEventListener('click', closeModal);
  document.querySelector('.modal-overlay')?.addEventListener('click', closeModal);

  // Tab switching
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.dataset.tab;

      // Update active states
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanels.forEach(panel => panel.classList.remove('active'));

      button.classList.add('active');
      document.getElementById(`tab-${targetTab}`)?.classList.add('active');

      // Render items for the selected tab
      renderItems(targetTab);
    });
  });

  // Initialize with awakening materials tab
  renderItems('awakening');

  // Public API for adding items (can be called from mission completion)
  window.InventoryManager = {
    addItem: function(itemId, quantity = 1) {
      const inventory = getInventory();
      inventory[itemId] = (inventory[itemId] || 0) + quantity;
      saveInventory(inventory);

      // Re-render current tab if on inventory page
      const activeTab = document.querySelector('.tab-btn.active');
      if (activeTab) {
        renderItems(activeTab.dataset.tab);
      }

      return inventory[itemId];
    },

    removeItem: function(itemId, quantity = 1) {
      const inventory = getInventory();
      if (!inventory[itemId] || inventory[itemId] < quantity) {
        return false; // Not enough items
      }
      inventory[itemId] -= quantity;
      if (inventory[itemId] === 0) {
        delete inventory[itemId];
      }
      saveInventory(inventory);

      // Re-render current tab if on inventory page
      const activeTab = document.querySelector('.tab-btn.active');
      if (activeTab) {
        renderItems(activeTab.dataset.tab);
      }

      return true;
    },

    getItemQuantity: function(itemId) {
      const inventory = getInventory();
      return inventory[itemId] || 0;
    },

    getAllItems: function() {
      return getInventory();
    }
  };
});
