# Character API Backend

Simple Express server for serving character data via REST API.

## Quick Start

```bash
cd backend
npm install
npm start
```

Server runs on `http://localhost:3000`

## Endpoints

### GET /health
Health check endpoint
```bash
curl http://localhost:3000/health
```

### GET /api/characters
Get all characters (cached for 24 hours)
```bash
curl http://localhost:3000/api/characters
```

### GET /api/characters/:id
Get single character
```bash
curl http://localhost:3000/api/characters/naruto_044
```

### GET /api/characters/search?q=query
Search characters
```bash
curl http://localhost:3000/api/characters/search?q=naruto
```

### GET /api/stats
Get character statistics
```bash
curl http://localhost:3000/api/stats
```

### POST /api/cache/clear
Clear server cache (add authentication in production!)
```bash
curl -X POST http://localhost:3000/api/cache/clear
```

## Deployment

### Option 1: Vercel (Recommended - Free)
```bash
npm install -g vercel
vercel deploy
```

### Option 2: Railway
1. Create account at railway.app
2. Connect GitHub repo
3. Deploy automatically

### Option 3: Fly.io
```bash
flyctl launch
flyctl deploy
```

## Environment Variables

Create `.env` file:
```env
PORT=3000
NODE_ENV=production
DATABASE_URL=your_db_url_here
```

## Upgrading to Real Database

Replace `loadCharacters()` function with database query:

### SQLite Example
```javascript
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./characters.db');

function loadCharacters() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM characters', (err, rows) => {
      if (err) reject(err);
      else resolve(rows.map(r => JSON.parse(r.data)));
    });
  });
}
```

### PostgreSQL Example
```javascript
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function loadCharacters() {
  const result = await pool.query('SELECT data FROM characters');
  return result.rows.map(r => r.data);
}
```

## Performance

- Server-side caching: 5 minutes
- Client-side caching: 24 hours (via Cache-Control headers)
- Typical response time: 50-100ms

## Security (TODO for production)

- [ ] Add rate limiting
- [ ] Add authentication for admin endpoints
- [ ] Validate input parameters
- [ ] Add HTTPS
- [ ] Set up CORS properly
- [ ] Add request logging
