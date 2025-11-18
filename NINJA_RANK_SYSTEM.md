# Ninja Rank & EXP System Documentation

## Overview

Complete experience and leveling system for player progression from Rank 1 to Rank 100.

---

## 📊 Rank Progression Data

**File:** `data/ninja-ranks.json`

- **Total Ranks:** 1-100
- **Max EXP Required:** 112,100 (for Rank 100)
- **Progression Curve:** Exponential (increases ~2-5% per rank)

### Sample Progression:
```
Rank 1  → 0 EXP
Rank 2  → 120 EXP (+120)
Rank 10 → 1,800 EXP
Rank 25 → 8,600 EXP
Rank 50 → 30,600 EXP
Rank 75 → 65,100 EXP
Rank 100 → 112,100 EXP
```

---

## 🎮 System Components

### 1. **NinjaRank Module** (`js/ninja-rank.js`)
Core logic for EXP tracking, rank-ups, and progression

**Features:**
- ✅ Automatic rank-up when EXP threshold reached
- ✅ Multiple rank-ups in single EXP gain (if enough EXP)
- ✅ EXP progress tracking (0-1 percentage)
- ✅ LocalStorage persistence
- ✅ Callbacks for rank-up and EXP gain events
- ✅ Max rank detection (Rank 100)

### 2. **Enhanced TopBar** (`js/top-bar-enhanced.js`)
Updated top bar with EXP progress bar and visual feedback

**Features:**
- ✅ Real-time EXP progress bar
- ✅ "EXP to next rank" text display
- ✅ Rank-up animations
- ✅ Floating +EXP indicators
- ✅ Visual notifications

### 3. **Rank System CSS** (`css/rank-system.css`)
Styling for progress bar, animations, and notifications

**Features:**
- ✅ Gradient progress bar with shimmer effect
- ✅ "Near rank-up" glow (80%+ progress)
- ✅ Max rank gold styling
- ✅ Rank-up notification popup
- ✅ Floating EXP gain indicators
- ✅ Responsive design (mobile/tablet)

---

## 🔧 Integration Steps

### Step 1: Add CSS Link to `<head>`

```html
<link rel="stylesheet" href="css/background.css" />
<link rel="stylesheet" href="css/top-bar.css" />
<link rel="stylesheet" href="css/rank-system.css" />  <!-- NEW -->
```

### Step 2: Replace Top Bar HTML

**OLD:**
```html
<div class="ninja-rank-container">
  <span class="ninja-rank-label">Ninja Rank:</span>
  <span class="ninja-rank-value" id="ninja-rank-value">1</span>
</div>
```

**NEW:**
```html
<div class="ninja-rank-container">
  <!-- Rank Display -->
  <div class="ninja-rank-row">
    <span class="ninja-rank-label">Ninja Rank:</span>
    <span class="ninja-rank-value" id="ninja-rank-value">1</span>
  </div>

  <!-- EXP Progress Bar -->
  <div class="rank-progress-container">
    <div class="rank-progress-bar">
      <div class="rank-progress-fill" id="rank-progress-fill" style="width: 0%"></div>
    </div>
    <span class="rank-progress-text" id="rank-progress-text">0 to next rank</span>
  </div>
</div>
```

### Step 3: Update Script Loading Order

**OLD:**
```html
<script src="js/resources.js"></script>
<script src="js/top-bar.js"></script>
```

**NEW:**
```html
<script src="js/resources.js"></script>
<script src="js/ninja-rank.js"></script>         <!-- NEW -->
<script src="js/top-bar-enhanced.js"></script>   <!-- RENAMED -->
```

**OR** keep the same filename by renaming:
```bash
mv js/top-bar-enhanced.js js/top-bar.js
```

### Step 4: Apply to All Pages

Update these files with the above changes:
- ✅ `index.html`
- ✅ `summon.html`
- ✅ Any other pages with the top bar

---

## 💻 JavaScript API

### Adding EXP

```javascript
// Add EXP to player
const result = NinjaRank.addExp(100);

console.log(result);
// {
//   expGained: 100,
//   expBefore: 0,
//   expAfter: 100,
//   rankBefore: 1,
//   rankAfter: 1,
//   ranksGained: [],
//   didRankUp: false
// }
```

### Multiple Rank-Ups

```javascript
// Adding enough EXP to rank up multiple times
NinjaRank.addExp(10000);
// Will automatically rank up through all thresholds
// Rank-up notifications will appear for each rank
```

### Getting Current Stats

```javascript
// Get current rank
NinjaRank.getRank();  // Returns: 5

// Get current EXP
NinjaRank.getExp();  // Returns: 650

// Get EXP needed for next rank
NinjaRank.getExpToNextRank();  // Returns: 150

// Get progress (0-1)
NinjaRank.getExpProgress();  // Returns: 0.75 (75%)

// Check if max rank
NinjaRank.isMaxRank();  // Returns: false
```

### Admin/Testing Functions

```javascript
// Set rank directly (bypasses progression)
NinjaRank.setRank(50);

// Set EXP directly
NinjaRank.setExp(25000);

// Reset to Rank 1
NinjaRank.reset();
```

---

## 🎨 Visual Features

### Progress Bar States

1. **Normal (0-79%):**
   - Gold gradient fill
   - Subtle shimmer animation

2. **Near Rank-Up (80-99%):**
   - Bright gold with pulsing glow
   - More intense shimmer

3. **Max Rank (100):**
   - Bright golden fill
   - "MAX" badge on rank value
   - Golden glow effect

### Animations

1. **Rank-Up:**
   - Rank value scales and rotates
   - Golden glow pulse
   - Full-screen notification popup
   - Lasts 3 seconds

