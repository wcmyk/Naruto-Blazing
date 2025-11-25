#!/usr/bin/env node
/**
 * Add Evolution Link CLI Tool
 * Links two characters for evolution (character transformation)
 *
 * Usage:
 *   node add-evolution.js <fromId> <toId>
 *   node add-evolution.js naruto_665 naruto_666
 */

const fs = require('fs');
const path = require('path');

const CHARACTERS_FILE = path.join(__dirname, '../data/characters.json');
const BACKUP_DIR = path.join(__dirname, '../data/backups');

// Colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function loadCharacters() {
  const data = fs.readFileSync(CHARACTERS_FILE, 'utf8');
  return JSON.parse(data);
}

function saveCharacters(characters) {
  const data = JSON.stringify(characters, null, 2);
  fs.writeFileSync(CHARACTERS_FILE, data, 'utf8');
}

function createBackup() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const backupPath = path.join(BACKUP_DIR, `characters-${timestamp}.json`);

  fs.copyFileSync(CHARACTERS_FILE, backupPath);
  log(`📦 Backup created: ${path.basename(backupPath)}`, 'cyan');
}

function addEvolutionLink(fromId, toId, bidirectional = false) {
  const characters = loadCharacters();

  // Find both characters
  const fromChar = characters.find(c => c.id === fromId);
  const toChar = characters.find(c => c.id === toId);

  if (!fromChar) {
    log(`❌ Character "${fromId}" not found`, 'red');
    process.exit(1);
  }

  if (!toChar) {
    log(`❌ Character "${toId}" not found`, 'red');
    process.exit(1);
  }

  // Create backup
  createBackup();

  // Add evolvesTo field
  if (!fromChar.evolvesTo) {
    fromChar.evolvesTo = [];
  } else if (!Array.isArray(fromChar.evolvesTo)) {
    // Convert to array if it's a single value
    fromChar.evolvesTo = [fromChar.evolvesTo];
  }

  // Add toId if not already present
  if (!fromChar.evolvesTo.includes(toId)) {
    fromChar.evolvesTo.push(toId);
  }

  // If bidirectional, also add reverse link
  if (bidirectional) {
    if (!toChar.evolvesTo) {
      toChar.evolvesTo = [];
    } else if (!Array.isArray(toChar.evolvesTo)) {
      toChar.evolvesTo = [toChar.evolvesTo];
    }

    if (!toChar.evolvesTo.includes(fromId)) {
      toChar.evolvesTo.push(fromId);
    }
  }

  // Save
  saveCharacters(characters);

  log('\n✅ Evolution link added successfully!', 'green');
  log('\nFrom:', 'cyan');
  log(`  ID: ${fromChar.id}`);
  log(`  Name: ${fromChar.name} (${fromChar.version || 'No version'})`);
  log(`  Evolves To: ${fromChar.evolvesTo.join(', ')}`);

  if (bidirectional) {
    log('\nTo:', 'cyan');
    log(`  ID: ${toChar.id}`);
    log(`  Name: ${toChar.name} (${toChar.version || 'No version'})`);
    log(`  Evolves To: ${toChar.evolvesTo.join(', ')}`);
  }

  log('\nNext steps:', 'yellow');
  log('  1. Test evolution in game');
  log('  2. Character must be MAX level and MAX tier to evolve');
  log('  3. Commit changes: git add data/characters.json && git commit');
}

// Main
const [,, fromId, toId, ...flags] = process.argv;

if (!fromId || !toId) {
  log('Usage: node add-evolution.js <fromId> <toId> [--bidirectional]', 'yellow');
  log('\nExamples:', 'cyan');
  log('  node add-evolution.js naruto_665 naruto_666');
  log('  node add-evolution.js naruto_665 naruto_666 --bidirectional');
  log('\nOptions:', 'cyan');
  log('  --bidirectional  Add evolution link in both directions');
  process.exit(1);
}

const bidirectional = flags.includes('--bidirectional') || flags.includes('-b');

addEvolutionLink(fromId, toId, bidirectional);
