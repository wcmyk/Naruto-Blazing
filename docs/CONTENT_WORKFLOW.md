# 📚 Content Management Workflow

This guide explains how to safely edit and deploy game content data.

## 🎯 Overview

Game content (characters, missions, etc.) is stored in **JSON files** in the `data/` directory. This workflow ensures:

- ✅ All changes are validated before commit
- ✅ Preview changes in staging before production
- ✅ Easy rollback if mistakes are found
- ✅ Full history of all content changes

---

## 📁 Data Files

| File | Purpose | Size | Can Edit? |
|------|---------|------|-----------|
| `characters.json` | Character definitions, stats, assets | 3.2 MB | ✅ Yes |
| `missions.json` | Mission configurations, stages, enemies | 36 KB | ✅ Yes |
| `enemies.json` | Enemy templates | 531 B | ✅ Yes |
| `awakening-transforms.json` | Character transformation rules | 20 KB | ✅ Yes |
| `summon.json` | Gacha pools, drop rates | 13 KB | ✅ Yes |
| `shop.json` | Shop items and prices | 3 KB | ✅ Yes |
| `ninja-ranks.json` | Progression tiers | 1.5 KB | ✅ Yes |
| `limit-break-costs.json` | Upgrade costs | 1 KB | ✅ Yes |
| Other files | Various game configs | Varies | ✅ Yes |

---

## 🔄 Editing Workflow

### Step 1: Edit Locally

```bash
# Open any data file in your editor
code data/characters.json

# Make your changes:
# - Add new characters
# - Modify stats
# - Fix typos
# - Update assets paths
# etc.
```

### Step 2: Validate Changes

```bash
# Run validation (catches errors before commit)
npm run validate

# Output:
# ✅ Validated 823 characters
# ✅ Validated 47 missions
# ❌ ERROR: Character 'naruto_999' has invalid rarity: 8
# ⚠️  WARNING: Character 'sasuke_150' has very high ATK: 15000

# Fix any errors, then validate again
npm run validate
```

### Step 3: View What Changed

```bash
# See your changes
npm run content:diff

# Output shows:
# - Characters added/removed/modified
# - Files changed
# - Line counts
```

### Step 4: Test Locally

```bash
# Start local development server
npm run dev:all

# Open http://localhost:8080
# Test your changes in the browser
# - Does new character appear?
# - Are stats correct?
# - Does awakening work?
```

### Step 5: Commit & Push to Staging

```bash
# Git will automatically run validation before commit
git add data/characters.json
git commit -m "Add Naruto Six Paths mode, rebalance Sasuke"

# Pre-commit hook runs:
# 🔍 Running content validation...
# ✅ Content validation passed!

# Push to staging branch
git push origin staging

# GitHub Actions will:
# - Run validation again
# - Deploy to staging server
# - Post link to staging environment
```

### Step 6: Review on Staging

```bash
# Visit staging environment
https://staging.your-domain.com

# Test everything thoroughly:
# - Summon the new character
# - Check stats match your edits
# - Test awakening
# - Verify images load
# - Check for any visual bugs

# If issues found:
git checkout staging
# Edit files
git commit -m "Fix: Portrait path typo"
git push origin staging
# Staging auto-updates
```

### Step 7: Deploy to Production

```bash
# When staging looks good:
git checkout main
git merge staging
git push origin main

# GitHub Actions automatically:
# - Validates content
# - Creates deployment tag (for rollback)
# - Deploys to production
# - Creates GitHub release
```

### Step 8: Rollback if Needed

```bash
# If you find issues in production:
git checkout deploy-20231126-143022  # Use latest tag
git push origin main --force

# Or use GitHub UI:
# Go to Releases → Find deployment tag → Redeploy
```

---

## 🛠️ Useful Commands

```bash
# Validate all content
npm run validate

# Validate and watch for changes (auto-validates on save)
npm run validate:watch

# See what changed
npm run content:diff

# View content statistics
npm run content:stats
# Output:
# Total Characters: 823
# By Rarity: 6-star: 145, 5-star: 312, ...
# Total Missions: 47
# File Sizes: characters.json 3.2 MB, ...

# Run frontend locally
npm run dev:frontend

# Run backend locally
npm run dev:backend

# Run both frontend + backend
npm run dev:all
```

---

## ✅ Validation Rules

The validation script checks for:

