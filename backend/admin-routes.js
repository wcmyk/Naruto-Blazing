/**
 * Admin API Routes
 * For developers to manage character database
 *
 * IMPORTANT: Add authentication in production!
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Path to characters JSON (replace with DB in production)
const CHARACTERS_FILE = path.join(__dirname, '../data/characters.json');
const ASSETS_DIR = path.join(__dirname, '../assets/characters');

/**
 * Helper: Load characters from file
 */
function loadCharacters() {
  const data = fs.readFileSync(CHARACTERS_FILE, 'utf8');
  return JSON.parse(data);
}

/**
 * Helper: Save characters to file
 */
function saveCharacters(characters) {
  const data = JSON.stringify(characters, null, 2);
  fs.writeFileSync(CHARACTERS_FILE, data, 'utf8');
  console.log(`💾 Saved ${characters.length} characters`);
}

/**
 * Helper: Create backup before changes
 */
function createBackup() {
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const backupPath = path.join(__dirname, `../data/backups/characters-${timestamp}.json`);

  // Create backups directory if it doesn't exist
  const backupDir = path.dirname(backupPath);
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  fs.copyFileSync(CHARACTERS_FILE, backupPath);
  console.log(`📦 Backup created: ${backupPath}`);
  return backupPath;
}

/**
 * POST /admin/characters
 * Add a new character
 */
router.post('/characters', (req, res) => {
  try {
    const newCharacter = req.body;

    // Validate required fields
    if (!newCharacter.id || !newCharacter.name) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['id', 'name'],
      });
    }

    // Create backup before changes
    const backupPath = createBackup();

    // Load existing characters
    const characters = loadCharacters();

    // Check if character ID already exists
    if (characters.find(c => c.id === newCharacter.id)) {
      return res.status(409).json({
        error: 'Character ID already exists',
        id: newCharacter.id,
        hint: 'Use PUT /admin/characters/:id to update instead',
      });
    }

    // Add new character
    characters.push(newCharacter);
    saveCharacters(characters);

    res.status(201).json({
      message: 'Character added successfully',
      character: newCharacter,
      backup: backupPath,
      total: characters.length,
    });

  } catch (error) {
    console.error('Error adding character:', error);
    res.status(500).json({
      error: 'Failed to add character',
      message: error.message,
    });
  }
});

/**
 * PUT /admin/characters/:id
 * Update an existing character
 */
router.put('/characters/:id', (req, res) => {
  try {
    const characterId = req.params.id;
    const updates = req.body;

    // Create backup before changes
    const backupPath = createBackup();

    // Load existing characters
    const characters = loadCharacters();

    // Find character index
    const index = characters.findIndex(c => c.id === characterId);

    if (index === -1) {
      return res.status(404).json({
        error: 'Character not found',
        id: characterId,
        hint: 'Use POST /admin/characters to add a new character',
      });
    }

    // Update character (merge with existing data)
    const oldCharacter = characters[index];
    characters[index] = {
      ...oldCharacter,
      ...updates,
      id: characterId, // Prevent ID changes
    };

    saveCharacters(characters);

    res.json({
      message: 'Character updated successfully',
      old: oldCharacter,
      new: characters[index],
      backup: backupPath,
    });

  } catch (error) {
    console.error('Error updating character:', error);
    res.status(500).json({
      error: 'Failed to update character',
      message: error.message,
    });
  }
});

/**
 * PATCH /admin/characters/:id
 * Partially update a character (merge fields)
 */
router.patch('/characters/:id', (req, res) => {
  try {
    const characterId = req.params.id;
    const updates = req.body;

    // Create backup before changes
    const backupPath = createBackup();

    // Load existing characters
    const characters = loadCharacters();

    // Find character
    const character = characters.find(c => c.id === characterId);

    if (!character) {
      return res.status(404).json({
        error: 'Character not found',
        id: characterId,
      });
    }

    // Deep merge updates
    Object.keys(updates).forEach(key => {
      if (typeof updates[key] === 'object' && !Array.isArray(updates[key])) {
        // Merge nested objects
        character[key] = { ...character[key], ...updates[key] };
      } else {
        // Replace primitive values and arrays
        character[key] = updates[key];
      }
    });

    saveCharacters(characters);

    res.json({
      message: 'Character patched successfully',
      character,
      updatedFields: Object.keys(updates),
      backup: backupPath,
    });

  } catch (error) {
    console.error('Error patching character:', error);
    res.status(500).json({
      error: 'Failed to patch character',
      message: error.message,
    });
  }
});

/**
 * DELETE /admin/characters/:id
 * Delete a character
 */
router.delete('/characters/:id', (req, res) => {
  try {
    const characterId = req.params.id;

    // Create backup before changes
    const backupPath = createBackup();

    // Load existing characters
    let characters = loadCharacters();

    // Find character
    const character = characters.find(c => c.id === characterId);

    if (!character) {
      return res.status(404).json({
        error: 'Character not found',
        id: characterId,
      });
    }

    // Remove character
    characters = characters.filter(c => c.id !== characterId);
    saveCharacters(characters);

    res.json({
      message: 'Character deleted successfully',
      deleted: character,
      backup: backupPath,
      remaining: characters.length,
    });

  } catch (error) {
    console.error('Error deleting character:', error);
    res.status(500).json({
      error: 'Failed to delete character',
      message: error.message,
    });
  }
});

