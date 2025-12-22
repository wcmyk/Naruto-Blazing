/**
 * Home Screen Controller
 * Handles home screen interactions, asset downloads, and navigation
 */

class HomeScreen {
  constructor() {
    this.startBtn = document.getElementById('startBtn');
    this.downloadContainer = document.getElementById('downloadContainer');
    this.downloadProgress = document.getElementById('downloadProgress');
    this.downloadPercentage = document.getElementById('downloadPercentage');

    this.isReady = false;
    this.assetsChecked = false;

    this.init();
  }

  async init() {
    console.log('Home Screen initialized');

    // Initialize platform detector
    await this.waitForPlatform();

    // Check if we need to download assets
    if (window.Platform?.isMobile) {
      await this.checkAndDownloadAssets();
    } else {
      // Web mode - ready to start immediately
      this.isReady = true;
    }

    // Initialize mobile features
    this.initializeMobileFeatures();

    // Setup event listeners
    this.setupEventListeners();
  }

  /**
   * Wait for platform detector to be ready
   */
  async waitForPlatform() {
    let attempts = 0;
    while (!window.Platform && attempts < 50) {
      await this.sleep(100);
      attempts++;
    }

    if (!window.Platform) {
      console.warn('Platform detector not loaded, assuming web mode');
      window.Platform = { isMobile: false, isWeb: true };
    }
  }

  /**
   * Check asset status and download if needed
   */
  async checkAndDownloadAssets() {
    if (!window.AssetManager) {
      console.warn('Asset Manager not loaded');
      this.isReady = true;
      return;
    }

    try {
      // Check if assets are already downloaded
      const assetsReady = await window.AssetManager.initialize();

      if (!assetsReady) {
        // First launch - download essential assets
        await this.downloadEssentialAssets();

        // Start background download for remaining assets
        window.AssetManager.downloadRemainingAssets();
      }

      this.isReady = true;
      this.assetsChecked = true;

    } catch (error) {
      console.error('Error checking assets:', error);
      this.isReady = true; // Continue anyway
    }
  }

  /**
   * Download essential assets with progress
   */
  async downloadEssentialAssets() {
    // Show download UI
    this.startBtn.style.display = 'none';
    this.downloadContainer.style.display = 'block';

    // Download with progress callback
    await window.AssetManager.downloadEssentialAssets((progress, packName) => {
      this.updateDownloadProgress(progress, packName);
    });

    // Hide download UI, show start button
    this.downloadContainer.style.display = 'none';
    this.startBtn.style.display = 'block';
  }

  /**
   * Update download progress UI
   */
  updateDownloadProgress(progress, packName) {
    this.downloadProgress.style.width = `${progress}%`;
    this.downloadPercentage.textContent = `${progress}%`;

    const downloadText = this.downloadContainer.querySelector('.download-text');
    if (downloadText) {
      downloadText.textContent = `Downloading ${packName}... ${progress}%`;
    }
  }

  /**
   * Initialize mobile-specific features
   */
  async initializeMobileFeatures() {
    if (!window.Platform?.isMobile) return;

    try {
      // Import Capacitor plugins dynamically
      const { StatusBar } = await import('@capacitor/status-bar');
      const { SplashScreen } = await import('@capacitor/splash-screen');
      const { ScreenOrientation } = await import('@capacitor/screen-orientation');

      // Hide splash screen after a delay
      setTimeout(async () => {
        await SplashScreen.hide();
      }, 1000);

      // Hide status bar for fullscreen
      await StatusBar.hide();

      // Lock to landscape orientation
      try {
        await ScreenOrientation.lock({ orientation: 'landscape' });
      } catch (error) {
        console.log('Screen orientation lock not supported:', error);
      }

      console.log('Mobile features initialized');

    } catch (error) {
      console.error('Error initializing mobile features:', error);
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Start button click
    this.startBtn.addEventListener('click', () => this.handleStart());

    // Touch feedback for mobile
    if (window.Platform?.isMobile) {
      this.startBtn.addEventListener('touchstart', () => {
        this.startBtn.style.transform = 'scale(0.95)';
      });

      this.startBtn.addEventListener('touchend', () => {
        this.startBtn.style.transform = 'scale(1)';
      });
    }

    // Handle app resume (Android back button, etc.)
    if (window.Capacitor?.Plugins?.App) {
      window.Capacitor.Plugins.App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          console.log('App resumed');
        }
      });
    }
  }

  /**
   * Handle start button click
   */
  async handleStart() {
    if (!this.isReady) {
      console.log('Not ready yet, please wait');
      return;
    }

    // Add loading state
    this.startBtn.classList.add('loading');

    // Haptic feedback on mobile
    if (window.Platform?.isMobile) {
      try {
        const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
        await Haptics.impact({ style: ImpactStyle.Medium });
      } catch (error) {
        console.log('Haptics not available:', error);
      }
    }

    // Navigate to login or village (main game)
    setTimeout(() => {
      // Check if user is already logged in
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

      if (isLoggedIn) {
        // Go directly to village (main game hub)
        window.location.href = 'village.html';
      } else {
        // Go to login screen
        // For web: index.html, For mobile build: login.html
        window.location.href = 'index.html';
      }
    }, 500);
  }

  /**
   * Helper: Sleep function
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize home screen when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.homeScreen = new HomeScreen();
  });
} else {
  window.homeScreen = new HomeScreen();
}

export default HomeScreen;
