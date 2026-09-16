import api, { unwrap, API_ORIGIN } from './api';

// "Car" here is the PDF's "Vehicle" entity (section 9) — kept as
// carApi/cars to match the current project's existing naming/backend
// routes; see pages/*/Cars.jsx which act as the Vehicle catalog module.

export const getCarsApi = async () => unwrap(await api.get('/cars'));
export const getCarByIdApi = async (id) => unwrap(await api.get(`/cars/${id}`));
export const createCarApi = async (payload) => unwrap(await api.post('/cars', payload));
export const updateCarApi = async (id, payload) => unwrap(await api.put(`/cars/${id}`, payload));
export const deleteCarApi = async (id, payload = {}) => {
  await api.delete(`/cars/${id}`, { data: payload });
  return id;
};

export const uploadCarImagesApi = async (files) => {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append('images', file));
  const { urls } = unwrap(
    await api.post('/cars/upload-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  );
  return urls;
};

export const resolveImageUrl = (src) => {
  if (!src) return src;
  if (/^https?:\/\//i.test(src) || src.startsWith('data:') || src.startsWith('blob:')) return src;
  return `${API_ORIGIN}${src.startsWith('/') ? '' : '/'}${src}`;
};

export default api;
