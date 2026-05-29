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
    getSeats: (slug, sectionId, blockCode) => api.get(`/matches/${slug}/seats`, { params: { sectionId, blockCode } }),
    getRounds: (params) => api.get('/matches/rounds', { params }),
};

export const ticketApi = {
    createOrder: (data) => api.post('/tickets/orders', data),
    getMyOrders: () => api.get('/tickets/orders'),
    getMyETickets: () => api.get('/tickets/etickets'),
    holdSeats: (data) => api.post('/tickets/seat-holds', data),
    cancelSeatHolds: (data) => api.delete('/tickets/seat-holds', { data }),
    cancelSeatHoldsOnUnload: (data) => {
        const token = localStorage.getItem(AUTH_STORAGE_KEYS.token);
        const headers = { 'Content-Type': 'application/json' };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        return fetch(`${API_BASE_URL}/tickets/seat-holds`, {
            method: 'DELETE',
            headers,
            body: JSON.stringify(data),
            keepalive: true,
        });
    },
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
    /* ── Read ────────────────────────────────────────────── */
    getOrders: (params) => api.get('/admin/orders', { params }),
    getOrder: (id) => api.get(`/admin/orders/${id}`),
    getMatches: (params) => api.get('/admin/matches', { params }),
    getSeasons: (params) => api.get('/admin/seasons', { params }),
    getRounds: (params) => api.get('/admin/rounds', { params }),
    getStadiums: (params) => api.get('/admin/stadiums', { params }),
    getStadiumSections: (stadiumId) => api.get(`/admin/stadiums/${stadiumId}/sections`),
    getTickets: (params) => api.get('/admin/tickets', { params }),
    getPayments: (params) => api.get('/admin/payments', { params }),
    getETickets: (params) => api.get('/admin/etickets', { params }),
    getClubs: (params) => api.get('/admin/clubs', { params }),
    getNews: (params) => api.get('/admin/news', { params }),

    /* ── Matches CRUD ────────────────────────────────────── */
    createMatch: (data) => api.post('/admin/matches', data),
    updateMatch: (id, data) => api.put(`/admin/matches/${id}`, data),
    deleteMatch: (id) => api.delete(`/admin/matches/${id}`),

    /* ── Clubs CRUD ──────────────────────────────────────── */
    createClub: (data) => api.post('/admin/clubs', data),
    updateClub: (id, data) => api.put(`/admin/clubs/${id}`, data),
    deleteClub: (id) => api.delete(`/admin/clubs/${id}`),

    /* ── Stadiums CRUD ───────────────────────────────────── */
    createStadium: (data) => api.post('/admin/stadiums', data),
    updateStadium: (id, data) => api.put(`/admin/stadiums/${id}`, data),
    deleteStadium: (id) => api.delete(`/admin/stadiums/${id}`),

    /* ── Seasons CRUD ────────────────────────────────────── */
    createSeason: (data) => api.post('/admin/seasons', data),
    updateSeason: (id, data) => api.put(`/admin/seasons/${id}`, data),
    deleteSeason: (id) => api.delete(`/admin/seasons/${id}`),

    /* ── Rounds CRUD ─────────────────────────────────────── */
    createRound: (data) => api.post('/admin/rounds', data),
    updateRound: (id, data) => api.put(`/admin/rounds/${id}`, data),
    deleteRound: (id) => api.delete(`/admin/rounds/${id}`),

    /* ── Tickets CRUD ────────────────────────────────────── */
    createTicket: (data) => api.post('/admin/tickets', data),
    updateTicket: (id, data) => api.put(`/admin/tickets/${id}`, data),
    deleteTicket: (id) => api.delete(`/admin/tickets/${id}`),

    /* ── News CRUD ───────────────────────────────────────── */
    createNews: (data) => api.post('/admin/news', data),
    updateNews: (id, data) => api.put(`/admin/news/${id}`, data),
    deleteNews: (id) => api.delete(`/admin/news/${id}`),
};

export const newsApi = {
    getAll: (params) => api.get('/news', { params }),
};

export default api;
