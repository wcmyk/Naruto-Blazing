# Banner Images

## Overview

This directory contains the full-width banner images for the summon slideshow system.

## Requirements

- **Format**: PNG (recommended) or JPG
- **Dimensions**: 1920×400px minimum (16:9 aspect ratio recommended)
- **Naming**: `banner_X.png` where X is 1-13
- **File Size**: Keep under 500KB per image for optimal loading

## Banner List

The slideshow currently supports 13 banners:

1. `banner_1.png` - Legendary Summon
2. `banner_2.png` - Blazing Festival
3. `banner_3.png` - New Year Special
4. `banner_4.png` - Anniversary Banner
5. `banner_5.png` - Clan Legends
6. `banner_6.png` - Hokage Collection
7. `banner_7.png` - Akatsuki Rising
8. `banner_8.png` - Team 7 Reunion
9. `banner_9.png` - Sage Mode Masters
10. `banner_10.png` - Bijuu Unleashed
11. `banner_11.png` - War Arc Heroes
12. `banner_12.png` - Next Generation
13. `banner_13.png` - Ultimate Legends

## How to Add/Replace Banners

1. Create your banner image with the recommended dimensions
2. Save it as `banner_X.png` (where X is the banner number 1-13)
3. Place it in this directory
4. The banner will automatically appear in the slideshow
5. To update banner titles/subtitles, edit `js/summon/summon-banner-slideshow.js`

## Fallback

If a banner image is not found, the system will fall back to displaying `assets/Main Background/summon_bg.png`.

## Current Status

All 13 banner slots are defined. Add your actual PNG files here to replace the placeholders.
