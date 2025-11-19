// js/music-player.js - Background Music System

class MusicPlayer {
  constructor() {
    this.audio = null;
    this.currentTrack = null;
    this.isPlaying = false;
    this.volume = 0.5; // Default 50%
    this.isMuted = false;

    // Load preferences from localStorage
    this.loadPreferences();
  }

  /**
   * Initialize the music player
   */
  init(trackPath = 'assets/music/general.mp3') {
    // Create or reuse existing audio element
    this.audio = document.getElementById('game-music');

    if (!this.audio) {
      this.audio = new Audio();
      this.audio.id = 'game-music';
      this.audio.loop = true;
      this.audio.preload = 'auto';
      document.body.appendChild(this.audio);
    }

    // Set the track
    if (this.currentTrack !== trackPath) {
      this.currentTrack = trackPath;
      this.audio.src = trackPath;
    }

    // Apply saved preferences
    this.audio.volume = this.isMuted ? 0 : this.volume;

    // Add error event listener for debugging
    this.audio.addEventListener('error', (e) => {
      console.error('❌ Music failed to load:', {
        path: trackPath,
        error: this.audio.error?.message || 'Unknown error',
        code: this.audio.error?.code
      });
    });

    // Add loaded event listener
    this.audio.addEventListener('loadeddata', () => {
      console.log('✅ Music file loaded successfully:', trackPath);
    });

    // Auto-play if user had it playing before
    if (this.isPlaying) {
      this.play();
    }

    console.log('🎵 Music player initialized with track:', trackPath);
  }

  /**
   * Play the music
   */
  play() {
    if (!this.audio) return;

    this.audio.play().then(() => {
      this.isPlaying = true;
      this.savePreferences();
      this.updateUI();
      console.log('▶️ Music playing');
    }).catch(error => {
      console.warn('⚠️ Autoplay blocked by browser. Click the play button to start music.', error);
      // Show music panel if it exists to draw attention
      const panel = document.getElementById('music-panel');
      if (panel && panel.classList.contains('collapsed')) {
        panel.classList.remove('collapsed');
        const collapseBtn = document.getElementById('music-collapse-btn');
        if (collapseBtn) collapseBtn.textContent = '−';
      }
    });
  }

  /**
   * Pause the music
   */
  pause() {
    if (!this.audio) return;

    this.audio.pause();
    this.isPlaying = false;
    this.savePreferences();
    this.updateUI();
    console.log('⏸️ Music paused');
  }

  /**
   * Toggle play/pause
   */
  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(vol) {
    if (!this.audio) return;

    this.volume = Math.max(0, Math.min(1, vol));
    if (!this.isMuted) {
      this.audio.volume = this.volume;
    }
    this.savePreferences();
    this.updateUI();
  }

  /**
   * Increase volume
   */
  volumeUp() {
    this.setVolume(this.volume + 0.1);
  }

  /**
   * Decrease volume
   */
  volumeDown() {
    this.setVolume(this.volume - 0.1);
  }

  /**
   * Toggle mute
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.audio) {
      this.audio.volume = this.isMuted ? 0 : this.volume;
    }
    this.savePreferences();
    this.updateUI();
  }

  /**
   * Change track
   */
  changeTrack(trackPath) {
    if (!this.audio) return;

    const wasPlaying = this.isPlaying;
    this.currentTrack = trackPath;
    this.audio.src = trackPath;

    if (wasPlaying) {
      this.play();
    }
  }

  /**
   * Save preferences to localStorage
   */
  savePreferences() {
    localStorage.setItem('music_preferences', JSON.stringify({
      isPlaying: this.isPlaying,
      volume: this.volume,
      isMuted: this.isMuted,
      currentTrack: this.currentTrack
    }));
  }

  /**
   * Load preferences from localStorage
   */
  loadPreferences() {
    const saved = localStorage.getItem('music_preferences');
    if (saved) {
      try {
        const prefs = JSON.parse(saved);
        this.isPlaying = prefs.isPlaying || false;
        this.volume = prefs.volume !== undefined ? prefs.volume : 0.5;
        this.isMuted = prefs.isMuted || false;
        this.currentTrack = prefs.currentTrack || null;
      } catch (e) {
        console.error('Failed to load music preferences:', e);
      }
    }
  }

  /**
   * Update UI elements
   */
  updateUI() {
    // Update play/pause button
    const playBtn = document.getElementById('music-play-btn');
    if (playBtn) {
      playBtn.textContent = this.isPlaying ? '⏸' : '▶';
      playBtn.title = this.isPlaying ? 'Pause Music' : 'Play Music';
    }

    // Update mute button
    const muteBtn = document.getElementById('music-mute-btn');
    if (muteBtn) {
      muteBtn.textContent = this.isMuted ? '🔇' : '🔊';
      muteBtn.title = this.isMuted ? 'Unmute' : 'Mute';
    }

    // Update volume slider
    const volumeSlider = document.getElementById('music-volume-slider');
    if (volumeSlider) {
      volumeSlider.value = this.volume * 100;
    }

    // Update volume display
    const volumeDisplay = document.getElementById('music-volume-display');
    if (volumeDisplay) {
      volumeDisplay.textContent = Math.round(this.volume * 100) + '%';
    }

    // Update panel class for visualizer
    const panel = document.getElementById('music-panel');
    if (panel) {
      if (this.isPlaying) {
        panel.classList.remove('paused');
      } else {
        panel.classList.add('paused');
      }
    }
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      isPlaying: this.isPlaying,
      volume: this.volume,
      isMuted: this.isMuted,
      currentTrack: this.currentTrack
    };
  }
}

// Global instance
window.MusicPlayer = new MusicPlayer();

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  window.MusicPlayer.init();

  // Check if we're on battle page - don't auto-play music on battle
  const isBattlePage = window.location.pathname.includes('battle.html');

  if (!isBattlePage) {
    // Auto-play music on all pages except battle
    // Note: This may be blocked by browser autoplay policy
    // User will need to interact with the page first
    setTimeout(() => {
      // Try to play after a short delay to ensure page is fully loaded
      if (!window.MusicPlayer.isPlaying) {
        window.MusicPlayer.play();
      }
    }, 500);
  } else {
    // On battle page, pause music
    window.MusicPlayer.pause();
    console.log('🎵 Music paused for battle');
  }
});

console.log('✅ Music player module loaded');
