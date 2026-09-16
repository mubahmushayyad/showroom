import api, { unwrap } from './api';

// REST plan — section 13 of the guide:
//   GET    /api/applications                     Role scoped
//   POST   /api/applications                      Customer/Super Admin
//   PATCH  /api/applications/:id/status            Super Admin
//   PATCH  /api/applications/:id/assign-manager     Super Admin
//
// The backend is expected to scope GET /applications by the caller's
// JWT (Manager -> managerId = self, Customer -> customerId = self,
// Super Admin/Admin -> everything), per the "Critical authorization
// rule" in section 10. Passing `scope`/`managerId` query params here
// is a convenience for the mock/dev backend; the server is always the
// authority, never the browser.

export const getApplicationsApi = async (params = {}) =>
  unwrap(await api.get('/applications', { params }));

export const getApplicationsByUserApi = async (userId) =>
  unwrap(await api.get(`/applications/user/${userId}`));

export const getApplicationByIdApi = async (id) => unwrap(await api.get(`/applications/${id}`));

export const createApplicationApi = async (payload) => {
  try {
    return unwrap(await api.post('/applications', payload));
  } catch (error) {
    console.log('APPLICATION API ERROR:', error.response?.data);
    throw error;
  }
};

export const updateApplicationStatusApi = async (id, payload) =>
  unwrap(await api.patch(`/applications/${id}/status`, payload));

// Super Admin only — section 4 "Only Super Admin assigns the Manager".
export const assignManagerApi = async (id, managerId, performedBy) =>
  unwrap(await api.patch(`/applications/${id}/assign-manager`, { managerId, performedBy }));

// Manager / Super Admin — attaches the vehicle the customer picked.
export const selectVehicleApi = async (id, carId, performedBy) =>
  unwrap(await api.patch(`/applications/${id}/select-vehicle`, { carId, performedBy }));

export default api;
