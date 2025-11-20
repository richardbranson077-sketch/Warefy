/**
 * API client for Warefy backend.
 * Handles all HTTP requests to the FastAPI backend.
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
if (typeof window !== 'undefined') {
    api.interceptors.request.use((config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });
}

// Authentication
export const auth = {
    login: async (username, password) => {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        const response = await api.post('/api/auth/login', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
        }

        return response.data;
    },

    register: async (userData) => {
        const response = await api.post('/api/auth/register', userData);
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await api.get('/api/auth/me');
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
    },
};

// Inventory
export const inventory = {
    getAll: async (params) => {
        const response = await api.get('/api/inventory', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/api/inventory/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/api/inventory', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/api/inventory/${id}`, data);
        return response.data;
    },

    getWarehouseSummary: async (warehouseId) => {
        const response = await api.get(`/api/inventory/warehouse/${warehouseId}/summary`);
        return response.data;
    },
};

// Warehouses
export const warehouses = {
    getAll: async () => {
        const response = await api.get('/api/warehouses');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/api/warehouses/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/api/warehouses', data);
        return response.data;
    },
};

// Demand Forecasting
export const demand = {
    forecast: async (data) => {
        const response = await api.post('/api/demand/forecast', data);
        return response.data;
    },

    getHistorical: async (sku, params) => {
        const response = await api.get(`/api/demand/historical/${sku}`, { params });
        return response.data;
    },
};

// Routes
export const routes = {
    optimize: async (data) => {
        const response = await api.post('/api/routes/optimize', data);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/api/routes/create', data);
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/api/routes/${id}`);
        return response.data;
    },

    getByDriver: async (driverId, status) => {
        const response = await api.get(`/api/routes/driver/${driverId}`, {
            params: { status },
        });
        return response.data;
    },
};

// AI Recommendations
export const aiRecommendations = {
    get: async (data) => {
        const response = await api.post('/api/ai/recommendations', data);
        return response.data;
    },
};

// Anomalies
export const anomalies = {
    detectDemand: async (params) => {
        const response = await api.get('/api/anomalies/detect/demand', { params });
        return response.data;
    },

    detectInventory: async (params) => {
        const response = await api.get('/api/anomalies/detect/inventory', { params });
        return response.data;
    },

    getRecent: async (limit = 50) => {
        const response = await api.get('/api/anomalies/recent', {
            params: { limit },
        });
        return response.data;
    },

    resolve: async (id) => {
        const response = await api.put(`/api/anomalies/${id}/resolve`);
        return response.data;
    },
};

export default api;
