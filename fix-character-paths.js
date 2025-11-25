#!/usr/bin/env node
/**
 * Fix Character Asset Paths
 * Matches character IDs in JSON with actual folder names in assets/characters/
 */

const fs = require('fs');
const path = require('path');

const CHARACTERS_JSON = './data/characters.json';
const ASSETS_DIR = './assets/characters';

console.log('🔧 Starting character path fix...\n');

// Read characters.json
const characters = JSON.parse(fs.readFileSync(CHARACTERS_JSON, 'utf8'));
console.log(`📖 Loaded ${characters.length} characters from JSON\n`);

// Get all character folders
const folders = fs.readdirSync(ASSETS_DIR).filter(f => {
  return fs.statSync(path.join(ASSETS_DIR, f)).isDirectory() && f !== 'common';
});
console.log(`📁 Found ${folders.length} character folders in assets\n`);

// Create a map of ID to folder name
const idToFolder = {};
folders.forEach(folder => {
  // Extract ID from folder name (last part after underscore)
  const parts = folder.split('_');
  const id = parts[parts.length - 1];

  // Store all possible matches
  if (!idToFolder[id]) {
    idToFolder[id] = [];
  }
  idToFolder[id].push(folder);
});

let fixedCount = 0;
let errorCount = 0;

// Fix each character
characters.forEach((char, index) => {
  const charId = char.id;

  // Extract numeric ID from character ID (e.g., "naruto_665" -> "665")
  const numericId = charId.split('_').pop();

  // Find matching folder
  const matchingFolders = idToFolder[numericId];

  if (!matchingFolders || matchingFolders.length === 0) {
    console.log(`⚠️  No folder found for ${charId} (ID: ${numericId})`);
    errorCount++;
    return;
  }

  // If multiple matches, try to find best match by character name
  let bestFolder = matchingFolders[0];
  if (matchingFolders.length > 1) {
    const charName = char.name.toLowerCase().replace(/\s+/g, '_');
    const match = matchingFolders.find(f => f.toLowerCase().includes(charName.split(' ')[0]));
    if (match) {
      bestFolder = match;
    }
  }

  // Check current path
  const currentPortrait = char.portrait || '';
  const expectedPath = `assets/characters/${bestFolder}/`;

  if (!currentPortrait.includes(bestFolder)) {
    // Fix portrait path
    const portraitFile = currentPortrait.split('/').pop() || `portrait_${char.starMinCode}.png`;
    char.portrait = `${expectedPath}${portraitFile}`;

    // Fix full path
    const fullFile = (char.full || '').split('/').pop() || `full_${char.starMinCode}.png`;
    char.full = `${expectedPath}${fullFile}`;

    // Fix artByTier paths
    if (char.artByTier) {
      Object.keys(char.artByTier).forEach(tier => {
        if (char.artByTier[tier].portrait) {
          const file = char.artByTier[tier].portrait.split('/').pop();
          char.artByTier[tier].portrait = `${expectedPath}${file}`;
        }
        if (char.artByTier[tier].full) {
          const file = char.artByTier[tier].full.split('/').pop();
          char.artByTier[tier].full = `${expectedPath}${file}`;
        }
      });
    }

    console.log(`✅ Fixed: ${charId} -> ${bestFolder}`);
    fixedCount++;
  }
});

// Write updated JSON
fs.writeFileSync(CHARACTERS_JSON, JSON.stringify(characters, null, 2), 'utf8');

console.log(`\n🎉 Complete!`);
console.log(`✅ Fixed: ${fixedCount} characters`);
console.log(`⚠️  Errors: ${errorCount} characters`);
console.log(`📝 Updated: ${CHARACTERS_JSON}`);
