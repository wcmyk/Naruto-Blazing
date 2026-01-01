// js/page-visibility-manager.js - HTML5 Page Visibility API Manager
(() => {
  "use strict";

  /**
   * PageVisibilityManager - Handles tab visibility changes
   * Uses HTML5 Page Visibility API to pause/resume game when user switches tabs
   *
   * Benefits:
   * - Saves battery on mobile devices
   * - Prevents unfair auto-battle when tabbed out
   * - Pauses music/animations when tab is hidden
   * - Auto-resumes when user returns
   */
  const PageVisibilityManager = {
    initialized: false,
    wasPlaying: false,
    pausedSystems: [],

    /**
     * Initialize the Page Visibility API
     */
    init() {
      if (this.initialized) return;

      if (typeof document.hidden === "undefined") {
        console.warn('[PageVisibility] API not supported in this browser');
        return;
      }

      document.addEventListener('visibilitychange', () => this.handleVisibilityChange());

      this.initialized = true;
      console.log('[PageVisibility] ✅ Page Visibility Manager initialized');
    },

    /**
     * Handle visibility state changes
     */
    handleVisibilityChange() {
      if (document.hidden) {
        console.log('[PageVisibility] Tab hidden - pausing systems');
        this.onHidden();
      } else {
        console.log('[PageVisibility] Tab visible - resuming systems');
        this.onVisible();
      }
    },

    /**
     * Called when tab becomes hidden
     */
    onHidden() {
      this.pausedSystems = [];

      // Pause Audio Manager
      if (window.AudioManager) {
        try {
          if (window.AudioManager.musicPlaying) {
            this.wasPlaying = true;
            window.AudioManager.pauseMusic?.();
            this.pausedSystems.push('AudioManager');
            console.log('[PageVisibility] Paused audio');
          }
        } catch (e) {
          console.warn('[PageVisibility] Error pausing audio:', e);
        }
      }

      // Pause Battle Manager
      if (window.BattleManager) {
        try {
          if (!window.BattleManager.paused && window.BattleManager.pause) {
            window.BattleManager.pause();
            this.pausedSystems.push('BattleManager');
            console.log('[PageVisibility] Paused battle');
          }
        } catch (e) {
          console.warn('[PageVisibility] Error pausing battle:', e);
        }
      }

      // Pause Canvas Particle Engine
      if (window.CanvasParticleEngine) {
        try {
          if (window.CanvasParticleEngine.running) {
            window.CanvasParticleEngine.stop();
            this.pausedSystems.push('CanvasParticleEngine');
            console.log('[PageVisibility] Paused particles');
          }
        } catch (e) {
          console.warn('[PageVisibility] Error pausing particles:', e);
        }
      }

      // Pause Character Vignette animations
      if (window.CharacterVignette) {
        try {
          if (window.CharacterVignette.stopAnimations) {
            window.CharacterVignette.stopAnimations();
            this.pausedSystems.push('CharacterVignette');
            console.log('[PageVisibility] Paused vignette animations');
          }
        } catch (e) {
          console.warn('[PageVisibility] Error pausing vignette:', e);
        }
      }

      // Pause Announcement Slideshow
      if (window.AnnouncementSlideshow) {
        try {
          if (window.AnnouncementSlideshow.pause) {
            window.AnnouncementSlideshow.pause();
            this.pausedSystems.push('AnnouncementSlideshow');
            console.log('[PageVisibility] Paused announcements');
          }
        } catch (e) {
          console.warn('[PageVisibility] Error pausing announcements:', e);
        }
      }

      // Pause AnimationFrameManager
      if (window.AnimationFrameManager) {
        try {
          if (window.AnimationFrameManager.running) {
            window.AnimationFrameManager.pause();
            this.pausedSystems.push('AnimationFrameManager');
            console.log('[PageVisibility] Paused AnimationFrameManager');
          }
        } catch (e) {
          console.warn('[PageVisibility] Error pausing AnimationFrameManager:', e);
        }
      }

      console.log(`[PageVisibility] Paused ${this.pausedSystems.length} systems`);
    },

    /**
     * Called when tab becomes visible
     */
    onVisible() {
      // Resume Audio Manager
      if (this.pausedSystems.includes('AudioManager') && window.AudioManager) {
        try {
          if (this.wasPlaying && window.AudioManager.resumeMusic) {
            window.AudioManager.resumeMusic();
            console.log('[PageVisibility] Resumed audio');
          }
          this.wasPlaying = false;
        } catch (e) {
          console.warn('[PageVisibility] Error resuming audio:', e);
        }
      }

      // Resume Battle Manager
      if (this.pausedSystems.includes('BattleManager') && window.BattleManager) {
        try {
          if (window.BattleManager.resume) {
            window.BattleManager.resume();
            console.log('[PageVisibility] Resumed battle');
          }
        } catch (e) {
          console.warn('[PageVisibility] Error resuming battle:', e);
        }
      }

      // Resume Canvas Particle Engine
      if (this.pausedSystems.includes('CanvasParticleEngine') && window.CanvasParticleEngine) {
        try {
          window.CanvasParticleEngine.start();
          console.log('[PageVisibility] Resumed particles');
        } catch (e) {
          console.warn('[PageVisibility] Error resuming particles:', e);
        }
      }

      // Resume Character Vignette animations
      if (this.pausedSystems.includes('CharacterVignette') && window.CharacterVignette) {
        try {
          if (window.CharacterVignette.startAnimations) {
            window.CharacterVignette.startAnimations();
            console.log('[PageVisibility] Resumed vignette animations');
          }
        } catch (e) {
          console.warn('[PageVisibility] Error resuming vignette:', e);
        }
      }

      // Resume Announcement Slideshow
      if (this.pausedSystems.includes('AnnouncementSlideshow') && window.AnnouncementSlideshow) {
        try {
          if (window.AnnouncementSlideshow.resume) {
            window.AnnouncementSlideshow.resume();
            console.log('[PageVisibility] Resumed announcements');
          }
        } catch (e) {
          console.warn('[PageVisibility] Error resuming announcements:', e);
        }
      }

      // Resume AnimationFrameManager
      if (this.pausedSystems.includes('AnimationFrameManager') && window.AnimationFrameManager) {
        try {
          window.AnimationFrameManager.resume();
          console.log('[PageVisibility] Resumed AnimationFrameManager');
        } catch (e) {
          console.warn('[PageVisibility] Error resuming AnimationFrameManager:', e);
        }
      }

      console.log(`[PageVisibility] Resumed ${this.pausedSystems.length} systems`);
      this.pausedSystems = [];
    },

    /**
     * Check if tab is currently visible
     */
    isVisible() {
      return !document.hidden;
    },

    /**
     * Register a custom callback for visibility changes
     */
    onVisibilityChange(callback) {
      if (typeof callback !== 'function') {
        console.warn('[PageVisibility] Callback must be a function');
        return;
      }

      document.addEventListener('visibilitychange', () => {
        callback(!document.hidden);
      });
    }
  };

  // Auto-initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PageVisibilityManager.init());
  } else {
    PageVisibilityManager.init();
  }

  // Expose globally
  window.PageVisibilityManager = PageVisibilityManager;
})();
