import api, { unwrap } from './api';

export const getSettingsApi = async () => unwrap(await api.get('/settings'));
export const updateSettingsApi = async (payload) => unwrap(await api.put('/settings', payload));

export default api;
