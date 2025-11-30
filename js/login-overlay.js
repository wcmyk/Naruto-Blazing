(function () {
  const LOGIN_KEY = 'blazing-login-complete';
  const USERNAME_KEY = 'blazing-login-username';
  const overlay = document.getElementById('login-overlay');
  const formWrapper = overlay?.querySelector('[data-login-form]');
  const form = formWrapper?.querySelector('form');
  const usernameInput = overlay?.querySelector('[data-login-username]');
  const guestButton = overlay?.querySelector('[data-login-guest]');
  const usernameDisplay = document.getElementById('username-display');
  const redirectUrl = overlay?.dataset.redirect;
  const loadingOverlay = document.getElementById('login-loading');
  const loadingMessage = loadingOverlay?.querySelector('[data-loading-message]');

  if (!overlay) return;

  const safeGet = (key) => {
    try {
      const value = localStorage.getItem(key);
      if (value !== null) return value;
    } catch (error) {
      // Continue to sessionStorage fallback when localStorage is unavailable.
    }

    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      return null;
    }
  };

  const safeSet = (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      // Ignore storage errors so we never block login flow.
    }

    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      // Ignore sessionStorage errors as well.
    }
  };

  const hasLoggedIn = () => safeGet(LOGIN_KEY) === 'true';

  const setUsername = (name) => {
    if (!name) return;
    safeSet(USERNAME_KEY, name);
    if (usernameDisplay) {
      usernameDisplay.textContent = name;
    }
  };

  const showLoadingAndRedirect = () => {
    if (loadingOverlay) {
      loadingOverlay.classList.remove('is-hidden');
      if (loadingMessage) {
        loadingMessage.textContent = 'Loading Village HUD…';
      }
    }

    if (redirectUrl) {
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 900);
    }
  };

  const finalizeLogin = (name) => {
    const resolvedName = name?.trim() || safeGet(USERNAME_KEY) || 'Ninja';
    setUsername(resolvedName);
    safeSet(LOGIN_KEY, 'true');
    overlay.classList.add('is-hidden');
    document.body.classList.remove('login-active');
    const removeOverlay = () => overlay.remove();
    overlay.addEventListener('transitionend', removeOverlay, { once: true });
    setTimeout(removeOverlay, 650);
    showLoadingAndRedirect();
  };

  if (hasLoggedIn()) {
    const storedName = safeGet(USERNAME_KEY);
    if (storedName) setUsername(storedName);
    if (redirectUrl) {
      showLoadingAndRedirect();
    } else {
      overlay.remove();
      document.body.classList.remove('login-active');
    }
    return;
  }

  document.body.classList.add('login-active');

  const storedName = safeGet(USERNAME_KEY);
  if (storedName && usernameInput) {
    usernameInput.value = storedName;
  }

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = usernameInput?.value || '';
    finalizeLogin(username);
  });

  guestButton?.addEventListener('click', (event) => {
    event.preventDefault();
    finalizeLogin(usernameInput?.value || storedName || '');
  });
})();
