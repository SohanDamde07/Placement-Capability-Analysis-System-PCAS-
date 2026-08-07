import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 15000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pcas_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('pcas_token');
      localStorage.removeItem('pcas_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
