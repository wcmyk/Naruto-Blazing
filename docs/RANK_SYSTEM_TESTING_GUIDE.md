# Ninja Rank System - Testing Guide

## Quick Testing Commands

Open browser console (F12) on any page with the rank system loaded.

---

## Basic Testing

### Add EXP
```javascript
// Add small amount
NinjaRank.addExp(50);

// Add enough to rank up (Rank 1→2 needs 120)
NinjaRank.addExp(150);

// Add massive amount (see multiple rank-ups)
NinjaRank.addExp(10000);
```

### Check Current Stats
```javascript
console.log('Rank:', NinjaRank.getRank());
console.log('EXP:', NinjaRank.getExp());
console.log('To Next Rank:', NinjaRank.getExpToNextRank());
console.log('Progress:', (NinjaRank.getExpProgress() * 100).toFixed(1) + '%');
```

### Jump to Specific Rank
```javascript
// Jump to Rank 50
NinjaRank.setRank(50);

// Set specific EXP amount
NinjaRank.setExp(25000);
```

### Reset
```javascript
// Back to Rank 1, 0 EXP
NinjaRank.reset();
```

---

## Using ExpRewards Module

### Mission Rewards
```javascript
// Easy mission
ExpRewards.onMissionComplete('easy');     // +25 EXP

// Normal mission
ExpRewards.onMissionComplete('normal');   // +50 EXP

// Hard mission
ExpRewards.onMissionComplete('hard');     // +100 EXP

// Extreme mission
ExpRewards.onMissionComplete('extreme');  // +200 EXP
```

### Battle Rewards
```javascript
// Normal victory
ExpRewards.onBattleWin();  // +30 EXP

// Perfect victory (no units lost)
ExpRewards.onBattleWin({ unitsLost: 0, damageTaken: 100 });  // +50 EXP

// Flawless victory (no units lost, no damage)
ExpRewards.onBattleWin({ unitsLost: 0, damageTaken: 0 });  // +75 EXP
```

### Character Actions
```javascript
// Summon new character
ExpRewards.onCharacterSummon(true);   // +25 EXP

// Summon duplicate
ExpRewards.onCharacterSummon(false);  // +5 EXP

// Awaken character
ExpRewards.onCharacterAwaken();       // +50 EXP

// Limit break
ExpRewards.onCharacterLimitBreak();   // +100 EXP
```

### Daily Actions
```javascript
// Daily login (day 1)
ExpRewards.onDailyLogin(1);  // +10 EXP

// Daily login (day 7, 7x multiplier)
ExpRewards.onDailyLogin(7);  // +70 EXP
```

### Collection Milestones
```javascript
// Check for milestones (10, 25, 50, 100 characters)
ExpRewards.onCollectionMilestone(10);   // +100 EXP
ExpRewards.onCollectionMilestone(25);   // +250 EXP
ExpRewards.onCollectionMilestone(50);   // +500 EXP
ExpRewards.onCollectionMilestone(100);  // +1000 EXP
```

### Achievements
```javascript
ExpRewards.onAchievementUnlock('bronze');    // +50 EXP
ExpRewards.onAchievementUnlock('silver');    // +100 EXP
ExpRewards.onAchievementUnlock('gold');      // +250 EXP
ExpRewards.onAchievementUnlock('platinum');  // +500 EXP
```

### Custom Rewards
```javascript
// Give custom amount with reason
ExpRewards.giveCustomReward(150, 'Special Event Bonus');

// Or directly use a defined reward type
ExpRewards.giveReward('EVENT_COMPLETION');  // +200 EXP
```

---

## Test Scenarios

### Scenario 1: New Player Journey
```javascript
// Reset to start
NinjaRank.reset();

// Daily login
ExpRewards.onDailyLogin(1);  // +10 EXP

// Complete tutorial mission
ExpRewards.onMissionComplete('easy');  // +25 EXP

// First summon
ExpRewards.onCharacterSummon(true);  // +25 EXP

// Current: 60 EXP, Rank 1 (need 120 for Rank 2)
```

### Scenario 2: Mission Grinding
```javascript
// Complete 5 normal missions
for (let i = 0; i < 5; i++) {
  ExpRewards.onMissionComplete('normal');
}
// +250 EXP total
```

### Scenario 3: Battle Champion
```javascript
// Win 10 battles (mix of perfect and normal)
ExpRewards.onBattleWin({ unitsLost: 0, damageTaken: 0 });  // Flawless
ExpRewards.onBattleWin({ unitsLost: 0, damageTaken: 50 });  // Perfect
ExpRewards.onBattleWin({ unitsLost: 1, damageTaken: 200 }); // Normal

// Repeat pattern...
```

### Scenario 4: Collector
```javascript
// Summon 10 new characters
for (let i = 0; i < 10; i++) {
  ExpRewards.onCharacterSummon(true);
}

// Hit 10 character milestone
ExpRewards.onCollectionMilestone(10);

// Total: (10 × 25) + 100 = 350 EXP
```

