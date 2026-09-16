// ─────────────────────────────────────────────────────────────
// context/AuthContext.jsx
//
// Real JWT authentication against POST /api/auth/login (section 14
// of the guide — bcrypt on the server, JWT issued back to us). The
// public shape of useAuth() — { user, login, logout } — is kept
// identical to the previous LocalStorage-only version on purpose, so
// every page that already calls useAuth() keeps working unchanged.
//
// Token storage: the JWT goes in STORAGE.TOKEN and is attached to
// every request automatically by services/api.js's interceptor. The
// (non-sensitive) user object — id, name, email, role — is cached in
// STORAGE.SESSION purely so the UI can render instantly on refresh
// without waiting on a round trip; it is always re-validated against
// GET /api/auth/me right after mount.
// ─────────────────────────────────────────────────────────────

import { createContext, useContext, useEffect, useState } from 'react';
import { STORAGE } from '../utils/constants';
import { getData, setData, removeData } from '../services/localStorageService';
import { loginApi, meApi } from '../services/authApi';

const C = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getData(STORAGE.SESSION, null));
  const [initializing, setInitializing] = useState(!!localStorage.getItem(STORAGE.TOKEN));

  // On refresh, trust the cached user just long enough to paint the
  // UI, then confirm the token is still valid server-side.
  useEffect(() => {
    const token = localStorage.getItem(STORAGE.TOKEN);
    if (!token) {
      setInitializing(false);
      return;
    }
    meApi()
      .then((freshUser) => {
        setUser(freshUser);
        setData(STORAGE.SESSION, freshUser);
      })
      .catch(() => {
        removeData(STORAGE.TOKEN);
        removeData(STORAGE.SESSION);
        setUser(null);
      })
      .finally(() => setInitializing(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    const { token, user: loggedInUser } = await loginApi(email, password);
    // Token is a plain string — store it raw (setData would JSON-stringify it).
    localStorage.setItem(STORAGE.TOKEN, token);
    setData(STORAGE.SESSION, loggedInUser);
    setUser(loggedInUser);
    // Lets AppContext (mounted above this provider) know it should
    // re-fetch the now-logged-in user's Notifications from the API.
    window.dispatchEvent(new Event('udevs:auth-changed'));
    return loggedInUser;
  };

  const logout = () => {
    removeData(STORAGE.TOKEN);
    removeData(STORAGE.SESSION);
    setUser(null);
    window.dispatchEvent(new Event('udevs:auth-changed'));
  };

  return <C.Provider value={{ user, login, logout, initializing }}>{children}</C.Provider>;
}

export const useAuth = () => useContext(C);
