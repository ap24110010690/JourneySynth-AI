// src/services/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('journeysynth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register') && window.location.pathname !== '/') {
        localStorage.removeItem('journeysynth_token');
        localStorage.removeItem('journeysynth_user');
      }
    }
    return Promise.reject(error);
  }
);
