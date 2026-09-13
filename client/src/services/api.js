import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pizzaverse_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unverified or expired token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If token expired, clear invalid session
      if (localStorage.getItem('pizzaverse_token')) {
        console.warn('Session expired or unauthorized. Logging out.');
        localStorage.removeItem('pizzaverse_token');
        localStorage.removeItem('pizzaverse_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
