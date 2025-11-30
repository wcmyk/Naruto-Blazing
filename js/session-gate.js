(function () {
  const LOGIN_KEY = 'blazing-login-complete';
  const USERNAME_KEY = 'blazing-login-username';
  const redirectUrl = 'index.html';

  const fromCookie = (key) => {
    const cookies = document.cookie?.split(';') || [];
    const prefix = `${encodeURIComponent(key)}=`;
    const found = cookies.find((c) => c.trim().startsWith(prefix));
    return found ? decodeURIComponent(found.trim().slice(prefix.length)) : null;
  };

  const safeGet = (key) => {
    try {
      const value = localStorage.getItem(key);
      if (value !== null) return value;
    } catch (error) {
      // Fall back to sessionStorage or cookies when localStorage is blocked.
    }

    try {
      const value = sessionStorage.getItem(key);
      if (value !== null) return value;
    } catch (error) {
      // Continue to cookie fallback when storage is blocked.
    }

    return fromCookie(key);
  };

  const hasLogin = () => safeGet(LOGIN_KEY) === 'true';

  if (!hasLogin()) {
    window.location.replace(redirectUrl);
    return;
  }

  // Apply stored username to the HUD when available.
  const username = safeGet(USERNAME_KEY);
  const applyUsername = () => {
    if (!username) return;
    const usernameDisplay = document.getElementById('username-display');
    if (usernameDisplay) {
      usernameDisplay.textContent = username;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyUsername);
  } else {
    applyUsername();
  }
})();
