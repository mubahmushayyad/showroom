import api, { unwrap } from './api';

// POST /api/auth/login — public. Returns { token, user }.
export const loginApi = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  return unwrap(res);
};

// GET /api/auth/me — returns the currently authenticated user, used to
// restore a session on page refresh instead of trusting a stale copy
// sitting in LocalStorage forever.
export const meApi = async () => unwrap(await api.get('/auth/me'));

export default { loginApi, meApi };
