import api, { unwrap } from './api';

// AuditLog per section 9/24 of the guide — every important create/
// update/delete/status-change is recorded server-side and surfaced here.
export const getActivityApi = async (limit = 100) => unwrap(await api.get(`/activity?limit=${limit}`));

export default api;
