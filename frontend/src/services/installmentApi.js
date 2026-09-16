import api, { unwrap } from './api';

// GET /api/applications/:id/installments — the generated payment
// schedule for that application's FinancePlan (section 9/13).
export const getInstallmentsApi = async (applicationId) =>
  unwrap(await api.get(`/applications/${applicationId}/installments`));

export default api;
