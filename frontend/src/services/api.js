// ─────────────────────────────────────────────────────────────
// api/axios.js  (re-exported here as services/api.js so every
// existing "services/*Api.js" file can just do:
//   import api, { unwrap } from './api';
// instead of creating its own axios instance.)
//
// Per section 14 (Authentication & Security) of the U DEVS
// Showroom Management System guide, every authenticated request
// must carry the JWT issued at /api/auth/login. This file is the
// single place that:
//   1. Builds the axios instance pointed at VITE_API_URL
//   2. Attaches "Authorization: Bearer <token>" automatically
//   3. Logs the user out and bounces to /login on a 401
//      (expired/invalid token) so nobody is left staring at a
//      broken screen after their session dies server-side.
// ─────────────────────────────────────────────────────────────

import axios from 'axios';
import { STORAGE } from '../utils/constants';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE.TOKEN);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE.TOKEN);
      localStorage.removeItem(STORAGE.SESSION);
      // Full reload (not a router push) so every Context/Redux slice
      // resets cleanly instead of holding onto stale, now-unauthorized data.
      if (!location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Backend responses are shaped { success, message, data, errors } (see
// section 12 of the guide). This unwraps that consistently for every
// service file; falls back to the raw payload for endpoints that don't
// use the envelope (e.g. a plain array).
export const unwrap = (response) =>
  response.data && Object.prototype.hasOwnProperty.call(response.data, 'data')
    ? response.data.data
    : response.data;

export const API_ORIGIN = (API_URL || '').replace(/\/api\/?$/, '');

export default api;
