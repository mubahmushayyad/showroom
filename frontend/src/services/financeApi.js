import api, { unwrap } from './api';

// Finance module — section 9/13/18 of the guide.
// POST /api/applications/:id/finance  → create/update the FinancePlan
// GET  /api/applications/:id/finance  → read the FinancePlan (+ installments)
//
// Down payment, duration & frequency are entered on the client for
// speed, but financedAmount / installmentAmount are always what the
// backend calculates and returns — never trust a total computed only
// in React (section 18, "Golden Rules").

export const createFinancePlanApi = async (applicationId, payload) =>
  unwrap(await api.post(`/applications/${applicationId}/finance`, payload));

export const getFinancePlanApi = async (applicationId) =>
  unwrap(await api.get(`/applications/${applicationId}/finance`));

export default api;
