// Small LocalStorage helpers still used for the session token/cache
// and for client-generated IDs on create forms. All Car/Supplier/
// Customer/Application/Notification/Activity data now lives in
// PostgreSQL via the backend (see context/AppContext.jsx) — this file
// no longer owns any of it.
export const getData = (key, fallback = []) => {
  try {
    const x = localStorage.getItem(key);
    return x ? JSON.parse(x) : fallback;
  } catch {
    return fallback;
  }
};
export const setData = (key, data) =>
  localStorage.setItem(key, JSON.stringify(data));
export const removeData = (k) => localStorage.removeItem(k);
export const clearData = (k) => localStorage.removeItem(k);
export const generateId = (p) =>
  `${p}-${Date.now().toString(36).toUpperCase()}-${Math.floor(
    Math.random() * 999,
  )
    .toString()
    .padStart(3, "0")}`;
