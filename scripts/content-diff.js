#!/usr/bin/env node
/**
 * Content Diff Tool
 * Shows what changed in your data files
 * Usage: npm run content:diff
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function runGit(command) {
  try {
    return execSync(command, { encoding: 'utf8' });
  } catch (e) {
    return '';
  }
}

function analyzeCharacterChanges() {
  console.log(`\n${colors.bold}${colors.cyan}📊 Character Data Changes:${colors.reset}\n`);

  // Get diff of characters.json
  const diff = runGit('git diff HEAD data/characters.json');

  if (!diff) {
    console.log('  No changes to characters.json');
    return;
  }

  // Parse diff to find what changed
  const lines = diff.split('\n');
  let added = 0;
  let removed = 0;
  let modified = 0;

  let currentCharacter = null;
  const changes = [];

  lines.forEach(line => {
    // Detect character IDs
    if (line.includes('"id":')) {
      const match = line.match(/"id":\s*"([^"]+)"/);
      if (match) {
        currentCharacter = match[1];
      }
    }

    if (line.startsWith('+') && !line.startsWith('+++')) {
      if (line.includes('"id":')) {
        added++;
        changes.push({ type: 'added', char: currentCharacter, line: line.substring(1).trim() });
      } else if (currentCharacter) {
        changes.push({ type: 'modified', char: currentCharacter, line: line.substring(1).trim() });
      }
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      if (line.includes('"id":')) {
        removed++;
        changes.push({ type: 'removed', char: currentCharacter, line: line.substring(1).trim() });
      }
    }
  });

  console.log(`  ${colors.green}Added:${colors.reset} ${added} character(s)`);
  console.log(`  ${colors.red}Removed:${colors.reset} ${removed} character(s)`);
  console.log(`  ${colors.yellow}Modified:${colors.reset} ${modified} character(s)`);

  // Show details
  if (changes.length > 0 && changes.length < 50) {
    console.log(`\n  ${colors.bold}Recent Changes:${colors.reset}`);
    changes.slice(0, 20).forEach(change => {
      const symbol = change.type === 'added' ? '+' : change.type === 'removed' ? '-' : '~';
      const color = change.type === 'added' ? colors.green : change.type === 'removed' ? colors.red : colors.yellow;
      console.log(`    ${color}${symbol} ${change.char || 'unknown'}${colors.reset}`);
    });
  }
}

function analyzeAllDataFiles() {
  console.log(`\n${colors.bold}${colors.cyan}📁 All Data File Changes:${colors.reset}\n`);

  const dataFiles = [
    'characters.json',
    'missions.json',
    'enemies.json',
    'awakening-transforms.json',
    'summon.json',
    'shop.json',
  ];

  dataFiles.forEach(file => {
    const diff = runGit(`git diff HEAD data/${file}`);
    if (diff) {
      const insertions = (diff.match(/^\+/gm) || []).length;
      const deletions = (diff.match(/^-/gm) || []).length;
      console.log(`  ${colors.yellow}${file}:${colors.reset} +${insertions} -${deletions} lines`);
    }
  });
}

function showCommitHistory() {
  console.log(`\n${colors.bold}${colors.cyan}📜 Recent Content Commits:${colors.reset}\n`);

  const log = runGit('git log --oneline --max-count=10 -- data/');
  if (log) {
    console.log(log);
  } else {
    console.log('  No recent commits to data files');
  }
}

// Main
console.log(`\n${colors.bold}═══════════════════════════════════════${colors.reset}`);
console.log(`${colors.bold}   Content Diff Report${colors.reset}`);
console.log(`${colors.bold}═══════════════════════════════════════${colors.reset}`);

analyzeCharacterChanges();
analyzeAllDataFiles();
showCommitHistory();

console.log(`\n${colors.bold}═══════════════════════════════════════${colors.reset}\n`);
