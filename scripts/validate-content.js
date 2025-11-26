#!/usr/bin/env node
/**
 * Content Validation Script
 * Validates all game data JSON files before deployment
 * Run: node scripts/validate-content.js
 */

const fs = require('fs');
const path = require('path');

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

let errorCount = 0;
let warningCount = 0;

function error(msg) {
  console.error(`${colors.red}❌ ERROR: ${msg}${colors.reset}`);
  errorCount++;
}

function warning(msg) {
  console.warn(`${colors.yellow}⚠️  WARNING: ${msg}${colors.reset}`);
  warningCount++;
}

function success(msg) {
  console.log(`${colors.green}✅ ${msg}${colors.reset}`);
}

function info(msg) {
  console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`);
}

// Load JSON file safely
function loadJSON(filepath) {
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(content);
  } catch (e) {
    error(`Failed to parse ${filepath}: ${e.message}`);
    return null;
  }
}

// Validate characters.json
function validateCharacters(characters) {
  info('Validating characters.json...');

  if (!Array.isArray(characters)) {
    error('characters.json must be an array');
    return;
  }

  const characterIds = new Set();
  const requiredFields = ['id', 'name', 'rarity', 'statsBase', 'statsMax'];
  const validRarities = [1, 2, 3, 4, 5, 6];

  characters.forEach((char, index) => {
    const prefix = `Character #${index} (${char.id || 'unknown'})`;

    // Check required fields
    requiredFields.forEach(field => {
      if (!(field in char)) {
        error(`${prefix}: Missing required field '${field}'`);
      }
    });

    // Check ID uniqueness
    if (char.id) {
      if (characterIds.has(char.id)) {
        error(`${prefix}: Duplicate character ID '${char.id}'`);
      }
      characterIds.add(char.id);
    }

    // Check rarity
    if (char.rarity && !validRarities.includes(char.rarity)) {
      error(`${prefix}: Invalid rarity ${char.rarity} (must be 1-6)`);
    }

    // Check stats
    if (char.statsBase && char.statsMax) {
      if (char.statsMax.hp < char.statsBase.hp) {
        error(`${prefix}: Max HP (${char.statsMax.hp}) < Base HP (${char.statsBase.hp})`);
      }
      if (char.statsMax.atk < char.statsBase.atk) {
        error(`${prefix}: Max ATK (${char.statsMax.atk}) < Base ATK (${char.statsBase.atk})`);
      }

      // Warn about unusual stats
      if (char.statsMax.atk > 10000) {
        warning(`${prefix}: Very high ATK: ${char.statsMax.atk}`);
      }
      if (char.statsMax.hp > 100000) {
        warning(`${prefix}: Very high HP: ${char.statsMax.hp}`);
      }
    }

    // Check assets exist
    if (char.portrait) {
      const portraitPath = path.join(__dirname, '..', char.portrait);
      if (!fs.existsSync(portraitPath)) {
        error(`${prefix}: Portrait not found: ${char.portrait}`);
      }
    }

    if (char.full) {
      const fullPath = path.join(__dirname, '..', char.full);
      if (!fs.existsSync(fullPath)) {
        error(`${prefix}: Full image not found: ${char.full}`);
      }
    }
  });

  success(`Validated ${characters.length} characters`);
  return characterIds;
}

// Validate missions.json
function validateMissions(missions, characterIds) {
  info('Validating missions.json...');

  if (!Array.isArray(missions)) {
    error('missions.json must be an array');
    return;
  }

  const missionIds = new Set();

  missions.forEach((mission, index) => {
    const prefix = `Mission #${index} (${mission.id || 'unknown'})`;

    // Check required fields
    if (!mission.id) {
      error(`${prefix}: Missing mission ID`);
    } else if (missionIds.has(mission.id)) {
      error(`${prefix}: Duplicate mission ID '${mission.id}'`);
    } else {
      missionIds.add(mission.id);
    }

    if (!mission.name) {
      error(`${prefix}: Missing mission name`);
    }

    if (!mission.difficulties) {
      error(`${prefix}: Missing difficulties object`);
    }

    // Check map assets
    if (mission.difficulties) {
      Object.entries(mission.difficulties).forEach(([difficulty, stages]) => {
        if (!Array.isArray(stages)) return;

        stages.forEach((stage, stageIndex) => {
          if (stage.map) {
            const mapPath = path.join(__dirname, '..', stage.map);
            if (!fs.existsSync(mapPath)) {
              error(`${prefix} [${difficulty}] Stage ${stageIndex}: Map not found: ${stage.map}`);
            }
          }
        });
      });
    }
  });

  success(`Validated ${missions.length} missions`);
  return missionIds;
}

