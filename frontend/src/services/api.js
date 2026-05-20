import axios from 'axios';

const resolveApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL?.trim();

  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  if (import.meta.env.PROD) {
    console.error(
      'VITE_API_URL is required in production. Set it in Vercel environment variables.'
    );
  }

  return '/api';
};

const API_URL = resolveApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.message =
        import.meta.env.PROD
          ? 'Cannot reach API server. Check VITE_API_URL and backend deployment.'
          : error.message || 'Network error';
    }
    return Promise.reject(error);
  }
);

export const getSensors = async ({ page = 1, limit = 10, search = '' } = {}) => {
  const { data } = await api.get('/sensors', {
    params: { page, limit, search },
  });
  return data;
};

export const createSensor = async (payload) => {
  const { data } = await api.post('/sensors', payload);
  return data;
};

export const deleteSensor = async (id) => {
  const { data } = await api.delete(`/sensors/${id}`);
  return data;
};

export const exportSensorsExcel = async () => {
  const response = await api.get('/sensors/export', {
    responseType: 'blob',
  });
  return response.data;
};

export const getGateways = async ({ page = 1, limit = 10, search = '' } = {}) => {
  const { data } = await api.get('/gateways', {
    params: { page, limit, search },
  });
  return data;
};

export const createGateway = async (payload) => {
  const { data } = await api.post('/gateways', payload);
  return data;
};

export const deleteGateway = async (id) => {
  const { data } = await api.delete(`/gateways/${id}`);
  return data;
};

export const exportGatewaysExcel = async () => {
  const response = await api.get('/gateways/export', {
    responseType: 'blob',
  });
  return response.data;
};

export default api;
