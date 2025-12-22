# 📱 Naruto Blazing - Mobile Development Guide

Complete guide for developing and building the mobile version of Naruto Blazing using Capacitor.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Development Workflow](#development-workflow)
4. [Building for Production](#building-for-production)
5. [Architecture](#architecture)
6. [Asset Management](#asset-management)
7. [Troubleshooting](#troubleshooting)

---

## Overview

Naruto Blazing uses **Capacitor** to wrap the web game into native mobile apps for Android and iOS. The same codebase serves:
- 🌐 **Web version** (laptop/desktop browsers)
- 📱 **Android app** (Google Play Store)
- 🍎 **iOS app** (App Store)

### Key Features

- ✅ Home screen with "Tap to Start" button
- ✅ Asset download system for first launch
- ✅ Platform detection (web vs mobile)
- ✅ Landscape orientation lock
- ✅ Haptic feedback
- ✅ Fullscreen mode (hidden status bar)
- ✅ Android back button handling

---

## Quick Start

### Prerequisites

**For Android:**
- [Android Studio](https://developer.android.com/studio) installed
- Android SDK installed (via Android Studio)
- Java JDK 11 or higher

**For iOS:**
- macOS required
- [Xcode](https://developer.apple.com/xcode/) installed
- Apple Developer account (for distribution)

### Build and Run

```bash
# 1. Build for mobile
npm run build:mobile

# 2. Open in native IDE
npm run open:android    # For Android
npm run open:ios        # For iOS (macOS only)

# 3. Run on emulator/device from IDE
# - Android Studio: Click "Run" button
# - Xcode: Select device and click "Play" button
```

---

## Development Workflow

### File Structure

```
Naruto-Blazing/
├── index.html            # Login page (web version)
├── home.html             # Home screen with start button
├── village.html          # Main game hub
├── battle.html, etc.     # Other game pages
│
├── js/
│   ├── platform-detector.js      # Detects web vs mobile
│   ├── asset-download-manager.js # Handles asset downloads
│   ├── home-screen.js            # Home screen controller
│   └── mobile-init.js            # Mobile initialization
│
├── www/                  # Mobile build output (auto-generated)
│   ├── index.html        # Entry point (home screen)
│   ├── login.html        # Login page (renamed from index.html)
│   └── ...               # All other files copied here
│
├── android/              # Android native project
├── ios/                  # iOS native project
│
└── capacitor.config.json # Capacitor configuration
```

### Mobile Entry Point Flow

1. **App opens** → `www/index.html` (home screen)
2. **User taps "Start"** → Checks if logged in
   - ✅ Logged in → `village.html` (main game)
   - ❌ Not logged in → `login.html`
3. **After login** → `village.html`

### Development Commands

```bash
# Web development (no changes needed)
npm run dev:frontend      # Start web server on localhost:8080
npm run dev:backend       # Start Express API server on localhost:3000
npm run dev:all           # Run both concurrently

# Mobile development
npm run build:mobile      # Build and sync to native projects
npm run open:android      # Open Android Studio
npm run open:ios          # Open Xcode
npm run mobile:sync       # Sync changes (after editing capacitor.config.json)
```

### Making Changes

**For web-only changes:**
1. Edit files in root directory (index.html, js/, css/, etc.)
2. Test with `npm run dev:frontend`
3. No mobile rebuild needed

**For mobile changes:**
1. Edit files in root directory
2. Run `npm run build:mobile` to sync changes
3. Rebuild in Android Studio/Xcode

**Note:** The `www/` directory is auto-generated. Never edit files in `www/` directly - they will be overwritten!

---

## Building for Production

### Android APK/AAB

1. **Build the web assets:**
   ```bash
   npm run build:mobile
   ```

2. **Open Android Studio:**
   ```bash
   npm run open:android
   ```

3. **Generate signed APK/AAB:**
   - Go to **Build → Generate Signed Bundle / APK**
   - Follow the wizard to create a keystore (first time only)
   - Select **Android App Bundle (AAB)** for Google Play
   - Or select **APK** for direct installation

4. **Find output:**
   - AAB: `android/app/build/outputs/bundle/release/app-release.aab`
   - APK: `android/app/build/outputs/apk/release/app-release.apk`

### iOS IPA

1. **Build the web assets:**
   ```bash
   npm run build:mobile
   ```

2. **Open Xcode:**
   ```bash
   npm run open:ios
   ```

3. **Configure signing:**
   - Select target "App"
   - Go to **Signing & Capabilities**
   - Select your Team (Apple Developer account required)

4. **Archive:**
   - Select **Any iOS Device** or your connected device
   - Go to **Product → Archive**
   - Once complete, **Distribute App**
   - Follow wizard to export IPA or upload to App Store

### App Store Submission

You'll handle this manually:
1. Create app listing on [App Store Connect](https://appstoreconnect.apple.com)
2. Upload IPA via Xcode Organizer or Transporter app
3. Submit for review

### Google Play Submission

You'll handle this manually:
1. Create app listing on [Google Play Console](https://play.google.com/console)
2. Upload AAB to production/beta/alpha track
3. Submit for review

---

## Architecture

### Platform Detection

The `platform-detector.js` automatically detects the environment:

```javascript
// Available globally as window.Platform
window.Platform.isMobile    // true if running in Capacitor
window.Platform.isWeb       // true if running in browser
window.Platform.isAndroid   // true if Android
window.Platform.isIOS       // true if iOS
```

### API URL Configuration

API calls automatically route to the correct backend:

```javascript
// Automatically configured in platform-detector.js
window.Platform.getApiUrl('/api/characters')
// Web: http://localhost:3000/api/characters
// Mobile: https://your-production-api.herokuapp.com/api/characters
```

**TODO:** Update `js/platform-detector.js` line 17 with your production API URL!

### Mobile Features

**Implemented in `mobile-init.js`:**
- Status bar hidden for fullscreen
- Landscape orientation lock
- Android back button handling
- App state change handling (background/foreground)

**Implemented in `home-screen.js`:**
- Haptic feedback on button press
- Splash screen auto-hide
- Asset download with progress

---

## Asset Management

### First Launch Download Flow

1. **App opens** → Home screen shows
2. **AssetManager checks** if assets are downloaded
3. **If first launch:**
   - Shows download progress bar
   - Downloads essential assets (~10MB)
   - User can start playing
   - Remaining assets download in background
4. **Subsequent launches:**
   - Skips download (assets cached)
   - User can start immediately

### Asset Download Configuration

Edit `js/asset-download-manager.js` to configure asset packs:

```javascript
this.assetPacks = {
  essential: {
    name: 'Essential Assets',
    priority: 1,
    size: 10, // MB estimate
    files: [
      'assets/ui/buttons.png',
      // Add critical assets here
    ]
  },
  // Add more packs...
}
```

### Current Implementation

Currently, asset downloads are **simulated** (mock progress). Assets are bundled in the APK/IPA.

**For production with CDN downloads:**
1. Upload assets to CDN (Cloudflare, AWS S3, etc.)
2. Implement actual download logic in `downloadFile()` method
3. Use Capacitor Filesystem to cache downloaded files

---

## Troubleshooting

### Common Issues

**"Could not find the android platform"**
```bash
npm install @capacitor/android @capacitor/ios --save
```

**Web version still works after mobile setup?**
Yes! The web version (root directory) is unchanged. Mobile uses `www/` which is separate.

**Changes not showing in mobile app?**
```bash
npm run build:mobile    # Rebuild and sync
# Then rebuild in Android Studio/Xcode
```

**"java.lang.RuntimeException" on Android**
- Update Android SDK in Android Studio
- Set Java version to 11 or higher
- Clean project: **Build → Clean Project**

**iOS build fails with signing errors**
- Add Apple Developer account in Xcode → Preferences → Accounts
- Select correct Team in target settings
- Ensure Bundle ID is unique (`com.blazing.naruto`)

**Landscape not locking on device**
Some Android devices block orientation locking. This is normal - the game still works in portrait with black bars.

**App crashes on startup**
- Check browser console in Chrome DevTools (Android) or Safari Inspector (iOS)
- Common cause: JavaScript errors in platform-detector.js or home-screen.js

### Testing Mobile Features Locally

You can test mobile features in web browser:

```javascript
// Simulate mobile mode in browser console
window.Capacitor = {
  isNativePlatform: () => true,
  getPlatform: () => 'android'
};
```

### Debugging

**Android:**
1. Connect device via USB
2. Enable **USB Debugging** on device
3. Open `chrome://inspect` in Chrome
4. Select your device → Inspect

**iOS:**
1. Connect device via cable
2. Enable **Web Inspector** on device (Settings → Safari → Advanced)
3. Open Safari → Develop → [Your Device] → App
4. Use Safari Inspector

---

## Configuration Files

### `capacitor.config.json`

Main Capacitor configuration:

```json
{
  "appId": "com.blazing.naruto",
  "appName": "Naruto Blazing",
  "webDir": "www",
  "server": {
    "androidScheme": "https"
  },
  "plugins": {
    "SplashScreen": {
      "launchAutoHide": false,
      "backgroundColor": "#000000"
    },
    "StatusBar": {
      "style": "DARK",
      "backgroundColor": "#000000"
    }
  }
}
```

### `package.json` Scripts

```json
{
  "scripts": {
    "build:mobile": "bash scripts/build-mobile.sh",
    "open:android": "npx cap open android",
    "open:ios": "npx cap open ios",
    "mobile:sync": "npx cap sync"
  }
}
```

---

## Next Steps

1. **Test on emulator:**
   - Run `npm run build:mobile`
   - Open Android Studio or Xcode
   - Run on emulator

2. **Update API URL:**
   - Deploy your Express backend to production
   - Update `js/platform-detector.js` line 17

3. **Add app icons and splash screens:**
   - Android: `android/app/src/main/res/`
   - iOS: Xcode → Assets.xcassets

4. **Customize app name/ID:**
   - Edit `capacitor.config.json`
   - Update Android: `android/app/src/main/AndroidManifest.xml`
   - Update iOS: Xcode → General → Bundle Identifier

5. **Build for production:**
   - Follow steps in [Building for Production](#building-for-production)

---

## Support

For Capacitor issues, see:
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Capacitor GitHub](https://github.com/ionic-team/capacitor)

For game-specific issues:
- Check code comments in `js/` directory
- Review browser console for errors

---

**Happy mobile development! 🚀**