/**
 * POST /admin/characters/bulk
 * Add or update multiple characters at once
 */
router.post('/characters/bulk', (req, res) => {
  try {
    const updates = req.body; // Array of characters

    if (!Array.isArray(updates)) {
      return res.status(400).json({
        error: 'Request body must be an array of characters',
      });
    }

    // Create backup before changes
    const backupPath = createBackup();

    // Load existing characters
    const characters = loadCharacters();
    const characterMap = new Map(characters.map(c => [c.id, c]));

    let added = 0;
    let updated = 0;

    updates.forEach(update => {
      if (characterMap.has(update.id)) {
        // Update existing
        const index = characters.findIndex(c => c.id === update.id);
        characters[index] = { ...characters[index], ...update };
        updated++;
      } else {
        // Add new
        characters.push(update);
        added++;
      }
    });

    saveCharacters(characters);

    res.json({
      message: 'Bulk update completed',
      added,
      updated,
      total: characters.length,
      backup: backupPath,
    });

  } catch (error) {
    console.error('Error in bulk update:', error);
    res.status(500).json({
      error: 'Failed to perform bulk update',
      message: error.message,
    });
  }
});

/**
 * GET /admin/backups
 * List all backups
 */
router.get('/backups', (req, res) => {
  try {
    const backupDir = path.join(__dirname, '../data/backups');

    if (!fs.existsSync(backupDir)) {
      return res.json({ backups: [] });
    }

    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('characters-') && f.endsWith('.json'))
      .map(f => {
        const stats = fs.statSync(path.join(backupDir, f));
        return {
          filename: f,
          path: path.join(backupDir, f),
          size: stats.size,
          created: stats.birthtime,
        };
      })
      .sort((a, b) => b.created - a.created); // Newest first

    res.json({
      backups: files,
      count: files.length,
    });

  } catch (error) {
    console.error('Error listing backups:', error);
    res.status(500).json({
      error: 'Failed to list backups',
      message: error.message,
    });
  }
});

/**
 * POST /admin/backups/restore
 * Restore from a backup
 */
router.post('/backups/restore', (req, res) => {
  try {
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({
        error: 'Missing filename parameter',
      });
    }

    const backupPath = path.join(__dirname, '../data/backups', filename);

    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({
        error: 'Backup file not found',
        filename,
      });
    }

    // Create backup of current state before restoring
    const currentBackup = createBackup();

    // Restore from backup
    fs.copyFileSync(backupPath, CHARACTERS_FILE);

    const characters = loadCharacters();

    res.json({
      message: 'Backup restored successfully',
      restored_from: filename,
      current_backup: currentBackup,
      character_count: characters.length,
    });

  } catch (error) {
    console.error('Error restoring backup:', error);
    res.status(500).json({
      error: 'Failed to restore backup',
      message: error.message,
    });
  }
});

/**
 * POST /admin/assets/create-folder
 * Create asset folder for a character
 */
router.post('/assets/create-folder', (req, res) => {
  try {
    const { characterId } = req.body;

    if (!characterId) {
      return res.status(400).json({
        error: 'Missing characterId parameter',
      });
    }

    const folderPath = path.join(ASSETS_DIR, characterId);

    if (fs.existsSync(folderPath)) {
      return res.status(409).json({
        error: 'Folder already exists',
        path: folderPath,
      });
    }

    fs.mkdirSync(folderPath, { recursive: true });

    res.json({
      message: 'Asset folder created successfully',
      path: folderPath,
      characterId,
    });

  } catch (error) {
    console.error('Error creating asset folder:', error);
    res.status(500).json({
      error: 'Failed to create asset folder',
      message: error.message,
    });
  }
});

/**
 * GET /admin/validate
 * Validate character data integrity
 */
router.get('/validate', (req, res) => {
  try {
    const characters = loadCharacters();
    const issues = [];

    characters.forEach((char, index) => {
      // Check required fields
      if (!char.id) issues.push({ index, issue: 'Missing ID' });
      if (!char.name) issues.push({ index, issue: 'Missing name', id: char.id });

      // Check for duplicate IDs
      const duplicates = characters.filter(c => c.id === char.id);
      if (duplicates.length > 1) {
        issues.push({ index, issue: 'Duplicate ID', id: char.id });
      }

      // Check asset folder exists
      const assetPath = path.join(ASSETS_DIR, char.id);
      if (!fs.existsSync(assetPath)) {
        issues.push({
          index,
          issue: 'Asset folder missing',
          id: char.id,
          expected: assetPath,
        });
      }
    });

    res.json({
      valid: issues.length === 0,
      total_characters: characters.length,
      issues_found: issues.length,
      issues,
    });

  } catch (error) {
    console.error('Error validating data:', error);
    res.status(500).json({
      error: 'Failed to validate data',
      message: error.message,
    });
  }
});

module.exports = router;
