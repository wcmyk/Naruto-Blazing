(function () {
  const introScreen = document.getElementById('intro-screen');
  const tapTarget = introScreen?.querySelector('[data-tap-start]');
  const INTRO_SEEN_KEY = 'intro-screen-seen';

  if (!introScreen) return;

  const markIntroSeen = () => {
    try {
      localStorage.setItem(INTRO_SEEN_KEY, 'true');
    } catch (error) {
      // Ignore storage errors so the intro can still be dismissed.
    }
  };

  const hasSeenIntro = () => {
    try {
      return localStorage.getItem(INTRO_SEEN_KEY) === 'true';
    } catch (error) {
      // If storage is unavailable, always show the intro for safety.
      return false;
    }
  };

  if (hasSeenIntro()) {
    introScreen.remove();
    document.body.classList.remove('intro-active');
    return;
  }

  const hideIntro = () => {
    if (introScreen.classList.contains('is-hidden')) return;
    introScreen.classList.add('is-hidden');
    setTimeout(() => {
      introScreen.remove();
      document.body.classList.remove('intro-active');
      markIntroSeen();
    }, 650);
  };

  const handleKeydown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      hideIntro();
    }
  };

  introScreen.addEventListener('click', hideIntro);
  introScreen.addEventListener('keydown', handleKeydown);
  introScreen.setAttribute('tabindex', '0');
  document.body.classList.add('intro-active');
  tapTarget?.setAttribute('aria-label', 'Tap to start the game');
  introScreen.focus({ preventScroll: true });
})();
