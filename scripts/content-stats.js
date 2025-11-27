#!/usr/bin/env node
/**
 * Content Statistics Tool
 * Shows overview of your game content
 * Usage: npm run content:stats
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  bold: '\x1b[1m',
};

function loadJSON(filename) {
  try {
    const filepath = path.join(__dirname, '..', 'data', filename);
    const content = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(content);
  } catch (e) {
    return null;
  }
}

function analyzeCharacters() {
  const characters = loadJSON('characters.json');
  if (!characters) return;

  console.log(`\n${colors.bold}${colors.cyan}📊 Character Statistics:${colors.reset}\n`);
  console.log(`  Total Characters: ${colors.green}${characters.length}${colors.reset}`);

  // Count by rarity
  const byRarity = {};
  const byElement = {};
  characters.forEach(char => {
    byRarity[char.rarity] = (byRarity[char.rarity] || 0) + 1;
    if (char.element) {
      byElement[char.element] = (byElement[char.element] || 0) + 1;
    }
  });

  console.log(`\n  ${colors.yellow}By Rarity:${colors.reset}`);
  Object.entries(byRarity).sort((a, b) => b[0] - a[0]).forEach(([rarity, count]) => {
    const stars = '⭐'.repeat(parseInt(rarity));
    console.log(`    ${stars} ${rarity}-star: ${count}`);
  });

  console.log(`\n  ${colors.yellow}By Element:${colors.reset}`);
  Object.entries(byElement).sort((a, b) => b[1] - a[1]).forEach(([element, count]) => {
    console.log(`    ${element || 'None'}: ${count}`);
  });

  // Awakening eligible
  const lbEligible = characters.filter(c => c.lbEligible).length;
  console.log(`\n  ${colors.yellow}Limit Break Eligible:${colors.reset} ${lbEligible}`);
}

function analyzeMissions() {
  const missions = loadJSON('missions.json');
  if (!missions) return;

  console.log(`\n${colors.bold}${colors.cyan}🎯 Mission Statistics:${colors.reset}\n`);
  console.log(`  Total Missions: ${colors.green}${missions.length}${colors.reset}`);

  let totalStages = 0;
  missions.forEach(mission => {
    if (mission.difficulties) {
      Object.values(mission.difficulties).forEach(stages => {
        if (Array.isArray(stages)) {
          totalStages += stages.length;
        }
      });
    }
  });

  console.log(`  Total Stages: ${colors.green}${totalStages}${colors.reset}`);
}

function analyzeTransforms() {
  const transforms = loadJSON('awakening-transforms.json');
  if (!transforms) return;

  console.log(`\n${colors.bold}${colors.cyan}✨ Awakening Statistics:${colors.reset}\n`);
  console.log(`  Total Transformations: ${colors.green}${transforms.length}${colors.reset}`);
}

function analyzeSummon() {
  const summon = loadJSON('summon.json');
  if (!summon || !summon.pools) return;

  console.log(`\n${colors.bold}${colors.cyan}🎲 Summon Statistics:${colors.reset}\n`);
  console.log(`  Total Summon Pools: ${colors.green}${summon.pools.length}${colors.reset}`);

  summon.pools.forEach((pool, index) => {
    if (pool.characters && pool.id) {
      console.log(`  ${pool.id}: ${pool.characters.length} characters`);
    }
  });
}

function analyzeFileSize() {
  console.log(`\n${colors.bold}${colors.cyan}💾 File Sizes:${colors.reset}\n`);

  const dataDir = path.join(__dirname, '..', 'data');
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

  files.sort((a, b) => {
    const sizeA = fs.statSync(path.join(dataDir, a)).size;
    const sizeB = fs.statSync(path.join(dataDir, b)).size;
    return sizeB - sizeA;
  }).forEach(file => {
    const size = fs.statSync(path.join(dataDir, file)).size;
    const sizeKB = (size / 1024).toFixed(2);
    const sizeMB = (size / 1024 / 1024).toFixed(2);
    const sizeStr = size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;
    console.log(`  ${file.padEnd(30)} ${sizeStr}`);
  });
}

// Main
console.log(`\n${colors.bold}═══════════════════════════════════════${colors.reset}`);
console.log(`${colors.bold}   Content Statistics Report${colors.reset}`);
console.log(`${colors.bold}═══════════════════════════════════════${colors.reset}`);

analyzeCharacters();
analyzeMissions();
analyzeTransforms();
analyzeSummon();
analyzeFileSize();

console.log(`\n${colors.bold}═══════════════════════════════════════${colors.reset}\n`);