### Character Validation
- ✅ Required fields present (id, name, rarity, statsBase, statsMax)
- ✅ Unique character IDs (no duplicates)
- ✅ Valid rarity (1-6)
- ✅ Max stats >= Base stats
- ✅ Asset files exist (portraits, full images)
- ⚠️ Warnings for unusual stats (ATK > 10000, HP > 100000)

### Mission Validation
- ✅ Unique mission IDs
- ✅ Required fields (id, name, difficulties)
- ✅ Map assets exist

### Awakening Validation
- ✅ Character IDs exist in characters.json
- ✅ fromId and toId are valid

### Summon Validation
- ✅ All character IDs exist
- ⚠️ Drop rates sum to 1.0 (100%)

---

## 🚫 Common Mistakes

### ❌ DON'T: Edit production files directly
```bash
# Bad: SSH into production and edit files
ssh production
nano /var/www/data/characters.json  # ❌ NO!
```

### ✅ DO: Edit locally, test in staging, then deploy
```bash
# Good: Edit locally
vim data/characters.json
npm run validate
git commit -m "Add character"
git push origin staging  # Test first!
```

---

### ❌ DON'T: Commit without validating
```bash
# Bad: Skip validation
git add data/characters.json
git commit -m "quick fix" --no-verify  # ❌ Bypasses validation!
```

### ✅ DO: Always validate before commit
```bash
# Good: Let validation run
npm run validate  # Manual check
git add data/characters.json
git commit -m "Fix character stats"  # Auto-validates
```

---

### ❌ DON'T: Make unrelated changes in one commit
```bash
# Bad: Mixed changes
git add data/characters.json data/missions.json data/shop.json
git commit -m "updates"  # ❌ Too vague!
```

### ✅ DO: Separate commits by topic
```bash
# Good: Focused commits
git add data/characters.json
git commit -m "Add Naruto Six Paths mode"

git add data/missions.json
git commit -m "Add Valley of the End mission"
```

---

## 📊 Content Stats Example

```bash
$ npm run content:stats

═══════════════════════════════════════
   Content Statistics Report
═══════════════════════════════════════

📊 Character Statistics:

  Total Characters: 823

  By Rarity:
    ⭐⭐⭐⭐⭐⭐ 6-star: 145
    ⭐⭐⭐⭐⭐ 5-star: 312
    ⭐⭐⭐⭐ 4-star: 201
    ⭐⭐⭐ 3-star: 98
    ⭐⭐ 2-star: 45
    ⭐ 1-star: 22

  By Element:
    Body: 185
    Skill: 172
    Heart: 168
    Bravery: 151
    Wisdom: 147

  Limit Break Eligible: 456

🎯 Mission Statistics:

  Total Missions: 47
  Total Stages: 235

✨ Awakening Statistics:

  Total Transformations: 123

🎲 Summon Statistics:

  Total Summon Pools: 8
  Featured Pool: 42 characters
  Standard Pool: 312 characters

💾 File Sizes:

  characters.json            3.2 MB
  missions.json              36 KB
  awakening-transforms.json  20 KB
  summon.json                13 KB

═══════════════════════════════════════
```

---

## 🔒 Security Notes

- Validation prevents most errors, but always test in staging
- Pre-commit hooks can be bypassed with `--no-verify` (don't do this!)
- Only push to `staging` branch for testing
- Only merge to `main` after staging approval
- All deployments are tagged for instant rollback

---

## 🆘 Troubleshooting

### Validation fails with "Invalid JSON"
```bash
# JSON syntax error - missing comma, bracket, etc.
# Fix: Use a JSON validator
cat data/characters.json | python -m json.tool
```

### Pre-commit hook doesn't run
```bash
# Husky not installed
npm install
npx husky install
chmod +x .husky/pre-commit
```

### Changes don't appear after deployment
```bash
# Cache issue - clear browser cache
# Or add cache busting to API
# Or clear CDN cache
```

### Need to rollback production
```bash
# Find deployment tag
git tag -l "deploy-*"

# Checkout tag
git checkout deploy-20231126-143022

# Force push to main
git push origin HEAD:main --force
```

---

## 📞 Need Help?

1. Check validation output: `npm run validate`
2. View recent changes: `npm run content:diff`
3. Check file sizes: `npm run content:stats`
4. Review git history: `git log --oneline -- data/`
5. Ask team for code review

---

**Remember:**
- ✅ Validate before commit
- ✅ Test in staging before production
- ✅ One commit per feature/fix
- ✅ Descriptive commit messages
- ✅ Always have a rollback plan
