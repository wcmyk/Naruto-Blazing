# Character Database Migration Guide

## Overview
Moving from local `characters.json` to Database + REST API

## Impact Analysis

### Performance Impact

| Aspect | Local JSON | API + Cache | API Only |
|--------|-----------|-------------|----------|
| First Load | ~50ms | ~300ms | ~300ms |
| Subsequent Loads | ~50ms | ~10ms (cache) | ~300ms |
| Offline Support | ✅ Yes | ✅ Yes (cached) | ❌ No |
| File Size Limit | ⚠️ 100MB | ✅ Unlimited | ✅ Unlimited |
| Update Speed | ❌ Requires deploy | ✅ Instant | ✅ Instant |

### Recommended Approach: **Hybrid (API + Cache)**

This gives you:
- ✅ Fast initial load (uses cache)
- ✅ Offline support (24hr cache)
- ✅ Auto-updates (background refresh)
- ✅ No GitHub file size issues
- ✅ Best user experience

## Implementation Steps

### 1. Backend Setup Options

#### Option A: Simple Node.js API (Recommended for start)
```bash
# Quick setup with Express
npm init -y
npm install express sqlite3 cors
```

See `backend/server.js` for implementation.

#### Option B: Serverless (Firebase, Supabase, AWS Lambda)
- Lower cost for small scale
- No server management
- Built-in scaling

#### Option C: Full Database (PostgreSQL, MongoDB)
- Best for production
- Advanced querying
- Better performance at scale

### 2. Database Schema

```sql
CREATE TABLE characters (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(255),
    element VARCHAR(50),
    rarity INTEGER,
    data JSON NOT NULL,  -- Store full character object
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX idx_name ON characters(name);
CREATE INDEX idx_rarity ON characters(rarity);
```

### 3. Migration Script

Run once to populate database:
```bash
node backend/migrate-characters.js
```

### 4. Frontend Integration

Replace in your HTML files:
```html
<!-- OLD: -->
<script src="data/characters.json"></script>

<!-- NEW: -->
<script src="js/character-api-service.js"></script>
<script>
  // Load characters with caching
  async function initGame() {
    const characters = await window.CharacterAPI.loadCharacters();
    console.log('Game loaded with', characters.length, 'characters');
  }
  initGame();
</script>
```

## Gameplay Impact

### Loading Screen Changes

**Before:**
```
Game starts → Load characters.json (instant) → Ready to play
```

**After with Caching:**
```
Game starts → Check cache (instant) → Ready to play
              ↓ (if expired)
           Background API refresh → Cache updated
```

**First time user:**
```
Game starts → Fetch from API (~300ms) → Ready to play → Cache saved
```

### Best Practices

1. **Show Loading State**
   ```javascript
   async function loadGame() {
     showLoadingScreen('Loading characters...');
     try {
       const characters = await CharacterAPI.loadCharacters();
       hideLoadingScreen();
       startGame(characters);
     } catch (error) {
       showError('Failed to load game. Please check your connection.');
     }
   }
   ```

2. **Preload During Splash Screen**
   - Start API call during logo animation
   - User won't notice delay

3. **Progressive Loading**
   ```javascript
   // Load essential characters first
   const essentialChars = await API.getCharacters({ limit: 50 });
   startGame(essentialChars);

   // Load rest in background
   const allChars = await API.getAllCharacters();
   updateGameCharacters(allChars);
   ```

## File Size Comparison

### Current Setup
```
data/characters.json: ~5MB (1,409 characters)
Repository size: Growing with each character
GitHub: Will eventually hit limits
```

### With Database
```
data/characters.json: 0 bytes (removed)
Repository size: Stays small
Database: Unlimited growth
```

## Testing Checklist

- [ ] Characters load on first visit (API call)
- [ ] Characters load instantly on second visit (cache)
- [ ] Game works offline after first visit
- [ ] Cache refreshes after 24 hours
- [ ] Error handling when API is down
- [ ] Loading indicators shown during fetch
- [ ] Performance: load time < 500ms

## Rollback Plan

If issues occur, easy rollback:

1. Keep `data/characters.json` in repo temporarily
2. Add fallback in code:
   ```javascript
   try {
     characters = await CharacterAPI.loadCharacters();
   } catch (error) {
     console.warn('API failed, using local fallback');
     characters = await fetch('data/characters.json').then(r => r.json());
   }
   ```
3. Once stable, remove local JSON

## Cost Considerations

### Free Tier Options
- **Vercel**: Free hosting for API
- **Railway**: Free tier with 500 hrs/month
- **Fly.io**: Free tier available
- **Supabase**: 500MB database free

### Estimated Costs (if exceeding free tier)
- Small API: $5-10/month
- Database: $5-15/month
- **Total: ~$10-25/month** for unlimited characters

## Recommended: Start with Hybrid Approach

1. **Week 1**: Set up simple API with caching (minimize gameplay impact)
2. **Week 2**: Test with real users, monitor performance
3. **Week 3**: Optimize based on feedback
4. **Week 4**: Remove local JSON once stable

## Questions to Consider

1. **How often do you update characters?**
   - Daily → API is better
   - Monthly → Local JSON might be fine

2. **Current file size?**
   - Check: `ls -lh data/characters.json`
   - If > 10MB → Consider migration soon
   - If < 5MB → Not urgent

3. **User base?**
   - Mostly online players → API works great
   - Offline players → Keep strong caching

4. **Development speed?**
   - Need quick character updates → API
   - Can redeploy easily → Local JSON ok

## My Recommendation

**Use the hybrid approach I provided above** because:
- ✅ Solves your GitHub file size problem
- ✅ Minimal impact on gameplay (cache makes it fast)
- ✅ Easy to implement and test
- ✅ Can upgrade to full API later if needed
- ✅ Works offline after first load
- ✅ Best of both worlds

Let me know if you want me to set up the backend API server for you!