### Scenario 5: Power Leveling
```javascript
// Simulate a week of hardcore grinding
for (let day = 1; day <= 7; day++) {
  // Daily login
  ExpRewards.onDailyLogin(day);

  // 3 hard missions per day
  for (let i = 0; i < 3; i++) {
    ExpRewards.onMissionComplete('hard');
  }

  // 5 battles per day
  for (let i = 0; i < 5; i++) {
    ExpRewards.onBattleWin();
  }
}

// Total per day: (10+) + (300) + (150) = 460+ EXP
// Week total: ~3,220+ EXP (should reach ~Rank 13-14)
```

---

## Visual Testing

### Watch Rank-Up Animation
```javascript
// Set to just before rank up
NinjaRank.setRank(1);
NinjaRank.setExp(110);

// Add enough to rank up
NinjaRank.addExp(20);  // Watch the notification!
```

### Watch Multiple Rank-Ups
```javascript
NinjaRank.setRank(1);
NinjaRank.addExp(5000);  // See several rank-up notifications
```

### Watch Progress Bar Fill
```javascript
// Start at 0%
NinjaRank.setRank(1);
NinjaRank.setExp(0);

// Slowly fill
setInterval(() => {
  NinjaRank.addExp(10);
}, 1000);  // +10 EXP per second
```

### Watch Near-Rankup Glow
```javascript
// Set to 85% progress
NinjaRank.setRank(1);
NinjaRank.setExp(102);  // 102/120 = 85%
// Progress bar should glow
```

### Test Max Rank
```javascript
// Jump to Rank 100
NinjaRank.setRank(100);
// Should show MAX badge and gold styling
```

---

## Integration Testing

### Test with Currency System
```javascript
// Add both currency and EXP
Resources.add('ninja_pearls', 100);
NinjaRank.addExp(100);

// Both should update in top bar
```

### Test Persistence
```javascript
// Add EXP
NinjaRank.addExp(500);

// Check localStorage
console.log(localStorage.getItem('blazing_player_rank'));
console.log(localStorage.getItem('blazing_player_exp'));

// Refresh page - should persist
location.reload();
```

### Test Callbacks
```javascript
// Set custom callbacks
NinjaRank.onRankUp = (newRank) => {
  console.log(`🎉 Custom rank-up handler! New rank: ${newRank}`);
  // Add custom rewards here
};

NinjaRank.onExpGain = (amount, newExp) => {
  console.log(`💎 Custom EXP handler! +${amount} EXP (Total: ${newExp})`);
};

// Trigger
NinjaRank.addExp(200);
```

---

## Performance Testing

### Stress Test - Rapid EXP Gains
```javascript
// Add EXP 100 times rapidly
for (let i = 0; i < 100; i++) {
  NinjaRank.addExp(10);
}
// Should handle without lag
```

### Memory Test - Many Rank-Ups
```javascript
// Start at Rank 1, jump to Rank 100
NinjaRank.setRank(1);
NinjaRank.addExp(120000);  // More than needed for Rank 100

// Should cap at Rank 100, no overflow
```

---

## Debugging

### Check if Modules Loaded
```javascript
console.log('NinjaRank:', typeof NinjaRank);      // Should be 'object'
console.log('ExpRewards:', typeof ExpRewards);    // Should be 'object'
console.log('TopBar:', typeof TopBar);            // Should be 'object'
```

### Inspect Rank Data
```javascript
// See all rank requirements
console.table(NinjaRank.rankRequirements);
```

### Check Progress Calculation
```javascript
const rank = NinjaRank.getRank();
const exp = NinjaRank.getExp();
const currentReq = NinjaRank.getExpForCurrentRank();
const nextReq = NinjaRank.getExpForNextRank();
const progress = NinjaRank.getExpProgress();

console.log({
  rank,
  exp,
  currentReq,
  nextReq,
  progress: (progress * 100).toFixed(2) + '%',
  expInRank: exp - currentReq,
  expNeeded: nextReq - currentReq
});
```

---

## Common Issues

### Issue: Progress bar not updating
**Solution:**
```javascript
// Manually trigger update
TopBar.update();
```

### Issue: Rank-up notification not showing
**Solution:**
```javascript
// Check callbacks are set
console.log(NinjaRank.onRankUp);  // Should be a function

// If null, re-initialize TopBar
TopBar.init();
```

### Issue: EXP not persisting
**Solution:**
```javascript
// Check localStorage
console.log(localStorage.getItem('blazing_player_exp'));

// Manual save
NinjaRank.savePlayerData();
```

---

## Expected Behavior

### Rank 1 → 2
- **EXP Needed:** 120
- **Progress Bar:** Fills from 0% to 100%
- **On Rank-Up:** Notification shows "RANK UP! Ninja Rank 2"

### Multiple Rank-Ups
- **Example:** Add 5000 EXP from Rank 1
- **Expected:**
  - Rank up to ~Rank 19
  - Show notification for each rank
  - Progress bar resets after each rank-up

### Max Rank
- **At Rank 100:**
  - Progress bar fills completely
  - Shows "MAX" instead of EXP needed
  - Golden styling applied
  - Further EXP gains do nothing

---

## Reset Everything
```javascript
// Nuclear option - clear all data
localStorage.clear();
location.reload();
```

---

**Happy Testing!** 🎮
