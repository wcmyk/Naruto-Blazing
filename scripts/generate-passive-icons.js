#!/usr/bin/env node

/**
 * Generate Passive Icons Script
 *
 * Converts ability names to snake_case identifiers and updates
 * characters.json with passiveIcons mappings.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CHARACTERS_FILE = path.join(__dirname, '../data/characters.json');
const OUTPUT_MAPPING_FILE = path.join(__dirname, '../data/passive-icons-mapping.json');

/**
 * Convert ability name to snake_case identifier
 * Examples:
 *   "Attack Reduction Resistance" → "attack_reduction_resistance"
 *   "Warrior's Spirit" → "warriors_spirit"
 *   "0 Chakra Req'd for Ninjutsu" → "0_chakra_reqd_for_ninjutsu"
 */
function toSnakeCase(name) {
  return name
    .toLowerCase()                          // Convert to lowercase
    .replace(/'/g, '')                      // Remove apostrophes
    .replace(/\./g, '')                     // Remove periods
    .replace(/\(/g, '')                     // Remove opening parentheses
    .replace(/\)/g, '')                     // Remove closing parentheses
    .replace(/\//g, '_')                    // Replace slashes with underscores
    .replace(/,/g, '')                      // Remove commas
    .replace(/\s+/g, '_')                   // Replace spaces with underscores
    .replace(/_+/g, '_')                    // Collapse multiple underscores
    .replace(/^_|_$/g, '');                 // Trim leading/trailing underscores
}

/**
 * Extract all unique ability names from characters
 */
function extractUniqueAbilities(characters) {
  const abilitySet = new Set();

  characters.forEach(char => {
    if (char.abilities && Array.isArray(char.abilities)) {
      char.abilities.forEach(ability => {
        if (ability.name) {
          abilitySet.add(ability.name);
        }
      });
    }
  });

  return Array.from(abilitySet).sort();
}

/**
 * Generate mapping of ability names to snake_case identifiers
 */
function generateMapping(abilityNames) {
  const mapping = {};

  abilityNames.forEach(name => {
    mapping[name] = toSnakeCase(name);
  });

  return mapping;
}

/**
 * Update characters with passiveIcons based on their abilities
 */
function updateCharactersWithPassiveIcons(characters, mapping) {
  let updateCount = 0;

  characters.forEach(char => {
    if (char.abilities && Array.isArray(char.abilities) && char.abilities.length > 0) {
      const passiveIcons = {};

      char.abilities.forEach((ability, index) => {
        if (ability.name) {
          const iconKey = mapping[ability.name];
          if (iconKey) {
            // Use ability index as the key, value is the snake_case identifier
            passiveIcons[index + 1] = iconKey;
          }
        }
      });

      if (Object.keys(passiveIcons).length > 0) {
        char.passiveIcons = passiveIcons;
        updateCount++;
      }
    }
  });

  return updateCount;
}

/**
 * Main execution
 */
function main() {
  console.log('🎯 Passive Icons Generator\n');

  // Load characters.json
  console.log('📖 Reading characters.json...');
  const charactersData = fs.readFileSync(CHARACTERS_FILE, 'utf8');
  const characters = JSON.parse(charactersData);
  console.log(`✅ Loaded ${characters.length} characters\n`);

  // Extract unique abilities
  console.log('🔍 Extracting unique ability names...');
  const uniqueAbilities = extractUniqueAbilities(characters);
  console.log(`✅ Found ${uniqueAbilities.length} unique abilities\n`);

  // Generate mapping
  console.log('🔄 Generating snake_case mappings...');
  const mapping = generateMapping(uniqueAbilities);
  console.log(`✅ Generated ${Object.keys(mapping).length} mappings\n`);

  // Show sample mappings
  console.log('📋 Sample Mappings:');
  const sampleKeys = Object.keys(mapping).slice(0, 10);
  sampleKeys.forEach(key => {
    console.log(`  "${key}" → "${mapping[key]}"`);
  });
  console.log(`  ... and ${Object.keys(mapping).length - 10} more\n`);

  // Save mapping to file
  console.log(`💾 Saving mapping to ${path.basename(OUTPUT_MAPPING_FILE)}...`);
  fs.writeFileSync(
    OUTPUT_MAPPING_FILE,
    JSON.stringify(mapping, null, 2),
    'utf8'
  );
  console.log('✅ Mapping saved\n');

  // Update characters with passiveIcons
  console.log('🔄 Updating characters with passiveIcons...');
  const updateCount = updateCharactersWithPassiveIcons(characters, mapping);
  console.log(`✅ Updated ${updateCount} characters\n`);

  // Save updated characters.json
  console.log('💾 Saving updated characters.json...');
  fs.writeFileSync(
    CHARACTERS_FILE,
    JSON.stringify(characters, null, 2),
    'utf8'
  );
  console.log('✅ Characters saved\n');

  // Summary
  console.log('📊 Summary:');
  console.log(`  Total abilities: ${uniqueAbilities.length}`);
  console.log(`  Characters updated: ${updateCount}`);
  console.log(`  Mapping file: ${OUTPUT_MAPPING_FILE}`);
  console.log(`  Characters file: ${CHARACTERS_FILE}`);
  console.log('\n✨ Done!');
}

// Run
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

module.exports = { toSnakeCase, generateMapping };
