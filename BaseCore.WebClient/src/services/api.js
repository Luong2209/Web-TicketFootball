import axios from 'axios';
import { AUTH_STORAGE_KEYS, clearAuthSession } from '../utils/auth';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(AUTH_STORAGE_KEYS.token);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            clearAuthSession();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    login: (username, password) => api.post('/auth/login', { username, password }),
    register: (data) => api.post('/auth/register', data),
};

// User API
export const userApi = {
    getAll: (params) => api.get('/users', { params }),
    getById: (id) => api.get(`/users/${id}`),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
};

export const matchApi = {
    getAll: (params) => api.get('/matches', { params }),
    getBySlug: (slug) => api.get(`/matches/${slug}`),
    getTickets: (slug) => api.get(`/matches/${slug}/tickets`),
};

export const ticketApi = {
    createOrder: (data) => api.post('/tickets/orders', data),
    getMyOrders: () => api.get('/tickets/orders'),
    getMyETickets: () => api.get('/tickets/etickets'),
};

export const paymentApi = {
    create: (data) => api.post('/payments', data),
    confirm: (id, data) => api.post(`/payments/${id}/confirm`, data),
    getById: (id) => api.get(`/payments/${id}`),
};

export const checkinApi = {
    create: (data) => api.post('/checkins', data),
    getAll: (params) => api.get('/checkins', { params }),
};

export const adminApi = {
    getOrders: (params) => api.get('/admin/orders', { params }),
    getOrder: (id) => api.get(`/admin/orders/${id}`),
    getMatches: () => api.get('/admin/matches'),
    getStadiums: () => api.get('/admin/stadiums'),
};

export const newsApi = {
    getAll: (params) => api.get('/news', { params }),
};

export default api;
