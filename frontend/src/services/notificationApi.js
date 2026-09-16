import api, { unwrap } from './api';

export const getNotificationsByUserApi = async (userId) =>
  unwrap(await api.get(`/notifications/user/${userId}`));
export const markNotificationReadApi = async (id) =>
  unwrap(await api.patch(`/notifications/${id}/read`));

export default api;
