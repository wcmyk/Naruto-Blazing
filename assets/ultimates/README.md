# Last Stand Ultimate PNG Assets

Place your Last Stand Ultimate PNG images in this directory.

## Required Images

Based on `data/equip-ultimates.json`, the following PNG files are needed:

1. **rasengan_ultimate.png** - Massive Rasengan (Naruto)
2. **chidori_ultimate.png** - Lightning Blade (Sasuke/Kakashi)
3. **sharingan_ultimate.png** - Mangekyō Sharingan (Uchiha clan)
4. **sage_mode_ultimate.png** - Sage Mode Activation (Naruto/Jiraiya)
5. **shadow_clone_ultimate.png** - Multi Shadow Clone Jutsu (Naruto)
6. **fire_style_ultimate.png** - Great Fire Annihilation (Uchiha clan/Madara)
7. **byakugan_ultimate.png** - Eight Trigrams Sixty-Four Palms (Hyuga clan)
8. **healing_ultimate.png** - Mystical Palm Technique (Sakura/Tsunade)

## Image Specifications

- **Format**: PNG (with transparency recommended)
- **Dimensions**: Recommended 256x256 or 512x512 pixels
- **Usage**: These images will be displayed during battle when Last Stand Ultimates are activated

## JSON Structure

Each ultimate in `data/equip-ultimates.json` now includes an `image` field:

```json
{
  "id": "rasengan_ultimate",
  "name": "Massive Rasengan",
  "icon": "💥",
  "image": "assets/ultimates/rasengan_ultimate.png",
  ...
}
```

The system will use the emoji `icon` as a fallback if the PNG image is not found.
