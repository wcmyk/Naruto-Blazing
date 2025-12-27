# Currency Synchronization System

## Overview
The game uses a unified currency system that syncs across all pages (index.html, summon.html, shop.html, etc.).

## Currencies

1. **Ninja Pearls** - Premium currency for summons and special items
2. **Shinobites** - Gacha currency for character summons
3. **Ryo** - Standard currency for upgrades and operations

## Default Values

All currencies start at **0** when the game is first loaded:
- Ninja Pearls: 0
- Shinobites: 0
- Ryo: 0

## How It Works

### Resources Module (`js/resources.js`)
- Centralized currency management using localStorage
- All pages use the same `Resources` module
- Changes are automatically saved and persist across sessions

### Top Bar HUD (`js/top-bar.js`)
- Displays current currency amounts
- Automatically updates when currency changes
- Synced across index.html and summon.html

### Auto-Sync System
When currency is modified via:
- `Resources.add('ninja_pearls', 100)` - Add currency
- `Resources.subtract('shinobites', 10)` - Subtract currency
- `Resources.set('ryo', 5000)` - Set currency to specific amount

The top bar automatically refreshes on **both pages** (no manual refresh needed).

## Testing Currency

### Console Commands (Available on any page)

Open browser console (F12) and use these helper functions:

```javascript
// Add test currency
addTestCurrency();
// Adds: 100 Ninja Pearls, 50 Shinobites, 10,000 Ryo

// Reset all currency to 0
resetCurrency();

// Display current amounts
showCurrency();
```

### Manual Operations

```javascript
// Add currency
Resources.add('ninja_pearls', 100);
Resources.add('shinobites', 50);
Resources.add('ryo', 10000);

// Subtract currency
Resources.subtract('ninja_pearls', 10);

// Set to specific amount
Resources.set('ryo', 50000);

// Check current amount
Resources.get('ninja_pearls'); // Returns current amount

// Check if can afford
Resources.has('ninja_pearls', 100); // Returns true/false
```

## Page Integration

### index.html
- Has top bar with currency display
- Loads: resources.js, top-bar.js
- Currency automatically displays

### summon.html
- Has top bar with currency display
- Loads: resources.js, top-bar.js, summon-currency.js
- Currency automatically displays
- Helper functions available (addTestCurrency, etc.)

### Future Pages
To add currency display to other pages:

1. Add CSS link:
```html
<link rel="stylesheet" href="css/top-bar.css" />
```

2. Add top bar HTML (copy from index.html):
```html
<div class="top-bar">...</div>
```

3. Load scripts:
```html
<script src="js/resources.js"></script>
<script src="js/top-bar.js"></script>
```

## Storage

- Stored in localStorage: `blazing_resources_v1`
- Persists across sessions
- Shared across all pages on same domain
- Clear with: `localStorage.clear()`

## Important Notes

- Currency changes are **instant** and sync automatically
- No page refresh needed
- Changes on summon.html appear on index.html immediately
- All pages share the same localStorage data
- Clearing localStorage resets all currency to default (0)

## Resetting Player Data

To start fresh:

```javascript
// Clear all resources (including currency)
localStorage.removeItem('blazing_resources_v1');

// Reload page
location.reload();
```

Or use the helper:
```javascript
resetCurrency(); // Resets only currency, keeps materials
```
