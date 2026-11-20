import axios from 'axios';

// Resilient Base URL: Uses relative '/api' in production or explicit VITE_API_URL
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // In production, fallback to relative /api for zero-config single-port deployments
  if (import.meta.env.PROD) {
    return '/api';
  }
  return 'http://localhost:5000/api';
};

// Base API instance
const API = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Injects Authorization token from localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('store_rating_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handles global response errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and not already on login page, clear token
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('store_rating_token');
        localStorage.removeItem('store_rating_user');
      }
    }
    return Promise.reject(error);
  }
);

// -------------------------------------------------------------
// Authentication Services
// -------------------------------------------------------------
export const authService = {
  login: async (credentials) => {
    const response = await API.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await API.post('/auth/register', userData);
    return response.data;
  },
  getMe: async () => {
    const response = await API.get('/auth/me');
    return response.data;
  },
  changePassword: async (passwords) => {
    const response = await API.put('/auth/change-password', passwords);
    return response.data;
  },
  logout: async () => {
    try {
      await API.post('/auth/logout');
    } catch (e) {
      // Ignored
    }
  }
};

// -------------------------------------------------------------
// Admin Services
// -------------------------------------------------------------
export const adminService = {
  getDashboard: async () => {
    const response = await API.get('/admin/dashboard');
    return response.data;
  },
  getUsers: async (params) => {
    const response = await API.get('/admin/users', { params });
    return response.data;
  },
  getUserById: async (id) => {
    const response = await API.get(`/admin/users/${id}`);
    return response.data;
  },
  createUser: async (userData) => {
    const response = await API.post('/admin/users', userData);
    return response.data;
  },
  getStores: async (params) => {
    const response = await API.get('/admin/stores', { params });
    return response.data;
  },
  getStoreById: async (id) => {
    const response = await API.get(`/admin/stores/${id}`);
    return response.data;
  },
  createStore: async (storeData) => {
    const response = await API.post('/admin/stores', storeData);
    return response.data;
  }
};

// -------------------------------------------------------------
// Store & Rating Services (User facing)
// -------------------------------------------------------------
export const storeService = {
  getStores: async (params) => {
    const response = await API.get('/stores', { params });
    return response.data;
  },
  getStoreById: async (id) => {
    const response = await API.get(`/stores/${id}`);
    return response.data;
  }
};

export const ratingService = {
  submitRating: async (ratingData) => {
    const response = await API.post('/ratings', ratingData);
    return response.data;
  },
  updateRating: async (storeId, ratingData) => {
    const response = await API.put(`/ratings/${storeId}`, ratingData);
    return response.data;
  }
};

// -------------------------------------------------------------
// Store Owner Services
// -------------------------------------------------------------
export const ownerService = {
  getDashboard: async () => {
    const response = await API.get('/owner/dashboard');
    return response.data;
  },
  getRatings: async () => {
    const response = await API.get('/owner/ratings');
    return response.data;
  },
  getAverageRating: async () => {
    const response = await API.get('/owner/average-rating');
    return response.data;
  }
};

export default API;
