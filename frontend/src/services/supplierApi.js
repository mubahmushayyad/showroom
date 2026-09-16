import api, { unwrap } from './api';

export const getSuppliersApi = async () => unwrap(await api.get('/suppliers'));
export const getSupplierByIdApi = async (id) => unwrap(await api.get(`/suppliers/${id}`));
export const createSupplierApi = async (payload) => unwrap(await api.post('/suppliers', payload));
export const updateSupplierApi = async (id, payload) => unwrap(await api.put(`/suppliers/${id}`, payload));
export const deleteSupplierApi = async (id, payload = {}) => {
  await api.delete(`/suppliers/${id}`, { data: payload });
  return id;
};

export default api;
