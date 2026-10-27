import axios from 'axios';

// Using relative /api/v1 path routes requests through Vite dev server proxy
// This eliminates all browser CORS errors during local development
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Crucial for cookie transmission
});

// Request interceptor: attach Bearer token if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mytube_access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 & token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const storedRefreshToken = localStorage.getItem('mytube_refresh_token');
        const refreshRes = await api.post(
          '/users/refresh-token',
          storedRefreshToken ? { refreshToken: storedRefreshToken } : {}
        );

        const newAccessToken = refreshRes.data?.data?.accessToken;
        const newRefreshToken = refreshRes.data?.data?.refreshToken;
        if (newAccessToken) {
          localStorage.setItem('mytube_access_token', newAccessToken);
          if (newRefreshToken) localStorage.setItem('mytube_refresh_token', newRefreshToken);
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Clear expired auth
        localStorage.removeItem('mytube_access_token');
        localStorage.removeItem('mytube_refresh_token');
        localStorage.removeItem('mytube_user');
        window.dispatchEvent(new Event('mytube_auth_cleared'));
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Health Check: GET /healthcheck
export const checkHealth = async () => {
  const res = await api.get('/healthcheck');
  return res.data;
};

export default api;
