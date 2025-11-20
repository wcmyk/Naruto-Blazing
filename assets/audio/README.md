# Audio Assets

This directory contains background music (BGM) and sound effects (SFX) for the game.

## Directory Structure

```
assets/audio/
├── bgm/          # Background music tracks
│   ├── menu_theme.mp3
│   ├── battle_theme.mp3
│   ├── summon_theme.mp3
│   └── victory_theme.mp3
└── sfx/          # Sound effects
    ├── button_click.mp3
    ├── summon_pull.mp3
    ├── character_unlock.mp3
    └── level_up.mp3
```

## How to Add Music

The audio system is already implemented and ready to use. To enable music:

1. **Add BGM files** to `assets/audio/bgm/`
   - Recommended format: MP3 or OGG
   - File size: Keep under 5MB for faster loading
   - Example names: `menu_theme.mp3`, `battle_theme.mp3`

2. **Add SFX files** to `assets/audio/sfx/`
   - Recommended format: MP3, WAV, or OGG
   - File size: Keep under 500KB
   - Example names: `button_click.mp3`, `summon_pull.mp3`

3. **Enable BGM in code** by editing `js/audio-manager.js`:
   ```javascript
   playDefaultBGM() {
     this.playBGM('assets/audio/bgm/menu_theme.mp3');
   }
   ```

4. **Play SFX in your code**:
   ```javascript
   AudioManager.playSFX('assets/audio/sfx/button_click.mp3');
   ```

## Audio Manager API

The `AudioManager` global object provides these methods:

### Background Music (BGM)
- `AudioManager.playBGM(track)` - Play a background music track
- `AudioManager.stopBGM()` - Stop current BGM
- `AudioManager.pauseBGM()` - Pause current BGM
- `AudioManager.resumeBGM()` - Resume paused BGM
- `AudioManager.setBGMVolume(0.0 - 1.0)` - Set BGM volume (default: 0.3)

### Sound Effects (SFX)
- `AudioManager.playSFX(sound)` - Play a sound effect
- `AudioManager.setSFXVolume(0.0 - 1.0)` - Set SFX volume (default: 0.5)

### General
- `AudioManager.toggleMute()` - Toggle mute on/off
- `AudioManager.isMuted` - Check if audio is muted

## Current Status

Audio system is **ready** but no audio files have been added yet.

The system will:
- Work silently without errors if no audio files exist
- Automatically play BGM on first user interaction
- Save volume settings to localStorage
- Handle browser autoplay restrictions gracefully

## Recommended Music Sources

For royalty-free music:
- **OpenGameArt.org** - Free game music and sounds
- **Freesound.org** - Creative Commons sound effects
- **Incompetech.com** - Royalty-free music by Kevin MacLeod
- **Purple Planet Music** - Free background music

## Notes

- Audio autoplay is blocked by browsers until user interaction
- The system automatically plays BGM on first click
- Volume settings persist across page reloads
- All audio loading failures are handled gracefully
