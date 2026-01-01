// js/animation-timer.js - RequestAnimationFrame-based Timer Utilities
(() => {
  "use strict";

  /**
   * AnimationTimer - Drop-in replacements for setTimeout/setInterval using requestAnimationFrame
   * More battery-efficient and syncs with browser refresh rate
   *
   * Usage:
   *   Instead of: setTimeout(fn, 1000)
   *   Use: AnimationTimer.setTimeout(fn, 1000)
   *
   *   Instead of: setInterval(fn, 100)
   *   Use: AnimationTimer.setInterval(fn, 100)
   */
  const AnimationTimer = {
    timers: new Map(),
    nextId: 1,

    /**
     * RequestAnimationFrame-based setTimeout replacement
     * @param {function} callback - Function to execute
     * @param {number} delay - Delay in milliseconds
     * @returns {number} Timer ID for cancellation
     */
    setTimeout(callback, delay = 0) {
      const id = this.nextId++;
      const startTime = performance.now();

      const check = (currentTime) => {
        if (!this.timers.has(id)) return; // Cleared

        const elapsed = currentTime - startTime;
        if (elapsed >= delay) {
          // Time's up, execute callback
          callback();
          this.timers.delete(id);
        } else {
          // Keep checking
          this.timers.set(id, requestAnimationFrame(check));
        }
      };

      this.timers.set(id, requestAnimationFrame(check));
      return id;
    },

    /**
     * RequestAnimationFrame-based setInterval replacement
     * @param {function} callback - Function to execute repeatedly
     * @param {number} interval - Interval in milliseconds
     * @returns {number} Timer ID for cancellation
     */
    setInterval(callback, interval = 0) {
      const id = this.nextId++;
      let lastTime = performance.now();

      const check = (currentTime) => {
        if (!this.timers.has(id)) return; // Cleared

        const elapsed = currentTime - lastTime;
        if (elapsed >= interval) {
          // Interval elapsed, execute callback
          callback();
          lastTime = currentTime;
        }

        // Keep looping
        this.timers.set(id, requestAnimationFrame(check));
      };

      this.timers.set(id, requestAnimationFrame(check));
      return id;
    },

    /**
     * Clear a timer (works for both setTimeout and setInterval)
     * @param {number} id - Timer ID to clear
     */
    clearTimer(id) {
      if (this.timers.has(id)) {
        const rafId = this.timers.get(id);
        cancelAnimationFrame(rafId);
        this.timers.delete(id);
      }
    },

    /**
     * Alias for clearTimer (matches native clearTimeout)
     */
    clearTimeout(id) {
      this.clearTimer(id);
    },

    /**
     * Alias for clearTimer (matches native clearInterval)
     */
    clearInterval(id) {
      this.clearTimer(id);
    },

    /**
     * Clear all active timers
     */
    clearAll() {
      for (const [id, rafId] of this.timers.entries()) {
        cancelAnimationFrame(rafId);
      }
      this.timers.clear();
      console.log('[AnimationTimer] All timers cleared');
    },

    /**
     * Get count of active timers
     */
    getActiveCount() {
      return this.timers.size;
    },

    /**
     * RequestAnimationFrame-based debounce
     * @param {function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {function} Debounced function
     */
    debounce(func, wait = 0) {
      let timerId = null;

      return function(...args) {
        if (timerId !== null) {
          AnimationTimer.clearTimer(timerId);
        }

        timerId = AnimationTimer.setTimeout(() => {
          func.apply(this, args);
          timerId = null;
        }, wait);
      };
    },

    /**
     * RequestAnimationFrame-based throttle
     * @param {function} func - Function to throttle
     * @param {number} limit - Minimum time between calls in milliseconds
     * @returns {function} Throttled function
     */
    throttle(func, limit = 0) {
      let lastRan = 0;
      let timerId = null;

      return function(...args) {
        const now = performance.now();

        if (now - lastRan >= limit) {
          func.apply(this, args);
          lastRan = now;
        } else {
          if (timerId !== null) {
            AnimationTimer.clearTimer(timerId);
          }

          timerId = AnimationTimer.setTimeout(() => {
            func.apply(this, args);
            lastRan = performance.now();
            timerId = null;
          }, limit - (now - lastRan));
        }
      };
    }
  };

  // Pause/resume timers when tab visibility changes
  if (document.addEventListener) {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Timers automatically pause with requestAnimationFrame
        console.log('[AnimationTimer] Timers paused (tab hidden)');
      } else {
        console.log('[AnimationTimer] Timers resumed (tab visible)');
      }
    });
  }

  // Expose globally
  window.AnimationTimer = AnimationTimer;

  console.log('[AnimationTimer] ✅ RequestAnimationFrame timer utilities loaded');
})();
