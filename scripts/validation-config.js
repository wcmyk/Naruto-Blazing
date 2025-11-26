/**
 * Validation Configuration
 * Customize these rules to match your game's constraints
 */

module.exports = {
  // Character validation rules
  characters: {
    // Required fields for every character
    requiredFields: ['id', 'name', 'rarity', 'statsBase', 'statsMax'],

    // Valid rarity range (1-10 stars)
    rarity: {
      min: 1,
      max: 10,
      validValues: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    },

    // Stat thresholds for warnings
    stats: {
      // Warn if ATK exceeds this value
      maxAtkWarning: 10000,

      // Warn if HP exceeds this value
      maxHpWarning: 100000,

      // Warn if speed is unusually high
      maxSpeedWarning: 500
    },

    // Element validation (null allowed for no element)
    validElements: ['Body', 'Skill', 'Heart', 'Bravery', 'Wisdom', null],

    // Optional: Enforce naming conventions
    idPattern: /^[a-z_0-9]+$/i, // Alphanumeric + underscores only
  },

  // Mission validation rules
  missions: {
    requiredFields: ['id', 'name', 'difficulties'],
    validDifficulties: ['D', 'C', 'B', 'A', 'S', 'SS', 'SSS'],
  },

  // Summon pool validation
  summon: {
    // Drop rates should sum to this value (with tolerance)
    rateSum: 1.0,
    rateSumTolerance: 0.001, // Allow 0.999 - 1.001
  },

  // Asset validation
  assets: {
    // Check if these file types exist
    checkPortraits: true,
    checkFullImages: true,
    checkMaps: true,
    checkUltimateAnimations: false, // Optional assets
  },

  // Global settings
  strictMode: false, // If true, warnings become errors
  verbose: true,     // Show detailed validation output
};
