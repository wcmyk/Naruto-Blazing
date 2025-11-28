#!/usr/bin/env node
/**
 * Fix Character Asset Paths V2
 * Improved matching with character names and better ID parsing
 */

const fs = require('fs');
const path = require('path');

const CHARACTERS_JSON = './data/characters.json';
const ASSETS_DIR = './assets/characters';

console.log('🔧 Starting character path fix V2...\n');

// Read characters.json
const characters = JSON.parse(fs.readFileSync(CHARACTERS_JSON, 'utf8'));
console.log(`📖 Loaded ${characters.length} characters from JSON\n`);

// Get all character folders
const folders = fs.readdirSync(ASSETS_DIR).filter(f => {
  return fs.statSync(path.join(ASSETS_DIR, f)).isDirectory() && f !== 'common';
});
console.log(`📁 Found ${folders.length} character folders in assets\n`);

let fixedCount = 0;
let errorCount = 0;

// Fix each character
characters.forEach((char) => {
  const charId = char.id;
  const charName = char.name.toLowerCase().replace(/[^a-z]/g, '_');

  // Try to find folder by exact ID match first
  let matchingFolder = folders.find(f => f === charId);

  // If not found, try with character name + ID
  if (!matchingFolder) {
    // Extract numeric ID and pad with zeros if needed
    const numericId = charId.match(/_([a-z0-9]+)$/)?.[1] || '';

    // Try different patterns
    const patterns = [
      `${charName}_${numericId}`,
      `${charName.split('_')[0]}_${charName.split('_')[1]}_${numericId}`, // first_last_id
      `${charName.replace(/__+/g, '_')}_${numericId.padStart(3, '0')}`, // with leading zeros
      `${charName.split('_').slice(0,2).join('_')}_${numericId.padStart(3, '0')}` // first_last_000id
    ];

    for (const pattern of patterns) {
      matchingFolder = folders.find(f => f === pattern);
      if (matchingFolder) break;
    }
  }

  // If still not found, search for any folder containing the character name and ID
  if (!matchingFolder) {
    const numericId = charId.match(/_([a-z0-9]+)$/)?.[1] || '';
    const firstName = charName.split('_')[0];
    const lastName = charName.split('_')[1] || '';

    matchingFolder = folders.find(f => {
      const lowerF = f.toLowerCase();
      // Must contain first name AND the ID
      const hasFirstName = lowerF.includes(firstName);
      const hasId = lowerF.includes(`_${numericId}`) || lowerF.includes(`_${numericId.padStart(3, '0')}`);
      // Optionally contains last name
      const hasLastName = !lastName || lowerF.includes(lastName);

      return hasFirstName && hasLastName && hasId;
    });
  }

  if (!matchingFolder) {
    console.log(`⚠️  No folder found for ${charId} (${char.name})`);
    errorCount++;
    return;
  }

  // Check current path
  const currentPortrait = char.portrait || '';
  const expectedPath = `assets/characters/${matchingFolder}/`;

  if (!currentPortrait.includes(matchingFolder)) {
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

    console.log(`✅ Fixed: ${charId} (${char.name}) -> ${matchingFolder}`);
    fixedCount++;
  }
});

// Write updated JSON
fs.writeFileSync(CHARACTERS_JSON, JSON.stringify(characters, null, 2), 'utf8');

console.log(`\n🎉 Complete!`);
console.log(`✅ Fixed: ${fixedCount} characters`);
console.log(`⚠️  Errors: ${errorCount} characters`);
console.log(`📝 Updated: ${CHARACTERS_JSON}`);
