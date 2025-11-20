// js/audio-manager.js
// Global Audio Management System
// Handles background music, sound effects, and volume controls

(function (global) {
  "use strict";

  const STORAGE_KEY = "blazing_audio_settings_v1";

  // Default audio settings
  const DEFAULT_SETTINGS = {
    masterVolume: 0.7,
    bgmVolume: 0.8,
    sfxVolume: 0.6,
    masterMuted: false,
    bgmMuted: false,
    sfxMuted: false
  };

  class AudioManager {
    constructor() {
      this.settings = this.load();
      this.currentBGM = null;
      this.activeSFX = new Set();

      console.log("🎵 AudioManager initialized");
    }

    /**
     * Load audio settings from localStorage
     */
    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          console.log("🎵 No audio settings found. Using defaults...");
          return { ...DEFAULT_SETTINGS };
        }
        const parsed = JSON.parse(raw);
        console.log("✅ Audio settings loaded");
        return { ...DEFAULT_SETTINGS, ...parsed };
      } catch (err) {
        console.error("❌ Error loading audio settings:", err);
        return { ...DEFAULT_SETTINGS };
      }
    }

    /**
     * Save audio settings to localStorage
     */
    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
        console.log("💾 Audio settings saved");

        // Dispatch event for UI updates
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("audioSettingsChanged", {
            detail: { settings: this.settings }
          }));
        }

        return true;
      } catch (err) {
        console.error("❌ Error saving audio settings:", err);
        return false;
      }
    }

    /**
     * Calculate effective volume considering mute states
     */
    getEffectiveVolume(type) {
      if (this.settings.masterMuted) return 0;

      const masterVol = this.settings.masterVolume;

      if (type === "bgm") {
        return this.settings.bgmMuted ? 0 : masterVol * this.settings.bgmVolume;
      } else if (type === "sfx") {
        return this.settings.sfxMuted ? 0 : masterVol * this.settings.sfxVolume;
      }

      return masterVol;
    }

    /**
     * Set master volume (0.0 - 1.0)
     */
    setMasterVolume(volume) {
      const vol = Math.max(0, Math.min(1, parseFloat(volume)));
      this.settings.masterVolume = vol;
      this.save();
      this.updateAllVolumes();
      console.log(`🔊 Master volume set to ${Math.round(vol * 100)}%`);
    }

    /**
     * Set BGM volume (0.0 - 1.0)
     */
    setBGMVolume(volume) {
      const vol = Math.max(0, Math.min(1, parseFloat(volume)));
      this.settings.bgmVolume = vol;
      this.save();
      this.updateBGMVolume();
      console.log(`🎵 BGM volume set to ${Math.round(vol * 100)}%`);
    }

    /**
     * Set SFX volume (0.0 - 1.0)
     */
    setSFXVolume(volume) {
      const vol = Math.max(0, Math.min(1, parseFloat(volume)));
      this.settings.sfxVolume = vol;
      this.save();
      console.log(`🔔 SFX volume set to ${Math.round(vol * 100)}%`);
    }

    /**
     * Toggle master mute
     */
    toggleMasterMute() {
      this.settings.masterMuted = !this.settings.masterMuted;
      this.save();
      this.updateAllVolumes();
      console.log(`🔇 Master mute: ${this.settings.masterMuted ? "ON" : "OFF"}`);
      return this.settings.masterMuted;
    }

    /**
     * Toggle BGM mute
     */
    toggleBGMMute() {
      this.settings.bgmMuted = !this.settings.bgmMuted;
      this.save();
      this.updateBGMVolume();
      console.log(`🔇 BGM mute: ${this.settings.bgmMuted ? "ON" : "OFF"}`);
      return this.settings.bgmMuted;
    }

    /**
     * Toggle SFX mute
     */
    toggleSFXMute() {
      this.settings.sfxMuted = !this.settings.sfxMuted;
      this.save();
      console.log(`🔇 SFX mute: ${this.settings.sfxMuted ? "ON" : "OFF"}`);
      return this.settings.sfxMuted;
    }

    /**
     * Update all active audio volumes
     */
    updateAllVolumes() {
      this.updateBGMVolume();
      // SFX are typically one-shot, so we don't update them
    }

    /**
     * Update BGM volume
     */
    updateBGMVolume() {
      if (this.currentBGM) {
        this.currentBGM.volume = this.getEffectiveVolume("bgm");
      }
    }

    /**
     * Play background music
     */
    playBGM(src, options = {}) {
      if (!src) {
        console.warn("⚠️ No BGM source provided");
        return null;
      }

      this.stopBGM();

      try {
        const audio = new Audio(src);
        audio.loop = options.loop !== false; // Default true
        audio.volume = this.getEffectiveVolume("bgm");

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log(`🎵 Playing BGM: ${src}`);
            })
            .catch((err) => {
              console.warn(`⚠️ BGM autoplay blocked: ${err.message}`);
            });
        }

        this.currentBGM = audio;
        return audio;
      } catch (err) {
        console.error("❌ Error playing BGM:", err);
        return null;
      }
    }

    /**
     * Stop background music
     */
    stopBGM() {
      if (this.currentBGM) {
        this.currentBGM.pause();
        this.currentBGM.currentTime = 0;
        this.currentBGM = null;
        console.log("⏹️ BGM stopped");
      }
    }

    /**
     * Pause background music
     */
    pauseBGM() {
      if (this.currentBGM) {
        this.currentBGM.pause();
        console.log("⏸️ BGM paused");
      }
    }

    /**
     * Resume background music
     */
    resumeBGM() {
      if (this.currentBGM) {
        this.currentBGM.play().catch((err) => {
          console.warn("⚠️ Failed to resume BGM:", err);
        });
        console.log("▶️ BGM resumed");
      }
    }

    /**
     * Play sound effect
     */
    playSFX(src, options = {}) {
      if (!src) {
        console.warn("⚠️ No SFX source provided");
        return null;
      }

      try {
        const audio = new Audio(src);
        audio.volume = this.getEffectiveVolume("sfx");
        audio.loop = options.loop || false;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log(`🔔 Playing SFX: ${src}`);
            })
            .catch((err) => {
              console.warn(`⚠️ SFX playback failed: ${err.message}`);
            });
        }

        this.activeSFX.add(audio);

        // Auto-cleanup when finished
        audio.addEventListener("ended", () => {
          this.activeSFX.delete(audio);
        });

        return audio;
      } catch (err) {
        console.error("❌ Error playing SFX:", err);
        return null;
      }
    }

    /**
     * Stop all sound effects
     */
    stopAllSFX() {
      this.activeSFX.forEach((sfx) => {
        sfx.pause();
        sfx.currentTime = 0;
      });
      this.activeSFX.clear();
      console.log("⏹️ All SFX stopped");
    }

    /**
     * Get current settings
     */
    getSettings() {
      return { ...this.settings };
    }

    /**
     * Get volume as percentage string
     */
    getVolumePercent(type) {
      let volume;
      switch (type) {
        case "master":
          volume = this.settings.masterVolume;
          break;
        case "bgm":
          volume = this.settings.bgmVolume;
          break;
        case "sfx":
          volume = this.settings.sfxVolume;
          break;
        default:
          volume = 0;
      }
      return Math.round(volume * 100);
    }

    /**
     * Reset to default settings
     */
    reset() {
      this.stopBGM();
      this.stopAllSFX();
      this.settings = { ...DEFAULT_SETTINGS };
      this.save();
      console.log("🔄 Audio settings reset to defaults");
    }
  }

  // Create singleton instance
  const audioManager = new AudioManager();

  // Export to global scope
  global.AudioManager = audioManager;

  console.log("✅ AudioManager system initialized");

})(window);
