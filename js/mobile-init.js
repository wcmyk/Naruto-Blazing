/**
 * Mobile Initialization Script
 * Include this in all HTML pages to enable mobile/Capacitor support
 *
 * Usage: <script type="module" src="js/mobile-init.js"></script>
 */

import { StatusBar } from '@capacitor/status-bar';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';

/**
 * Initialize mobile features
 */
async function initializeMobile() {
  // Only run on mobile
  if (!window.Platform?.isMobile) {
    console.log('Web mode - mobile initialization skipped');
    return;
  }

  try {
    console.log('Initializing mobile features...');

    // Hide status bar for fullscreen experience
    await StatusBar.hide().catch(e => console.log('StatusBar.hide failed:', e));

    // Set status bar style (in case it shows)
    await StatusBar.setStyle({ style: 'DARK' }).catch(e => console.log('StatusBar.setStyle failed:', e));

    // Set background color
    await StatusBar.setBackgroundColor({ color: '#000000' }).catch(e => console.log('StatusBar.setBackgroundColor failed:', e));

    // Lock to landscape orientation
    try {
      await ScreenOrientation.lock({ orientation: 'landscape' });
      console.log('Orientation locked to landscape');
    } catch (error) {
      console.log('Screen orientation lock not available:', error);
    }

    // Hide splash screen (if still showing)
    await SplashScreen.hide().catch(e => console.log('SplashScreen.hide failed:', e));

    // Handle Android back button
    App.addListener('backButton', ({ canGoBack }) => {
      const currentPage = window.location.pathname;

      // If on home or village, show exit confirmation
      if (currentPage.includes('home.html') || currentPage.includes('village.html')) {
        if (confirm('Exit game?')) {
          App.exitApp();
        }
      } else if (canGoBack) {
        window.history.back();
      } else {
        // Navigate to village
        window.location.href = 'village.html';
      }
    });

    // Handle app state changes
    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        console.log('App resumed');
        // Refresh if needed
      } else {
        console.log('App backgrounded');
        // Save state
      }
    });

    console.log('Mobile features initialized successfully');

  } catch (error) {
    console.error('Error initializing mobile features:', error);
  }
}

// Wait for platform detector, then initialize
async function waitForPlatformAndInit() {
  let attempts = 0;
  while (!window.Platform && attempts < 50) {
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }

  if (window.Platform) {
    await initializeMobile();
  } else {
    console.warn('Platform detector not loaded');
  }
}

// Auto-initialize when script loads
waitForPlatformAndInit();

export { initializeMobile };
