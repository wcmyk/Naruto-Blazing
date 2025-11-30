(function () {
  const introScreen = document.getElementById('intro-screen');
  const tapTarget = introScreen?.querySelector('[data-tap-start]');

  if (!introScreen) return;

  const hideIntro = () => {
    if (introScreen.classList.contains('is-hidden')) return;
    introScreen.classList.add('is-hidden');
    setTimeout(() => {
      introScreen.remove();
      document.body.classList.remove('intro-active');
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