2. **EXP Gain:**
   - Floating "+X EXP" indicator
   - Fades and floats upward
   - Green color

3. **Progress Bar:**
   - Smooth width transition (0.5s)
   - Continuous shimmer effect

---

## 🎯 Example Use Cases

### 1. Mission Completion
```javascript
// Player completes a mission
function completeMission(missionData) {
  const expReward = missionData.expReward || 50;

  // Add EXP
  const result = NinjaRank.addExp(expReward);

  if (result.didRankUp) {
    console.log(`Ranked up to ${result.rankAfter}!`);
    // Give rank-up rewards
    giveRankUpReward(result.rankAfter);
  }
}
```

### 2. Battle Victory
```javascript
// Player wins a battle
function onBattleWin(enemyLevel) {
  const expGain = calculateBattleExp(enemyLevel);
  NinjaRank.addExp(expGain);
}
```

### 3. Daily Login
```javascript
// Daily login bonus
function claimDailyBonus(day) {
  const expBonus = day * 10; // 10 EXP per login day
  NinjaRank.addExp(expBonus);
}
```

### 4. Character Summon
```javascript
// First-time character summon
function onCharacterSummoned(character) {
  if (!hasCharacter(character.id)) {
    NinjaRank.addExp(25); // 25 EXP for new character
  }
}
```

---

## 💾 LocalStorage

### Keys Used:
- `blazing_player_rank` - Current rank (1-100)
- `blazing_player_exp` - Current total EXP

### Data Persistence:
- Automatically saves on every change
- Loads on page load
- Survives page refresh/close
- Shared across all pages

### Reset Player Data:
```javascript
// Clear all rank data
localStorage.removeItem('blazing_player_rank');
localStorage.removeItem('blazing_player_exp');
location.reload();

// Or use built-in reset
NinjaRank.reset();
```

---

## 🔍 Console Testing

Open browser console (F12) and test:

```javascript
// === RANK TESTING ===

// Add small amount
NinjaRank.addExp(50);

// Add enough to rank up
NinjaRank.addExp(500);

// Add massive amount (multiple rank-ups)
NinjaRank.addExp(50000);

// Jump to specific rank
NinjaRank.setRank(75);

// === PROGRESS TRACKING ===

// Check current stats
console.log('Rank:', NinjaRank.getRank());
console.log('EXP:', NinjaRank.getExp());
console.log('To Next:', NinjaRank.getExpToNextRank());
console.log('Progress:', NinjaRank.getExpProgress());

// === RESET ===

NinjaRank.reset();  // Back to Rank 1
```

---

## 🎨 Customization

### Adjust Rank-Up Notification Duration

In `js/top-bar-enhanced.js`:
```javascript
// Change from 3 seconds to 5 seconds
setTimeout(() => {
  notification.classList.remove('show');
  setTimeout(() => notification.remove(), 500);
}, 5000);  // Change this value
```

### Change Progress Bar Colors

In `css/rank-system.css`:
```css
.rank-progress-fill {
  /* Change gradient colors */
  background: linear-gradient(90deg, #YOUR_COLOR_1, #YOUR_COLOR_2);
}
```

### Modify Rank Requirements

Edit `data/ninja-ranks.json`:
```json
{
  "1": 0,
  "2": 100,    // Change these values
  "3": 250,
  // ...
}
```

---

## 🐛 Troubleshooting

### Progress Bar Not Showing
- ✅ Check if `rank-system.css` is loaded
- ✅ Verify HTML has `rank-progress-fill` element
- ✅ Check console for errors

### EXP Not Saving
- ✅ Check localStorage is enabled
- ✅ Verify not in private/incognito mode
- ✅ Check console for save errors

### Rank-Up Notification Not Appearing
- ✅ Check `ninja-rank.js` is loaded before `top-bar-enhanced.js`
- ✅ Verify callback is set: `NinjaRank.onRankUp`
- ✅ Check CSS for `.rank-up-notification`

### Progress Bar at 0%
- ✅ Wait for NinjaRank module to load (async)
- ✅ Check `NinjaRank.getExpProgress()` in console
- ✅ Verify you have EXP: `NinjaRank.getExp()`

---

## 📋 File Checklist

Created/Modified Files:

- ✅ `data/ninja-ranks.json` - Rank requirements data
- ✅ `js/ninja-rank.js` - Core rank/EXP system
- ✅ `js/top-bar-enhanced.js` - Enhanced top bar (replace top-bar.js)
- ✅ `css/rank-system.css` - Progress bar & animation styles
- ✅ `HTML_UPDATE_SNIPPET.html` - HTML template for updates
- ✅ `NINJA_RANK_SYSTEM.md` - This documentation

Pages to Update:

- ⏳ `index.html` - Add progress bar HTML, update scripts
- ⏳ `summon.html` - Add progress bar HTML, update scripts

---

## 🚀 Quick Start

1. **Add CSS link:**
   ```html
   <link rel="stylesheet" href="css/rank-system.css" />
   ```

2. **Replace top bar HTML** (see `HTML_UPDATE_SNIPPET.html`)

3. **Update scripts:**
   ```html
   <script src="js/ninja-rank.js"></script>
   <script src="js/top-bar-enhanced.js"></script>
   ```

4. **Test in console:**
   ```javascript
   NinjaRank.addExp(1000);
   ```

5. **Done!** 🎉

---

## 💡 Tips

- Use small EXP amounts (10-100) for frequent actions
- Use large amounts (500-1000+) for major milestones
- Show EXP gains in UI for player feedback
- Consider rank-up rewards (currency, items, etc.)
- Display current rank in player profile/status screens

---

**Last Updated:** November 18, 2025
**Version:** 1.0
**Compatible with:** Resources v1, TopBar v2
