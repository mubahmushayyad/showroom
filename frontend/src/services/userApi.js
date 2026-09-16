import api, { unwrap } from './api';

export const getUsersApi = async () => unwrap(await api.get('/users'));
export const getUserByIdApi = async (id) => unwrap(await api.get(`/users/${id}`));

// Supports plain JSON, or multipart when CNIC front/back files are
// attached (see components/users/UserForm.jsx + pages/super-admin/RegisterUser.jsx).
function toRequestBody(payload) {
  const hasFiles = payload?.cnicFrontFile instanceof File || payload?.cnicBackFile instanceof File;
  if (!hasFiles) return { body: payload, headers: undefined };
  const fd = new FormData();
  Object.entries(payload).forEach(([key, val]) => {
    if (val === undefined || val === null) return;
    if (key === 'cnicFrontFile') fd.append('cnicFront', val);
    else if (key === 'cnicBackFile') fd.append('cnicBack', val);
    else fd.append(key, val);
  });
  return { body: fd, headers: { 'Content-Type': 'multipart/form-data' } };
}

export const createUserApi = async (payload) => {
  const { body, headers } = toRequestBody(payload);
  return unwrap(await api.post('/users', body, headers ? { headers } : undefined));
};

export const updateUserApi = async (id, payload) => {
  const { body, headers } = toRequestBody(payload);
  return unwrap(await api.put(`/users/${id}`, body, headers ? { headers } : undefined));
};

export const deleteUserApi = async (id) => {
  await api.delete(`/users/${id}`);
  return id;
};

export default api;
