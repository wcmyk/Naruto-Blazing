#!/usr/bin/env node
/**
 * Rename Asset Folders to Match JSON Character IDs
 *
 * This script renames asset folders to remove middle/last names
 * Example: anko_mitarashi_094 → anko_094
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ASSETS_DIR = 'assets/characters';
const CHARACTERS_FILE = 'data/characters.json';

console.log('🔄 Asset Folder Rename Script');
console.log('================================\n');

if (DRY_RUN) {
  console.log('⚠️  DRY RUN MODE - No actual changes will be made\n');
} else {
  console.log('🚨 LIVE MODE - Folders will be renamed!\n');
}

// Load characters from JSON
const characters = JSON.parse(fs.readFileSync(CHARACTERS_FILE, 'utf8'));
console.log(`📖 Loaded ${characters.length} characters from JSON\n`);

// Get all asset folders
const folders = fs.readdirSync(ASSETS_DIR);
console.log(`📁 Found ${folders.length} folders in assets/characters\n`);

// Create a map of character IDs for quick lookup
const characterIds = new Set(characters.map(c => c.id));

// Track operations
let renamed = 0;
let skipped = 0;
let notFound = 0;

console.log('🔍 Scanning for folders to rename...\n');

folders.forEach(folder => {
  const folderPath = path.join(ASSETS_DIR, folder);

  // Skip if not a directory
  if (!fs.statSync(folderPath).isDirectory()) {
    return;
  }

  // Check if folder name already matches a character ID
  if (characterIds.has(folder)) {
    // Already matches - skip
    return;
  }

  // Extract numeric ID from folder name (last underscore-separated part)
  const parts = folder.split('_');
  const numericId = parts[parts.length - 1];

  // Try to find matching character ID
  // Pattern: firstname_### from firstname_middlename_### or firstname_lastname_###
  const firstName = parts[0];
  const simpleId = `${firstName}_${numericId}`;

  if (characterIds.has(simpleId)) {
    // Found a match - this folder should be renamed
    const newPath = path.join(ASSETS_DIR, simpleId);

    console.log(`✏️  ${folder}`);
    console.log(`   → ${simpleId}`);

    if (!DRY_RUN) {
      try {
        // Try rename first
        try {
          fs.renameSync(folderPath, newPath);
          console.log('   ✅ Renamed successfully\n');
        } catch (error) {
          if (error.code === 'EXDEV') {
            // Cross-device link - need to copy and delete
            console.log('   📋 Cross-device detected, copying folder...');
            fs.cpSync(folderPath, newPath, { recursive: true });
            fs.rmSync(folderPath, { recursive: true, force: true });
            console.log('   ✅ Copied and removed successfully\n');
          } else {
            throw error;
          }
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
      }
    } else {
      console.log('   (dry run - not actually renamed)\n');
    }

    renamed++;
  } else {
    // No matching character ID found
    skipped++;
  }
});

console.log('\n================================');
console.log('📊 Summary:');
console.log(`✅ Folders to rename: ${renamed}`);
console.log(`⏭️  Folders skipped: ${skipped}`);

if (DRY_RUN) {
  console.log('\n💡 Run without --dry-run flag to apply changes');
} else {
  console.log('\n✅ Rename operation complete!');
}
