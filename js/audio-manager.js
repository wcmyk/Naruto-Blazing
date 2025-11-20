// js/audio-manager.js
// Background Music and Sound Effects Manager

(function (global) {
  "use strict";

  const AudioManager = {
    bgm: null,
    bgmVolume: 0.3,
    sfxVolume: 0.5,
    isMuted: false,
    currentBgmTrack: null,

    // Initialize audio system
    init() {
      console.log("[AudioManager] Initializing audio system...");

      // Check if user has interacted with page (required for autoplay)
      document.addEventListener('click', () => {
        if (!this.bgm) {
          this.playDefaultBGM();
        }
      }, { once: true });

      // Load saved volume settings
      this.loadSettings();
    },

    // Play background music
    playBGM(track) {
      // Silently fail if no audio files exist yet
      if (!track) {
        console.log("[AudioManager] No BGM track specified - audio system ready but no music playing");
        return;
      }

      try {
        // Stop current BGM if playing
        if (this.bgm) {
          this.bgm.pause();
          this.bgm.currentTime = 0;
        }

        // Create new audio element
        this.bgm = new Audio(track);
        this.bgm.volume = this.isMuted ? 0 : this.bgmVolume;
        this.bgm.loop = true;
        this.currentBgmTrack = track;

        // Play with error handling
        const playPromise = this.bgm.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("[AudioManager] BGM playing:", track);
            })
            .catch(error => {
              console.log("[AudioManager] BGM autoplay blocked - will play on user interaction");
            });
        }
      } catch (error) {
        console.log("[AudioManager] BGM file not found - continuing without music");
      }
    },

    // Play default background music
    playDefaultBGM() {
      this.playBGM('assets/music/general.mp3');
    },

    // Stop background music
    stopBGM() {
      if (this.bgm) {
        this.bgm.pause();
        this.bgm.currentTime = 0;
        console.log("[AudioManager] BGM stopped");
      }
    },

    // Pause background music
    pauseBGM() {
      if (this.bgm) {
        this.bgm.pause();
        console.log("[AudioManager] BGM paused");
      }
    },

    // Resume background music
    resumeBGM() {
      if (this.bgm && this.bgm.paused) {
        this.bgm.play().catch(() => {
          console.log("[AudioManager] Could not resume BGM");
        });
      }
    },

    // Play sound effect
    playSFX(sound) {
      if (this.isMuted) return;

      try {
        const sfx = new Audio(sound);
        sfx.volume = this.sfxVolume;
        sfx.play().catch(() => {
          // Silently fail if sound doesn't exist
        });
      } catch (error) {
        // Silently fail if sound doesn't exist
      }
    },

    // Set BGM volume (0.0 - 1.0)
    setBGMVolume(volume) {
      this.bgmVolume = Math.max(0, Math.min(1, volume));
      if (this.bgm) {
        this.bgm.volume = this.isMuted ? 0 : this.bgmVolume;
      }
      this.saveSettings();
      console.log("[AudioManager] BGM volume set to:", this.bgmVolume);
    },

    // Set SFX volume (0.0 - 1.0)
    setSFXVolume(volume) {
      this.sfxVolume = Math.max(0, Math.min(1, volume));
      this.saveSettings();
      console.log("[AudioManager] SFX volume set to:", this.sfxVolume);
    },

    // Toggle mute
    toggleMute() {
      this.isMuted = !this.isMuted;
      if (this.bgm) {
        this.bgm.volume = this.isMuted ? 0 : this.bgmVolume;
      }
      this.saveSettings();
      console.log("[AudioManager] Mute:", this.isMuted);
      return this.isMuted;
    },

    // Save settings to localStorage
    saveSettings() {
      try {
        localStorage.setItem('audio_settings', JSON.stringify({
          bgmVolume: this.bgmVolume,
          sfxVolume: this.sfxVolume,
          isMuted: this.isMuted
        }));
      } catch (error) {
        console.log("[AudioManager] Could not save settings");
      }
    },

    // Load settings from localStorage
    loadSettings() {
      try {
        const saved = localStorage.getItem('audio_settings');
        if (saved) {
          const settings = JSON.parse(saved);
          this.bgmVolume = settings.bgmVolume || 0.3;
          this.sfxVolume = settings.sfxVolume || 0.5;
          this.isMuted = settings.isMuted || false;
          console.log("[AudioManager] Settings loaded");
        }
      } catch (error) {
        console.log("[AudioManager] Could not load settings - using defaults");
      }
    }
  };

  // Auto-initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AudioManager.init());
  } else {
    AudioManager.init();
  }

  // Expose to global scope
  global.AudioManager = AudioManager;

  console.log("[AudioManager] Module loaded");

})(window);
