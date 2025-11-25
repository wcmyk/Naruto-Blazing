#!/bin/bash
# Example: Add Rasa character to the database
# This demonstrates the complete workflow

echo "🎮 Adding Rasa (Fourth Kazekage) to database..."
echo ""

# 1. Add character with basic info
echo "1️⃣ Adding character to database..."
node admin-cli.js add rasa_1191 "Rasa"
echo ""

# 2. Update metadata
echo "2️⃣ Updating character metadata..."
node admin-cli.js update rasa_1191 version "Fourth Kazekage"
node admin-cli.js update rasa_1191 element "wind"
node admin-cli.js update rasa_1191 rarity 5
node admin-cli.js update rasa_1191 starMinCode "5S"
node admin-cli.js update rasa_1191 starMaxCode "6S"
echo ""

# 3. Update base stats
echo "3️⃣ Setting base stats..."
node admin-cli.js update rasa_1191 statsBase.hp 5200
node admin-cli.js update rasa_1191 statsBase.atk 4800
node admin-cli.js update rasa_1191 statsBase.def 2100
node admin-cli.js update rasa_1191 statsBase.speed 180
node admin-cli.js update rasa_1191 statsBase.chakra 8
echo ""

# 4. Update max stats (usually 2x base)
echo "4️⃣ Setting max stats..."
node admin-cli.js update rasa_1191 statsMax.hp 10400
node admin-cli.js update rasa_1191 statsMax.atk 9600
node admin-cli.js update rasa_1191 statsMax.def 4200
node admin-cli.js update rasa_1191 statsMax.speed 360
node admin-cli.js update rasa_1191 statsMax.chakra 12
echo ""

# 5. Set growth curve
echo "5️⃣ Setting growth curve..."
node admin-cli.js update rasa_1191 'growthCurve' '{"hp":1.12,"atk":1.18,"def":1.08,"speed":1.05,"chakra":1}'
echo ""

# 6. Set passive icons
echo "6️⃣ Setting passive abilities..."
node admin-cli.js update rasa_1191 'passiveIcons' '{"5S":["hp_up","atk_up","wind_dmg_up"],"6S":["hp_up","atk_up","def_up","wind_dmg_up"]}'
echo ""

# 7. Create asset folder
echo "7️⃣ Creating asset folder..."
mkdir -p ../assets/characters/rasa_1191
echo "✅ Folder created: assets/characters/rasa_1191"
echo ""

# 8. Show final result
echo "8️⃣ Character details:"
node admin-cli.js search rasa
echo ""

echo "✅ Done! Next steps:"
echo "   1. Add portrait image: assets/characters/rasa_1191/portrait_5S.png"
echo "   2. Add full image: assets/characters/rasa_1191/full_5S.png"
echo "   3. Add evolved images: portrait_6S.png and full_6S.png"
echo "   4. Commit changes: git add data/characters.json assets/characters/rasa_1191"
