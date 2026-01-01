// js/animation-frame-manager.js - HTML5 RequestAnimationFrame Manager
(() => {
  "use strict";

  /**
   * AnimationFrameManager - Centralized requestAnimationFrame handler
   * Uses HTML5 requestAnimationFrame API for smooth, battery-efficient animations
   *
   * Benefits:
   * - 60 FPS synced with browser refresh rate
   * - Automatically pauses when tab is hidden (battery savings)
   * - Centralized control over all animations
   * - Better performance than setTimeout/setInterval
   */
  const AnimationFrameManager = {
    animations: new Map(),
    animationId: null,
    running: false,
    lastTime: 0,
    deltaTime: 0,
    fps: 60,
    frameCount: 0,

    /**
     * Initialize the animation manager
     */
    init() {
      console.log('[AnimationFrame] Manager initialized');
      this.start();
    },

    /**
     * Register an animation callback
     * @param {string} name - Unique name for this animation
     * @param {function} callback - Function to call each frame (receives deltaTime)
     * @param {number} priority - Lower numbers run first (default: 100)
     */
    register(name, callback, priority = 100) {
      if (typeof callback !== 'function') {
        console.warn('[AnimationFrame] Callback must be a function');
        return;
      }

      this.animations.set(name, {
        callback,
        priority,
        enabled: true
      });

      console.log(`[AnimationFrame] Registered "${name}" (priority: ${priority})`);

      // Start the loop if not running
      if (!this.running) {
        this.start();
      }
    },

    /**
     * Unregister an animation
     * @param {string} name - Name of animation to remove
     */
    unregister(name) {
      if (this.animations.has(name)) {
        this.animations.delete(name);
        console.log(`[AnimationFrame] Unregistered "${name}"`);

        // Stop loop if no animations
        if (this.animations.size === 0) {
          this.stop();
        }
      }
    },

    /**
     * Enable/disable a specific animation without unregistering
     * @param {string} name - Animation name
     * @param {boolean} enabled - Enable or disable
     */
    setEnabled(name, enabled) {
      const anim = this.animations.get(name);
      if (anim) {
        anim.enabled = enabled;
        console.log(`[AnimationFrame] "${name}" ${enabled ? 'enabled' : 'disabled'}`);
      }
    },

    /**
     * Start the animation loop
     */
    start() {
      if (this.running) return;

      this.running = true;
      this.lastTime = performance.now();
      this.animate();
      console.log('[AnimationFrame] Loop started');
    },

    /**
     * Stop the animation loop
     */
    stop() {
      if (!this.running) return;

      this.running = false;
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
      console.log('[AnimationFrame] Loop stopped');
    },

    /**
     * Main animation loop using requestAnimationFrame
     */
    animate(currentTime = performance.now()) {
      if (!this.running) return;

      // Calculate delta time in seconds
      this.deltaTime = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;

      // Calculate FPS (for debugging)
      this.frameCount++;
      if (this.frameCount % 60 === 0) {
        this.fps = Math.round(1 / this.deltaTime);
      }

      // Run all enabled animations sorted by priority
      const sortedAnimations = Array.from(this.animations.entries())
        .filter(([_, anim]) => anim.enabled)
        .sort((a, b) => a[1].priority - b[1].priority);

      for (const [name, anim] of sortedAnimations) {
        try {
          anim.callback(this.deltaTime, currentTime);
        } catch (error) {
          console.error(`[AnimationFrame] Error in "${name}":`, error);
        }
      }

      // Request next frame
      this.animationId = requestAnimationFrame((time) => this.animate(time));
    },

    /**
     * Pause all animations
     */
    pause() {
      this.stop();
      console.log('[AnimationFrame] All animations paused');
    },

    /**
     * Resume all animations
     */
    resume() {
      this.start();
      console.log('[AnimationFrame] All animations resumed');
    },

    /**
     * Get current FPS
     */
    getFPS() {
      return this.fps;
    },

    /**
     * Get list of registered animations
     */
    getAnimations() {
      return Array.from(this.animations.keys());
    },

    /**
     * Clear all animations
     */
    clear() {
      this.animations.clear();
      this.stop();
      console.log('[AnimationFrame] All animations cleared');
    }
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AnimationFrameManager.init());
  } else {
    AnimationFrameManager.init();
  }

  // Integrate with Page Visibility API
  if (document.addEventListener) {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        AnimationFrameManager.pause();
      } else {
        AnimationFrameManager.resume();
      }
    });
  }

  // Expose globally
  window.AnimationFrameManager = AnimationFrameManager;
})();
