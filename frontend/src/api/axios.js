import axios from 'axios';

const isProduction = window.location.hostname.endsWith('vercel.app');
const API_URL = process.env.REACT_APP_API_URL || 
                (isProduction ? 'https://gig-shield-backend.vercel.app' : 'http://localhost:5000');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gigshield_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gigshield_token');
      if (window.location.pathname !== '/register' && window.location.pathname !== '/') {
        window.location.href = '/register';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
