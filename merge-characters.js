#!/usr/bin/env node
/**
 * Merge Characters JSON
 * Combines main branch (1402 characters) with our branch (10 improved characters)
 */

const fs = require('fs');

console.log('🔀 Starting character merge...\n');

// Get both versions from temp files
const mainVersion = JSON.parse(fs.readFileSync('/tmp/main-characters.json', 'utf8'));
const ourVersion = JSON.parse(fs.readFileSync('/tmp/our-characters.json', 'utf8'));

console.log(`📖 Main branch: ${mainVersion.length} characters`);
console.log(`📖 Our branch: ${ourVersion.length} characters\n`);

// Create a map of main characters by ID
const mainCharMap = new Map();
mainVersion.forEach(char => {
  mainCharMap.set(char.id, char);
});

// Track what we're doing
let updated = 0;
let added = 0;

// Process our characters
ourVersion.forEach(ourChar => {
  if (mainCharMap.has(ourChar.id)) {
    // Character exists in main - replace with our improved version
    const index = mainVersion.findIndex(c => c.id === ourChar.id);
    mainVersion[index] = ourChar;
    console.log(`✅ Updated: ${ourChar.id} (${ourChar.name}) - using improved version with fixed paths`);
    updated++;
  } else {
    // Character doesn't exist in main - add it
    mainVersion.push(ourChar);
    console.log(`➕ Added: ${ourChar.id} (${ourChar.name})`);
    added++;
  }
});

// Write merged result
fs.writeFileSync('data/characters.json', JSON.stringify(mainVersion, null, 2), 'utf8');

console.log(`\n🎉 Merge complete!`);
console.log(`📊 Final count: ${mainVersion.length} characters`);
console.log(`✅ Updated: ${updated} characters (with improved asset paths)`);
console.log(`➕ Added: ${added} new characters`);
