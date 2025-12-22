/**
 * Asset Download Manager
 * Handles downloading and caching of game assets on mobile devices
 */

import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';

class AssetDownloadManager {
  constructor() {
    this.downloadProgress = 0;
    this.isDownloading = false;
    this.downloadComplete = false;

    // Asset packs configuration
    this.assetPacks = {
      essential: {
        name: 'Essential Assets',
        priority: 1,
        size: 10, // MB estimate
        files: [
          // UI assets
          'assets/ui/buttons.png',
          'assets/ui/icons.png',
          // First few popular characters for tutorial
          'assets/characters/naruto/portrait.png',
          'assets/characters/sasuke/portrait.png',
          // Essential backgrounds
          'assets/backgrounds/village.jpg'
        ]
      },
      characters: {
        name: 'Character Assets',
        priority: 2,
        size: 50, // MB estimate
        downloadInBackground: true
      },
      missions: {
        name: 'Mission Assets',
        priority: 3,
        size: 30, // MB estimate
        downloadInBackground: true
      }
    };
  }

  /**
   * Initialize the asset manager and check download status
   */
  async initialize() {
    // Only run on mobile
    if (!window.Platform?.isMobile) {
      console.log('Asset download manager: Web mode, skipping');
      this.downloadComplete = true;
      return true;
    }

    try {
      // Check if assets are already downloaded
      const { value } = await Preferences.get({ key: 'assets_downloaded' });

      if (value === 'true') {
        console.log('Assets already downloaded');
        this.downloadComplete = true;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking asset status:', error);
      return false;
    }
  }

  /**
   * Download essential assets (blocking operation)
   * Shows progress to user
   */
  async downloadEssentialAssets(progressCallback) {
    if (!window.Platform?.isMobile) return true;

    this.isDownloading = true;
    const pack = this.assetPacks.essential;

    try {
      console.log(`Downloading ${pack.name}...`);

      // For now, simulate download since we're bundling assets in the APK
      // In production, you'd actually download from CDN
      for (let i = 0; i <= 100; i += 10) {
        await this.sleep(200); // Simulate download time
        this.downloadProgress = i;

        if (progressCallback) {
          progressCallback(i, pack.name);
        }
      }

      // Mark essential assets as downloaded
      await Preferences.set({
        key: 'essential_assets_downloaded',
        value: 'true'
      });

      console.log('Essential assets downloaded');
      return true;

    } catch (error) {
      console.error('Error downloading essential assets:', error);
      return false;
    } finally {
      this.isDownloading = false;
    }
  }

  /**
   * Download remaining assets in background
   * Non-blocking operation
   */
  async downloadRemainingAssets() {
    if (!window.Platform?.isMobile) return;

    // Download in background
    setTimeout(async () => {
      try {
        console.log('Downloading remaining assets in background...');

        // Simulate background download
        await this.sleep(5000);

        // Mark all assets as downloaded
        await Preferences.set({
          key: 'assets_downloaded',
          value: 'true'
        });

        this.downloadComplete = true;
        console.log('All assets downloaded');

      } catch (error) {
        console.error('Error downloading remaining assets:', error);
      }
    }, 1000);
  }

  /**
   * Download a specific file from URL to device storage
   * @param {string} url - URL to download from
   * @param {string} localPath - Local path to save to
   */
  async downloadFile(url, localPath) {
    if (!window.Platform?.isMobile) return;

    try {
      // Fetch the file
      const response = await fetch(url);
      const blob = await response.blob();

      // Convert blob to base64
      const base64Data = await this.blobToBase64(blob);

      // Save to filesystem
      await Filesystem.writeFile({
        path: localPath,
        data: base64Data,
        directory: Directory.Data
      });

      console.log(`Downloaded: ${localPath}`);
      return true;

    } catch (error) {
      console.error(`Error downloading ${url}:`, error);
      return false;
    }
  }

  /**
   * Get download progress (0-100)
   */
  getProgress() {
    return this.downloadProgress;
  }

  /**
   * Check if download is complete
   */
  isComplete() {
    return this.downloadComplete;
  }

  /**
   * Reset download status (for testing)
   */
  async resetDownloadStatus() {
    await Preferences.remove({ key: 'assets_downloaded' });
    await Preferences.remove({ key: 'essential_assets_downloaded' });
    this.downloadComplete = false;
    this.downloadProgress = 0;
    console.log('Download status reset');
  }

  /**
   * Helper: Convert Blob to Base64
   */
  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Helper: Sleep function
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create global instance
window.AssetManager = new AssetDownloadManager();

export default window.AssetManager;
