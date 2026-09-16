import api, { unwrap } from './api';

// POST /api/payments — record a payment against an installment
// (section 13/18). GET is scoped to one application so the Manager's
// workflow screen and the Customer's "My Finance" screen can both
// show paid/remaining totals without recomputing anything client-side.

export const getPaymentsApi = async (applicationId) =>
  unwrap(await api.get('/payments', { params: { applicationId } }));

export const createPaymentApi = async (payload) => unwrap(await api.post('/payments', payload));

export default api;
