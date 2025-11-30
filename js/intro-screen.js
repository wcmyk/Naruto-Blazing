(function () {
  const introScreen = document.getElementById('intro-screen');
  const tapTarget = introScreen?.querySelector('[data-tap-start]');
  
  if (!introScreen) {
    // If intro screen doesn't exist, make sure login is visible
    document.body.classList.remove('intro-active');
    return;
  }

  const hideIntro = () => {
    if (introScreen.classList.contains('is-hidden')) return;
    
    // Hide the intro screen
    introScreen.classList.add('is-hidden');
    
    // CRITICAL: Remove intro-active class immediately so login becomes visible
    document.body.classList.remove('intro-active');
    
    // Remove intro screen from DOM after animation
    setTimeout(() => {
      introScreen.remove();
    }, 650);
  };

  const handleKeydown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      hideIntro();
    }
  };

  // Set up event listeners
  introScreen.addEventListener('click', hideIntro);
  introScreen.addEventListener('keydown', handleKeydown);
  introScreen.setAttribute('tabindex', '0');
  
  // Add intro-active class to body
  document.body.classList.add('intro-active');
  
  tapTarget?.setAttribute('aria-label', 'Tap to start the game');
  introScreen.focus({ preventScroll: true });
})();
