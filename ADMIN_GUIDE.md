# Admin Guide: Managing Character Database

Complete guide for developers to add, update, and manage characters.

## Table of Contents
1. [Quick Start](#quick-start)
2. [Using the CLI](#using-the-cli)
3. [Using the API](#using-the-api)
4. [Uploading Images](#uploading-images)
5. [Backup & Restore](#backup--restore)
6. [Best Practices](#best-practices)

---

## Quick Start

### Add a New Character (3 Steps)

```bash
# 1. Add character to database
node backend/admin-cli.js add rasa_1191 "Rasa"

# 2. Create asset folder and add images
mkdir -p assets/characters/rasa_1191
# Copy your images: portrait_5S.png and full_5S.png

# 3. Update character stats
node backend/admin-cli.js update rasa_1191 rarity 5
node backend/admin-cli.js update rasa_1191 element "wind"
node backend/admin-cli.js update rasa_1191 statsBase.hp 5200
```

That's it! Character is now in the game.

---

## Using the CLI

The CLI tool (`admin-cli.js`) is the easiest way to manage characters.

### Installation
```bash
cd backend
chmod +x admin-cli.js
```

### Commands

#### 1. Add New Character
```bash
node admin-cli.js add <id> <name>

# Examples:
node admin-cli.js add rasa_1191 "Rasa"
node admin-cli.js add gaara_192 "Gaara of the Sand"
```

This creates a basic character template with:
- Default stats (hp, atk, def, speed, chakra)
- Rarity 3 (3★)
- Asset paths pointing to `assets/characters/<id>/`

#### 2. Update Character
```bash
node admin-cli.js update <id> <field> <value>

# Examples:
node admin-cli.js update rasa_1191 rarity 5
node admin-cli.js update rasa_1191 element "wind"
node admin-cli.js update rasa_1191 version "Fourth Kazekage"
node admin-cli.js update rasa_1191 starMaxCode "6S"

# Nested fields:
node admin-cli.js update rasa_1191 statsBase.hp 5200
node admin-cli.js update rasa_1191 statsBase.atk 4800
node admin-cli.js update rasa_1191 statsMax.hp 10400

# JSON values:
node admin-cli.js update rasa_1191 passiveIcons '{"5S":["hp_up","atk_up"]}'
```

#### 3. Delete Character
```bash
node admin-cli.js delete <id>

# Example:
node admin-cli.js delete rasa_1191
# Will ask for confirmation before deleting
```

#### 4. List Characters
```bash
# Show first 20
node admin-cli.js list

# Show all
node admin-cli.js list all
```

#### 5. Search Characters
```bash
node admin-cli.js search <query>

# Examples:
node admin-cli.js search naruto
node admin-cli.js search rasa
node admin-cli.js search 1191
```

#### 6. View Backups
```bash
node admin-cli.js backups
```

---

## Using the API

The REST API provides programmatic access for batch operations and integrations.

### Start the Server
```bash
cd backend
npm install
npm start
```

Server runs on `http://localhost:3000`

### API Endpoints

#### Add New Character
```bash
curl -X POST http://localhost:3000/admin/characters \
  -H "Content-Type: application/json" \
  -d '{
    "id": "rasa_1191",
    "name": "Rasa",
    "version": "Fourth Kazekage",
    "element": "wind",
    "rarity": 5,
    "starMinCode": "5S",
    "starMaxCode": "6S",
    "portrait": "assets/characters/rasa_1191/portrait_5S.png",
    "full": "assets/characters/rasa_1191/full_5S.png",
    "statsBase": {
      "hp": 5200,
      "atk": 4800,
      "def": 2100,
      "speed": 180,
      "chakra": 8
    },
    "statsMax": {
      "hp": 10400,
      "atk": 9600,
      "def": 4200,
      "speed": 360,
      "chakra": 12
    }
  }'
```

Response:
```json
{
  "message": "Character added successfully",
  "character": { ... },
  "backup": "/path/to/backup.json",
  "total": 1410
}
```

#### Update Character (Full Replace)
```bash
curl -X PUT http://localhost:3000/admin/characters/rasa_1191 \
  -H "Content-Type: application/json" \
  -d '{
    "rarity": 6,
    "version": "Reanimated Kazekage"
  }'
```

#### Update Character (Partial Merge)
```bash
curl -X PATCH http://localhost:3000/admin/characters/rasa_1191 \
  -H "Content-Type: application/json" \
  -d '{
    "statsBase": {
      "hp": 5500
    }
  }'
```

This merges `statsBase.hp` while keeping other stats intact.

#### Delete Character
```bash
curl -X DELETE http://localhost:3000/admin/characters/rasa_1191
```

#### Bulk Add/Update
```bash
curl -X POST http://localhost:3000/admin/characters/bulk \
  -H "Content-Type: application/json" \
  -d '[
    {
      "id": "rasa_1191",
      "name": "Rasa",
      "rarity": 5
    },
    {
      "id": "gaara_192",
      "name": "Gaara",
      "rarity": 6
    }
  ]'
```

Response:
```json
{
  "message": "Bulk update completed",
  "added": 2,
  "updated": 0,
  "total": 1411
}
```

#### Validate Data
```bash
curl http://localhost:3000/admin/validate
```

Checks for:
- Missing required fields
- Duplicate IDs
- Missing asset folders

---

## Uploading Images

### Method 1: Manual Copy (Simple)

```bash
# Create folder
mkdir -p assets/characters/rasa_1191

# Copy images
cp ~/Downloads/rasa_portrait.png assets/characters/rasa_1191/portrait_5S.png
cp ~/Downloads/rasa_full.png assets/characters/rasa_1191/full_5S.png
```

### Method 2: API Upload (Automated)

```bash
# Upload portrait
curl -X POST http://localhost:3000/api/upload/rasa_1191 \
  -F "image=@/path/to/portrait.png" \
  -F "tierCode=5S" \
  -F "fileType=portrait"

# Upload full art
curl -X POST http://localhost:3000/api/upload/rasa_1191 \
  -F "image=@/path/to/full.png" \
  -F "tierCode=5S" \
  -F "fileType=full"
```

### Method 3: Web Form (Future Enhancement)

Create a simple HTML upload form:

```html
<form action="http://localhost:3000/api/upload/rasa_1191" method="POST" enctype="multipart/form-data">
  <input type="file" name="image" accept="image/*">
  <input type="text" name="tierCode" value="5S" placeholder="Tier Code">
  <select name="fileType">
    <option value="portrait">Portrait</option>
    <option value="full">Full Art</option>
  </select>
  <button type="submit">Upload</button>
</form>
```

### Image Requirements

- **Format**: PNG, JPG, WEBP, GIF
- **Max Size**: 5MB per file
- **Naming**: `portrait_<tierCode>.png` or `full_<tierCode>.png`
- **Example**: `portrait_5S.png`, `full_6S.png`

---

## Backup & Restore

### Automatic Backups

Every modification automatically creates a backup:
```
data/backups/characters-2025-11-25T12-30-45.json
```

### View Backups

```bash
# CLI
node admin-cli.js backups

# API
curl http://localhost:3000/admin/backups
```

### Restore from Backup

```bash
# API
curl -X POST http://localhost:3000/admin/backups/restore \
  -H "Content-Type: application/json" \
  -d '{"filename": "characters-2025-11-25T12-30-45.json"}'
```

Response:
```json
{
  "message": "Backup restored successfully",
  "restored_from": "characters-2025-11-25T12-30-45.json",
  "current_backup": "characters-2025-11-25T13-45-12.json",
  "character_count": 1409
}
```

### Manual Backup

```bash
cp data/characters.json data/backups/manual-backup-$(date +%Y-%m-%d).json
```

---

## Best Practices

### 1. Always Test Locally First

```bash
# Start server
cd backend && npm start

# Make changes via CLI or API
node admin-cli.js add test_999 "Test Character"

# Validate
curl http://localhost:3000/admin/validate

# If good, commit changes
git add data/characters.json
git commit -m "Add Test Character"
```

### 2. Use Descriptive Character IDs

✅ Good:
- `rasa_1191` (name_number)
- `gaara_192` (name_number)
- `naruto_uzumaki_665` (full_name_number)

❌ Bad:
- `char1` (not descriptive)
- `new_character` (too generic)

### 3. Keep Asset Folders Clean

```
assets/characters/rasa_1191/
├── portrait_5S.png    ✅ Required
├── full_5S.png        ✅ Required
├── portrait_6S.png    ✅ Optional (for evolved form)
├── full_6S.png        ✅ Optional (for evolved form)
└── random_file.txt    ❌ Don't add unrelated files
```

### 4. Update Stats Completely

When adding a character, update ALL stats:

```bash
# Base stats
node admin-cli.js update rasa_1191 statsBase.hp 5200
node admin-cli.js update rasa_1191 statsBase.atk 4800
node admin-cli.js update rasa_1191 statsBase.def 2100
node admin-cli.js update rasa_1191 statsBase.speed 180
node admin-cli.js update rasa_1191 statsBase.chakra 8

# Max stats (usually 2x base)
node admin-cli.js update rasa_1191 statsMax.hp 10400
node admin-cli.js update rasa_1191 statsMax.atk 9600
# ... etc
```

### 5. Validate After Changes

```bash
# Check for errors
curl http://localhost:3000/admin/validate

# Should return:
{
  "valid": true,
  "total_characters": 1410,
  "issues_found": 0,
  "issues": []
}
```

### 6. Git Workflow

```bash
# 1. Create feature branch
git checkout -b add-rasa-character

# 2. Add character
node admin-cli.js add rasa_1191 "Rasa"

# 3. Add assets
mkdir -p assets/characters/rasa_1191
cp ~/images/* assets/characters/rasa_1191/

# 4. Stage changes
git add data/characters.json
git add assets/characters/rasa_1191/

# 5. Commit
git commit -m "Add Rasa character (Fourth Kazekage)"

# 6. Push
git push origin add-rasa-character
```

---

## Common Workflows

### Add Complete Character

```bash
#!/bin/bash
# add-character.sh

ID=$1
NAME=$2

echo "Adding $NAME ($ID)..."

# 1. Add to database
node backend/admin-cli.js add "$ID" "$NAME"

# 2. Update basic info
node backend/admin-cli.js update "$ID" element "wind"
node backend/admin-cli.js update "$ID" rarity 5
node backend/admin-cli.js update "$ID" version "Fourth Kazekage"

# 3. Update stats
node backend/admin-cli.js update "$ID" statsBase.hp 5200
node backend/admin-cli.js update "$ID" statsBase.atk 4800
node backend/admin-cli.js update "$ID" statsBase.def 2100
node backend/admin-cli.js update "$ID" statsBase.speed 180
node backend/admin-cli.js update "$ID" statsBase.chakra 8

node backend/admin-cli.js update "$ID" statsMax.hp 10400
node backend/admin-cli.js update "$ID" statsMax.atk 9600
node backend/admin-cli.js update "$ID" statsMax.def 4200
node backend/admin-cli.js update "$ID" statsMax.speed 360
node backend/admin-cli.js update "$ID" statsMax.chakra 12

# 4. Create asset folder
mkdir -p "assets/characters/$ID"

echo "✅ Character added! Now add images to assets/characters/$ID/"
```

Usage:
```bash
chmod +x add-character.sh
./add-character.sh rasa_1191 "Rasa"
```

### Batch Import from CSV

```bash
# characters.csv:
# id,name,element,rarity
# rasa_1191,Rasa,wind,5
# gaara_192,Gaara,wind,6

node backend/import-from-csv.js characters.csv
```

---

## Troubleshooting

### Problem: "Character already exists"
```bash
# Check if it exists
node admin-cli.js search <id>

# If you want to update instead:
node admin-cli.js update <id> <field> <value>

# If you want to replace:
node admin-cli.js delete <id>
node admin-cli.js add <id> <name>
```

### Problem: Images not showing
```bash
# Check file paths
ls -la assets/characters/<id>/

# Verify in JSON
node admin-cli.js search <id>

# Should see:
# "portrait": "assets/characters/<id>/portrait_5S.png"
```

### Problem: Made a mistake
```bash
# Restore from backup
curl -X POST http://localhost:3000/admin/backups/restore \
  -H "Content-Type: application/json" \
  -d '{"filename": "characters-2025-11-25T12-00-00.json"}'
```

---

## Security Notes

⚠️ **IMPORTANT**: The admin endpoints have NO authentication!

For production:
1. Add API key authentication
2. Use HTTPS only
3. Restrict admin routes to internal network
4. Add rate limiting
5. Log all admin actions

Example with API key:
```javascript
// Middleware
function requireAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Apply to admin routes
app.use('/admin', requireAuth, adminRoutes);
```

---

Need help? Check the code or ask in Discord!
