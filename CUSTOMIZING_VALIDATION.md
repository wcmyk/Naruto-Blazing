# 🔧 Customizing Validation Rules

## **Quick Guide**

The validation rules are now in a **single config file** that's easy to edit!

**File:** `scripts/validation-config.js`

---

## 📝 Common Customizations

### **1. Change Rarity Range**

```javascript
// In scripts/validation-config.js

rarity: {
  min: 1,
  max: 10,  // ← Change this to match your game
  validValues: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]  // ← Add/remove values
}
```

**Example:** If your game has 1-12 star characters:
```javascript
rarity: {
  min: 1,
  max: 12,
  validValues: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
}
```

---

### **2. Adjust Stat Warning Thresholds**

```javascript
stats: {
  maxAtkWarning: 10000,   // ← Warns if ATK > 10,000
  maxHpWarning: 100000,   // ← Warns if HP > 100,000
  maxSpeedWarning: 500    // ← Warns if Speed > 500
}
```

**Example:** If you have characters with 50,000 ATK:
```javascript
stats: {
  maxAtkWarning: 50000,   // Won't warn until 50,000+
  maxHpWarning: 200000,
  maxSpeedWarning: 1000
}
```

---

### **3. Add/Remove Required Fields**

```javascript
requiredFields: ['id', 'name', 'rarity', 'statsBase', 'statsMax'],
```

**Example:** Make 'element' required:
```javascript
requiredFields: ['id', 'name', 'rarity', 'element', 'statsBase', 'statsMax'],
```

---

### **4. Add Valid Elements**

```javascript
validElements: ['Body', 'Skill', 'Heart', 'Bravery', 'Wisdom', null],
```

**Example:** Add new elements:
```javascript
validElements: ['Body', 'Skill', 'Heart', 'Bravery', 'Wisdom', 'Void', 'Cosmic', null],
```

---

### **5. Turn Warnings Into Errors (Strict Mode)**

```javascript
strictMode: false,  // ← Change to true
```

**When `strictMode: true`:**
- Warnings become errors
- Validation fails if ANY warning found
- More strict, but safer

---

## 🎯 Example: Your Game Rules

Based on your correction, here's your current config:

```javascript
module.exports = {
  characters: {
    requiredFields: ['id', 'name', 'rarity', 'statsBase', 'statsMax'],

    rarity: {
      min: 1,
      max: 10,  // ✅ Your game: 1-10 stars
      validValues: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    },

    stats: {
      maxAtkWarning: 10000,  // Adjust if you have stronger characters
      maxHpWarning: 100000,
      maxSpeedWarning: 500
    },

    validElements: ['Body', 'Skill', 'Heart', 'Bravery', 'Wisdom', null],
  },
  // ...
};
```

---

## 🧪 Testing Your Changes

After editing `validation-config.js`:

```bash
# Test validation with new rules
npm run validate

# Should now accept rarity 8:
# ✅ Character with rarity 8 is valid
# ❌ Character with rarity 11 is invalid (exceeds max 10)
```

---

## 💡 Pro Tips

### **Don't Want Asset Validation?**
```javascript
assets: {
  checkPortraits: false,     // Skip portrait validation
  checkFullImages: false,    // Skip full image validation
  checkMaps: true,           // Still check mission maps
}
```

### **Add Custom Validation**
Edit `scripts/validate-content.js` and add your own checks:

```javascript
// Example: Validate character names
if (char.name && char.name.length > 50) {
  warning(`${prefix}: Name too long (${char.name.length} chars)`);
}

// Example: Check for placeholder text
if (char.description && char.description.includes('TODO')) {
  error(`${prefix}: Description contains TODO placeholder`);
}
```

---

## 📋 Full Config Reference

```javascript
module.exports = {
  // Character validation
  characters: {
    requiredFields: [...],      // Fields that MUST exist
    rarity: { min, max, validValues }, // Rarity constraints
    stats: { maxAtkWarning, ... },     // Warning thresholds
    validElements: [...],       // Allowed element types
    idPattern: /regex/,         // ID format validation
  },

  // Mission validation
  missions: {
    requiredFields: [...],      // Required mission fields
    validDifficulties: [...],   // Allowed difficulty levels
  },

  // Summon validation
  summon: {
    rateSum: 1.0,              // Drop rates should sum to 1.0
    rateSumTolerance: 0.001,   // Allow slight variance
  },

  // Asset checks
  assets: {
    checkPortraits: true,       // Validate portrait images
    checkFullImages: true,      // Validate full images
    checkMaps: true,            // Validate mission maps
    checkUltimateAnimations: false, // Skip optional assets
  },

  // Global settings
  strictMode: false,           // Warnings = errors if true
  verbose: true,               // Show detailed output
};
```

---

## 🎓 Summary

**To customize validation:**

1. Edit `scripts/validation-config.js`
2. Change the values to match YOUR game rules
3. Run `npm run validate` to test
4. Commit the config file to git

**No need to edit the validation script itself** - just change the config! ✅
