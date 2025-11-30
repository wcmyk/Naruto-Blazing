(function () {
  const LOGIN_KEY = 'blazing-login-complete';
  const USERNAME_KEY = 'blazing-login-username';
  const PLAYER_ID_KEY = 'blazing-player-id';
  const ACCOUNT_STORE_KEY = 'blazing-account-store';
  const ACCOUNT_SOURCE_PATH = 'data/user-accounts.json';

  const overlay = document.getElementById('login-overlay');
  const formWrapper = overlay?.querySelector('[data-login-form]');
  const form = formWrapper?.querySelector('form');
  const usernameInput = overlay?.querySelector('[data-login-username]');
  const passwordInput = overlay?.querySelector('[data-login-password]');
  const guestButton = overlay?.querySelector('[data-login-guest]');
  const fastEnterButton = overlay?.querySelector('[data-login-fast]');
  const loadingBridge = document.getElementById('login-loading');
  const redirectUrl = overlay?.dataset.redirect;
  const usernameDisplay = document.getElementById('username-display');

  if (!overlay) return;

  const safeGet = (key) => {
    try {
      return localStorage.getItem(key);
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
  };

  let accountStore = { nextId: 1001, accounts: [] };

  const normalizeNinjas = (ninjas = []) => {
    if (!Array.isArray(ninjas)) return [];
    return ninjas
      .filter((ninja) => ninja?.name)
      .map((ninja, index) => ({
        id: Number(ninja.id) || index + 1,
        name: String(ninja.name),
        level: Number(ninja.level) || 1,
        rank: String(ninja.rank || 'Genin'),
        element: String(ninja.element || 'Neutral'),
      }));
  };

  const normalizeAccountStore = (store) => {
    const normalized = {
      nextId: Number(store?.nextId) || 1001,
      accounts: Array.isArray(store?.accounts)
        ? store.accounts
            .filter((account) => account?.username && account?.password)
            .map((account) => ({
              id: Number(account.id) || null,
              username: String(account.username),
              password: String(account.password),
              ninjas: normalizeNinjas(account.ninjas),
            }))
        : [],
    };

    if (!normalized.nextId && normalized.accounts.length) {
      const maxId = normalized.accounts.reduce(
        (max, account) => Math.max(max, Number(account.id) || 0),
        0,
      );
      normalized.nextId = Math.max(1001, maxId + 1);
    }

    return normalized;
  };

  const persistAccountStore = () => {
    try {
      safeSet(ACCOUNT_STORE_KEY, JSON.stringify(accountStore));
    } catch (error) {
      // Ignore persistence errors; session login still continues.
    }
  };

  const loadAccountStore = async () => {
    const cached = safeGet(ACCOUNT_STORE_KEY);
    if (cached) {
      try {
        accountStore = normalizeAccountStore(JSON.parse(cached));
        return accountStore;
      } catch (error) {
        // Fall through to fetch a clean copy.
      }
    }

    try {
      const response = await fetch(ACCOUNT_SOURCE_PATH);
      if (response.ok) {
        const remoteStore = await response.json();
        accountStore = normalizeAccountStore(remoteStore);
        persistAccountStore();
        return accountStore;
      }
    } catch (error) {
      // Fall back to an empty store.
    }

    accountStore = { nextId: 1001, accounts: [] };
    persistAccountStore();
    return accountStore;
  };

  const accountStoreReady = loadAccountStore();

  const hasLoggedIn = () => safeGet(LOGIN_KEY) === 'true';

  const attachMissingNinjas = (account) => {
    if (!account) return account;
    if (!Array.isArray(account.ninjas) || account.ninjas.length === 0) {
      const fallback = starterNinjas(account.id || nextPlayerId());
      account.ninjas = fallback;
      persistAccountStore();
    }
    return account;
  };

  const showFeedback = (message, isError = false) => {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.classList.toggle('is-error', Boolean(isError));
    feedback.classList.toggle('is-success', !isError);
    feedback.classList.add('is-visible');
  };

  const setUsername = (name) => {
    if (!name) return;
    safeSet(USERNAME_KEY, name);
    if (usernameDisplay) {
      usernameDisplay.textContent = name;
    }
  };

  const setPlayerId = (playerId) => {
    if (playerId) {
      safeSet(PLAYER_ID_KEY, String(playerId));
    }
  };

  const findAccount = (name) => {
    const target = name?.trim().toLowerCase();
    if (!target) return null;
    return accountStore.accounts.find(
      (account) => account.username?.toLowerCase() === target,
    );
  };

  const nextPlayerId = () => {
    const highestId = accountStore.accounts.reduce(
      (max, account) => Math.max(max, Number(account.id) || 0),
      0,
    );
    const startingId = Number(accountStore.nextId) || 1001;
    const newId = Math.max(startingId, highestId + 1);
    accountStore.nextId = newId + 1;
    return newId;
  };

  const finalizeLogin = (name, account = null) => {
    const resolvedName = name?.trim() || safeGet(USERNAME_KEY) || 'Ninja';
    setUsername(resolvedName);
    if (account?.id) {
      setPlayerId(account.id);
    }
    safeSet(LOGIN_KEY, 'true');
    overlay.classList.add('is-hidden');
    document.body.classList.remove('login-active');
    const removeOverlay = () => overlay.remove();
    overlay.addEventListener('transitionend', removeOverlay, { once: true });
    setTimeout(removeOverlay, 650);

    if (loadingBridge && redirectUrl) {
      loadingBridge.classList.remove('is-hidden');
      const loaderText = loadingBridge.querySelector('[data-loading-message]');
      if (loaderText) {
        loaderText.textContent = 'Entering the village plaza…';
      }

      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 550);
    }
  };

  if (hasLoggedIn()) {
    const storedName = safeGet(USERNAME_KEY);
    if (storedName) setUsername(storedName);

    if (loadingBridge && redirectUrl) {
      overlay.classList.add('is-hidden');
      document.body.classList.remove('login-active');
      loadingBridge.classList.remove('is-hidden');

      const loaderText = loadingBridge.querySelector('[data-loading-message]');
      if (loaderText) {
        loaderText.textContent = 'Resuming your village session…';
      }

      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 450);
      return;
    }

    overlay.remove();
    document.body.classList.remove('login-active');
    return;
  }

  document.body.classList.add('login-active');

  const storedName = safeGet(USERNAME_KEY);
  if (storedName && usernameInput) {
    usernameInput.value = storedName;
  }

  const starterNinjas = (playerId) => {
    const starters = [
      { name: 'Naruto Uzumaki', element: 'Wind' },
      { name: 'Sasuke Uchiha', element: 'Lightning' },
      { name: 'Sakura Haruno', element: 'Earth' },
      { name: 'Rock Lee', element: 'Taijutsu' },
      { name: 'Shikamaru Nara', element: 'Shadow' },
      { name: 'Hinata Hyuga', element: 'Water' },
    ];

    const offset = Number(playerId) % starters.length;
    const picks = [starters[offset], starters[(offset + 2) % starters.length]];

    return picks.map((ninja, index) => ({
      id: index + 1,
      name: ninja.name,
      level: 1,
      rank: 'Genin',
      element: ninja.element,
    }));
  };

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = usernameInput?.value?.trim?.() || '';
    const password = passwordInput?.value || '';

    await accountStoreReady;

    if (!username || !password) {
      showFeedback('Enter a username and password to log in.', true);
      return;
    }

    const account = attachMissingNinjas(findAccount(username));
    if (!account) {
      showFeedback('No account found. Try creating one first.', true);
      return;
    }

    if (account.password !== password) {
      showFeedback('Incorrect password. Please try again.', true);
      return;
    }

    showFeedback('Welcome back! Taking you to the village…');
    finalizeLogin(account.username, account);
  });

  createAccountButton?.addEventListener('click', async (event) => {
    event.preventDefault();
    const username = usernameInput?.value?.trim?.() || '';
    const password = passwordInput?.value || '';

    await accountStoreReady;

    if (!username || !password) {
      showFeedback('Choose a username and password to create your account.', true);
      return;
    }

    if (username.length < 3) {
      showFeedback('Usernames need at least 3 characters.', true);
      return;
    }

    if (password.length < 4) {
      showFeedback('Passwords need at least 4 characters.', true);
      return;
    }

    const existingAccount = findAccount(username);
    if (existingAccount) {
      showFeedback('That ninja already exists. Try logging in instead.', true);
      return;
    }

    const playerId = nextPlayerId();
    const newAccount = {
      id: playerId,
      username,
      password,
      ninjas: starterNinjas(playerId),
    };
    accountStore.accounts.push(newAccount);
    persistAccountStore();

    showFeedback(`Account created! Player ID #${playerId}. Signing you in…`);
    finalizeLogin(username, newAccount);
  });

  guestButton?.addEventListener('click', (event) => {
    event.preventDefault();
    showFeedback('Continuing as guest.');
    finalizeLogin(usernameInput?.value || storedName || '');
  });

  fastEnterButton?.addEventListener('click', (event) => {
    event.preventDefault();
    finalizeLogin(usernameInput?.value || storedName || '');
  });
})();
