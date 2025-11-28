#!/usr/bin/env node
/**
 * Admin CLI Tool
 * Command-line interface for managing characters
 *
 * Usage:
 *   node admin-cli.js add <id> <name>
 *   node admin-cli.js update <id> <field> <value>
 *   node admin-cli.js delete <id>
 *   node admin-cli.js list
 *   node admin-cli.js search <query>
 *   node admin-cli.js backup
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const CHARACTERS_FILE = path.join(__dirname, '../data/characters.json');
const BACKUP_DIR = path.join(__dirname, '../data/backups');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
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
  log(`✅ Saved ${characters.length} characters`, 'green');
}

function createBackup() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const backupPath = path.join(BACKUP_DIR, `characters-${timestamp}.json`);

  fs.copyFileSync(CHARACTERS_FILE, backupPath);
  log(`📦 Backup created: ${path.basename(backupPath)}`, 'cyan');
  return backupPath;
}

async function confirm(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${question} (y/n): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

// Commands

async function addCharacter(id, name) {
  const characters = loadCharacters();

  if (characters.find(c => c.id === id)) {
    log(`❌ Character with ID "${id}" already exists`, 'red');
    return;
  }

  const newCharacter = {
    id,
    name,
    version: 'New Character',
    element: null,
    rarity: 3,
    starMinCode: '3S',
    starMaxCode: '5S',
    portrait: `assets/characters/${id}/portrait_3S.png`,
    full: `assets/characters/${id}/full_3S.png`,
    artByTier: {},
    statsBase: { hp: 0, atk: 0, def: 0, speed: 0, chakra: 0 },
    statsMax: { hp: 0, atk: 0, def: 0, speed: 0, chakra: 0 },
    growthCurve: {},
    powerRank: 0,
    powerWeights: {},
    luck: { base: 1, max: 50 },
    passiveIcons: {},
  };

  createBackup();
  characters.push(newCharacter);
  saveCharacters(characters);

  log(`\n✅ Character added successfully!`, 'green');
  log(`ID: ${id}`, 'cyan');
  log(`Name: ${name}`, 'cyan');
  log(`\nNext steps:`, 'yellow');
  log(`1. Create asset folder: mkdir -p assets/characters/${id}`);
  log(`2. Add portrait image: assets/characters/${id}/portrait_3S.png`);
  log(`3. Add full image: assets/characters/${id}/full_3S.png`);
  log(`4. Update character stats using: node admin-cli.js update ${id} <field> <value>`);
}

async function updateCharacter(id, field, value) {
  const characters = loadCharacters();
  const character = characters.find(c => c.id === id);

  if (!character) {
    log(`❌ Character "${id}" not found`, 'red');
    return;
  }

  createBackup();

  // Parse value if it's JSON
  let parsedValue = value;
  try {
    if (value.startsWith('{') || value.startsWith('[')) {
      parsedValue = JSON.parse(value);
    } else if (!isNaN(value)) {
      parsedValue = Number(value);
    }
  } catch (e) {
    // Keep as string
  }

  // Handle nested fields (e.g., "statsBase.hp")
  const parts = field.split('.');
  if (parts.length > 1) {
    let obj = character;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!obj[parts[i]]) obj[parts[i]] = {};
      obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = parsedValue;
  } else {
    character[field] = parsedValue;
  }

  saveCharacters(characters);

  log(`\n✅ Character updated successfully!`, 'green');
  log(`ID: ${id}`, 'cyan');
  log(`Field: ${field}`, 'cyan');
  log(`Value: ${JSON.stringify(parsedValue)}`, 'cyan');
}

async function deleteCharacter(id) {
  const characters = loadCharacters();
  const character = characters.find(c => c.id === id);

  if (!character) {
    log(`❌ Character "${id}" not found`, 'red');
    return;
  }

  log(`\n⚠️  You are about to delete:`, 'yellow');
  log(`ID: ${id}`, 'cyan');
  log(`Name: ${character.name}`, 'cyan');

  const confirmed = await confirm('\nAre you sure?');

  if (!confirmed) {
    log('❌ Deletion cancelled', 'yellow');
    return;
  }

  createBackup();

  const filtered = characters.filter(c => c.id !== id);
  saveCharacters(filtered);

  log(`\n✅ Character deleted successfully!`, 'green');
  log(`Remaining: ${filtered.length} characters`, 'cyan');
}

function listCharacters(limit = 20) {
  const characters = loadCharacters();

  log(`\n📋 Characters (${characters.length} total)`, 'bright');
  log('─'.repeat(80), 'cyan');

  characters.slice(0, limit).forEach((char, index) => {
    log(`${(index + 1).toString().padStart(3)}. ${char.id.padEnd(20)} ${char.name}`, 'cyan');
  });

  if (characters.length > limit) {
    log(`\n... and ${characters.length - limit} more`, 'yellow');
    log(`Use: node admin-cli.js list all  (to see all)`, 'yellow');
  }
}

function searchCharacters(query) {
  const characters = loadCharacters();
  const lowerQuery = query.toLowerCase();

  const results = characters.filter(char =>
    char.name.toLowerCase().includes(lowerQuery) ||
    char.id.toLowerCase().includes(lowerQuery)
  );

  log(`\n🔍 Search results for "${query}" (${results.length} found)`, 'bright');
  log('─'.repeat(80), 'cyan');

  results.forEach((char, index) => {
    log(`${(index + 1).toString().padStart(3)}. ${char.id.padEnd(20)} ${char.name}`, 'cyan');
  });
}

function showBackups() {
  if (!fs.existsSync(BACKUP_DIR)) {
    log('📦 No backups found', 'yellow');
    return;
  }

  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('characters-') && f.endsWith('.json'))
    .map(f => {
      const stats = fs.statSync(path.join(BACKUP_DIR, f));
      return { filename: f, created: stats.birthtime, size: stats.size };
    })
    .sort((a, b) => b.created - a.created);

  log(`\n📦 Backups (${files.length} total)`, 'bright');
  log('─'.repeat(80), 'cyan');

  files.forEach((file, index) => {
    const size = (file.size / 1024).toFixed(2);
    const date = file.created.toLocaleString();
    log(`${(index + 1).toString().padStart(3)}. ${file.filename.padEnd(40)} ${size} KB  ${date}`, 'cyan');
  });
}

function showHelp() {
  log('\n📚 Admin CLI Help', 'bright');
  log('─'.repeat(80), 'cyan');
  log('\nCommands:', 'yellow');
  log('  add <id> <name>              Add new character');
  log('  update <id> <field> <value>  Update character field');
  log('  delete <id>                  Delete character');
  log('  list [all]                   List characters');
  log('  search <query>               Search characters');
  log('  backups                      List backups');
  log('  help                         Show this help\n');

  log('Examples:', 'yellow');
  log('  node admin-cli.js add rasa_1191 "Rasa"');
  log('  node admin-cli.js update rasa_1191 rarity 5');
  log('  node admin-cli.js update rasa_1191 statsBase.hp 5000');
  log('  node admin-cli.js update rasa_1191 element "wind"');
  log('  node admin-cli.js delete rasa_1191');
  log('  node admin-cli.js search naruto');
  log('  node admin-cli.js list all\n');
}

// Main
const [,, command, ...args] = process.argv;

(async () => {
  switch (command) {
    case 'add':
      if (args.length < 2) {
        log('❌ Usage: add <id> <name>', 'red');
        process.exit(1);
      }
      await addCharacter(args[0], args.slice(1).join(' '));
      break;

    case 'update':
      if (args.length < 3) {
        log('❌ Usage: update <id> <field> <value>', 'red');
        process.exit(1);
      }
      await updateCharacter(args[0], args[1], args.slice(2).join(' '));
      break;

    case 'delete':
      if (args.length < 1) {
        log('❌ Usage: delete <id>', 'red');
        process.exit(1);
      }
      await deleteCharacter(args[0]);
      break;

    case 'list':
      listCharacters(args[0] === 'all' ? Infinity : 20);
      break;

    case 'search':
      if (args.length < 1) {
        log('❌ Usage: search <query>', 'red');
        process.exit(1);
      }
      searchCharacters(args.join(' '));
      break;

    case 'backups':
      showBackups();
      break;

    case 'help':
    default:
      showHelp();
      break;
  }
})();
