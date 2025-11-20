# Music Assets

## Required File

Place your music file here:

- **`general.mp3`** - Main background music for the game

## Current Configuration

The audio manager is configured to play `assets/music/general.mp3` automatically on first user interaction.

## How to Add Your Music

1. Place your `general.mp3` file in this directory: `assets/music/general.mp3`
2. Refresh the page
3. Click anywhere on the page to trigger autoplay
4. Music will start playing automatically!

## Audio Settings

- **Default Volume**: 30% (0.3)
- **Loop**: Yes (music repeats continuously)
- **Autoplay**: Triggered on first user click (browser requirement)

## Supported Formats

- MP3 (recommended)
- OGG
- WAV

## File Size Recommendations

- Keep file under 10MB for faster loading
- Compress to 128-192 kbps for best quality/size balance

## Audio Manager Controls

Once the music is playing, you can control it with:

```javascript
// Adjust volume (0.0 to 1.0)
AudioManager.setBGMVolume(0.5);

// Pause music
AudioManager.pauseBGM();

// Resume music
AudioManager.resumeBGM();

// Stop music
AudioManager.stopBGM();

// Mute/unmute
AudioManager.toggleMute();
```

## Status

Waiting for `general.mp3` to be added to this directory.

Once you add the file, the music will automatically play when the page loads!
