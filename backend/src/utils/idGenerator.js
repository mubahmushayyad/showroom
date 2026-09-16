// Generates human-readable, prefix-scoped IDs, e.g. "APP-1A2B3C4D-042".
// Mirrors the shape of the frontend's old client-side generateId() helper
// (services/localStorageService.js) so ids look familiar, but every id
// used in the database is always minted here, server-side — the backend
// never trusts a client-supplied primary key on create.
function genId(prefix) {
  const time = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 999)
    .toString()
    .padStart(3, '0');
  return `${prefix}-${time}-${rand}`;
}

module.exports = { genId };
