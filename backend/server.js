/**
 * Simple Character API Server
 * Serves characters from database with caching headers
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const adminRoutes = require('./admin-routes');
const upload = require('./upload-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Admin routes (IMPORTANT: Add authentication in production!)
app.use('/admin', adminRoutes);

// In-memory cache (replace with Redis in production)
let charactersCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Load characters from JSON file (replace with database query)
 */
function loadCharacters() {
  const now = Date.now();

  // Return cache if valid
  if (charactersCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('📦 Serving from server cache');
    return charactersCache;
  }

  // Load from file (replace with DB query in production)
  console.log('📖 Loading characters from database...');
  const charactersPath = path.join(__dirname, '../data/characters.json');
  const data = JSON.parse(fs.readFileSync(charactersPath, 'utf8'));

  // Update cache
  charactersCache = data;
  cacheTimestamp = now;

  return data;
}

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    cache: {
      loaded: charactersCache !== null,
      count: charactersCache ? charactersCache.length : 0,
      age: cacheTimestamp ? Date.now() - cacheTimestamp : null,
    },
  });
});

/**
 * GET /api/characters
 * Returns all characters
 */
app.get('/api/characters', (req, res) => {
  try {
    const characters = loadCharacters();

    // Set cache headers for client-side caching
    res.set({
      'Cache-Control': 'public, max-age=86400', // 24 hours
      'ETag': `"characters-${characters.length}-${Date.now()}"`,
    });

    res.json(characters);
  } catch (error) {
    console.error('Error loading characters:', error);
    res.status(500).json({
      error: 'Failed to load characters',
      message: error.message,
    });
  }
});

/**
 * GET /api/characters/:id
 * Returns single character by ID
 */
app.get('/api/characters/:id', (req, res) => {
  try {
    const characters = loadCharacters();
    const character = characters.find(c => c.id === req.params.id);

    if (!character) {
      return res.status(404).json({
        error: 'Character not found',
        id: req.params.id,
      });
    }

    res.set({
      'Cache-Control': 'public, max-age=86400',
    });

    res.json(character);
  } catch (error) {
    console.error('Error loading character:', error);
    res.status(500).json({
      error: 'Failed to load character',
      message: error.message,
    });
  }
});

/**
 * GET /api/characters/search?q=naruto
 * Search characters by name or ID
 */
app.get('/api/characters/search', (req, res) => {
  try {
    const query = req.query.q?.toLowerCase();

    if (!query) {
      return res.status(400).json({
        error: 'Missing search query',
        usage: '/api/characters/search?q=naruto',
      });
    }

    const characters = loadCharacters();
    const results = characters.filter(char =>
      char.name.toLowerCase().includes(query) ||
      char.id.toLowerCase().includes(query)
    );

    res.set({
      'Cache-Control': 'public, max-age=3600', // 1 hour for search results
    });

    res.json({
      query,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error('Error searching characters:', error);
    res.status(500).json({
      error: 'Failed to search characters',
      message: error.message,
    });
  }
});

/**
 * GET /api/stats
 * Returns character statistics
 */
app.get('/api/stats', (req, res) => {
  try {
    const characters = loadCharacters();

    const stats = {
      total: characters.length,
      byRarity: {},
      byElement: {},
    };

    characters.forEach(char => {
      // Count by rarity
      stats.byRarity[char.rarity] = (stats.byRarity[char.rarity] || 0) + 1;

      // Count by element
      if (char.element) {
        stats.byElement[char.element] = (stats.byElement[char.element] || 0) + 1;
      }
    });

    res.json(stats);
  } catch (error) {
    console.error('Error calculating stats:', error);
    res.status(500).json({
      error: 'Failed to calculate stats',
      message: error.message,
    });
  }
});

/**
 * POST /api/cache/clear (admin only - add auth in production)
 * Clears server cache
 */
app.post('/api/cache/clear', (req, res) => {
  charactersCache = null;
  cacheTimestamp = null;

  console.log('🗑️ Server cache cleared');

  res.json({
    message: 'Cache cleared successfully',
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/upload/:id
 * Upload character images
 */
app.post('/api/upload/:id', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Clear cache after upload
    charactersCache = null;
    cacheTimestamp = null;

    res.json({
      message: 'Image uploaded successfully',
      file: {
        characterId: req.params.id,
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Failed to upload image',
      message: error.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   Character API Server Running!        ║
╠════════════════════════════════════════╣
║  Port: ${PORT.toString().padEnd(32)}  ║
║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(24)}  ║
╠════════════════════════════════════════╣
║  Public Endpoints:                     ║
║  GET  /health                          ║
║  GET  /api/characters                  ║
║  GET  /api/characters/:id              ║
║  GET  /api/characters/search?q=        ║
║  GET  /api/stats                       ║
╠════════════════════════════════════════╣
║  Admin Endpoints:                      ║
║  POST   /admin/characters              ║
║  PUT    /admin/characters/:id          ║
║  PATCH  /admin/characters/:id          ║
║  DELETE /admin/characters/:id          ║
║  POST   /admin/characters/bulk         ║
║  POST   /api/upload/:id                ║
║  GET    /admin/backups                 ║
║  POST   /admin/backups/restore         ║
║  GET    /admin/validate                ║
╚════════════════════════════════════════╝
  `);

  // Preload cache on startup
  console.log('🔄 Preloading character cache...');
  const characters = loadCharacters();
  console.log(`✅ Loaded ${characters.length} characters\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});
