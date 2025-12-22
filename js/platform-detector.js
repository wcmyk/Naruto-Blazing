/**
 * Platform Detection Utility
 * Detects if the app is running on web, mobile (Capacitor), or specific platforms
 */

class PlatformDetector {
  constructor() {
    this.isCapacitor = typeof window !== 'undefined' && !!window.Capacitor;
    this.isMobile = this.isCapacitor && window.Capacitor.isNativePlatform();
    this.isWeb = !this.isMobile;

    // Specific platform detection
    this.isAndroid = this.isMobile && window.Capacitor.getPlatform() === 'android';
    this.isIOS = this.isMobile && window.Capacitor.getPlatform() === 'ios';

    // API URL configuration
    this.API_BASE_URL = this.isMobile
      ? 'https://your-production-api.herokuapp.com' // Replace with your actual production API
      : 'http://localhost:3000';
  }

  /**
   * Get the appropriate API URL for the current platform
   * @param {string} endpoint - The API endpoint (e.g., '/api/characters')
   * @returns {string} - Full API URL
   */
  getApiUrl(endpoint) {
    return `${this.API_BASE_URL}${endpoint}`;
  }

  /**
   * Log platform information (useful for debugging)
   */
  logPlatformInfo() {
    console.log('Platform Info:', {
      isCapacitor: this.isCapacitor,
      isMobile: this.isMobile,
      isWeb: this.isWeb,
      isAndroid: this.isAndroid,
      isIOS: this.isIOS,
      apiBaseUrl: this.API_BASE_URL
    });
  }

  /**
   * Check if the platform supports native features
   * @param {string} pluginName - Name of the Capacitor plugin (e.g., 'Haptics', 'StatusBar')
   * @returns {boolean}
   */
  hasNativeFeature(pluginName) {
    return this.isMobile && !!window.Capacitor?.Plugins?.[pluginName];
  }
}

// Create global instance
window.Platform = new PlatformDetector();

// Log platform info on startup
if (window.Platform.isMobile) {
  console.log('🚀 Running on mobile (Capacitor)');
  window.Platform.logPlatformInfo();
} else {
  console.log('🌐 Running on web');
}

export default window.Platform;
