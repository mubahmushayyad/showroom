import api, { unwrap } from './api';

export const getCustomersApi = async () => unwrap(await api.get('/customers'));
export const getCustomerByIdApi = async (id) => unwrap(await api.get(`/customers/${id}`));
export const createCustomerApi = async (payload) => unwrap(await api.post('/customers', payload));
export const updateCustomerApi = async (id, payload) => unwrap(await api.put(`/customers/${id}`, payload));
export const deleteCustomerApi = async (id, payload = {}) => {
  await api.delete(`/customers/${id}`, { data: payload });
  return id;
};

export default api;