// Validate awakening transforms
function validateAwakeningTransforms(transforms, characterIds) {
  info('Validating awakening-transforms.json...');

  if (!Array.isArray(transforms)) {
    error('awakening-transforms.json must be an array');
    return;
  }

  transforms.forEach((transform, index) => {
    const prefix = `Transform #${index}`;

    if (!transform.fromId || !transform.toId) {
      error(`${prefix}: Missing fromId or toId`);
      return;
    }

    // Check if character IDs exist
    if (characterIds && !characterIds.has(transform.fromId)) {
      error(`${prefix}: Character '${transform.fromId}' does not exist in characters.json`);
    }

    if (characterIds && !characterIds.has(transform.toId)) {
      error(`${prefix}: Character '${transform.toId}' does not exist in characters.json`);
    }
  });

  success(`Validated ${transforms.length} awakening transforms`);
}

// Validate summon pools
function validateSummonPools(summonData, characterIds) {
  info('Validating summon.json...');

  if (!summonData.pools || !Array.isArray(summonData.pools)) {
    error('summon.json must have a "pools" array');
    return;
  }

  summonData.pools.forEach((pool, index) => {
    const prefix = `Pool #${index} (${pool.id || 'unknown'})`;

    if (!pool.id) {
      error(`${prefix}: Missing pool ID`);
    }

    if (!pool.characters || !Array.isArray(pool.characters)) {
      error(`${prefix}: Missing or invalid characters array`);
      return;
    }

    // Check if all characters exist
    pool.characters.forEach(charId => {
      if (characterIds && !characterIds.has(charId)) {
        error(`${prefix}: Character '${charId}' does not exist in characters.json`);
      }
    });

    // Validate drop rates
    if (pool.rates) {
      const totalRate = Object.values(pool.rates).reduce((sum, rate) => sum + rate, 0);
      if (Math.abs(totalRate - 1.0) > 0.001) {
        warning(`${prefix}: Drop rates sum to ${totalRate.toFixed(4)}, should be 1.0`);
      }
    }
  });

  success(`Validated ${summonData.pools.length} summon pools`);
}

// Main validation function
function validateAll() {
  console.log(`\n${colors.magenta}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.magenta}   Content Validation Starting...${colors.reset}`);
  console.log(`${colors.magenta}═══════════════════════════════════════${colors.reset}\n`);

  const dataDir = path.join(__dirname, '..', 'data');

  // Load all data files
  const characters = loadJSON(path.join(dataDir, 'characters.json'));
  const missions = loadJSON(path.join(dataDir, 'missions.json'));
  const transforms = loadJSON(path.join(dataDir, 'awakening-transforms.json'));
  const summon = loadJSON(path.join(dataDir, 'summon.json'));

  // Run validations
  let characterIds = null;
  if (characters) {
    characterIds = validateCharacters(characters);
  }

  if (missions) {
    validateMissions(missions, characterIds);
  }

  if (transforms) {
    validateAwakeningTransforms(transforms, characterIds);
  }

  if (summon) {
    validateSummonPools(summon, characterIds);
  }

  // Summary
  console.log(`\n${colors.magenta}═══════════════════════════════════════${colors.reset}`);
  if (errorCount === 0 && warningCount === 0) {
    console.log(`${colors.green}✅ All validations passed!${colors.reset}`);
  } else {
    console.log(`${colors.yellow}Validation Summary:${colors.reset}`);
    console.log(`  Errors: ${errorCount}`);
    console.log(`  Warnings: ${warningCount}`);

    if (errorCount > 0) {
      console.log(`\n${colors.red}❌ Validation FAILED - Fix errors before deploying${colors.reset}`);
    } else {
      console.log(`\n${colors.green}✅ No errors, but review warnings${colors.reset}`);
    }
  }
  console.log(`${colors.magenta}═══════════════════════════════════════${colors.reset}\n`);

  // Exit with error code if validation failed
  process.exit(errorCount > 0 ? 1 : 0);
}

// Run validation
validateAll();
