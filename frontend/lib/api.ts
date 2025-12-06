/**
 * API client for Warefy backend.
 * Handles all HTTP requests to the FastAPI backend.
 */

import axios from 'axios';

// ALWAYS use HTTPS except on localhost
const API_URL = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8000'
    : 'https://warefy-production.up.railway.app';

console.log('🔧 API URL:', API_URL, '| Host:', typeof window !== 'undefined' ? window.location.hostname : 'SSR');

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

    // Handle 401 Unauthorized globally
    api.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response && error.response.status === 401) {
                // Clear token and redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
            return Promise.reject(error);
        }
    );
}

// Authentication
export const auth = {
    login: async (username: string, password: string) => {
        console.log("API: login called for", username);
        // 1. Try real backend login first
        try {
            // Use URLSearchParams for application/x-www-form-urlencoded
            const params = new URLSearchParams();
            params.append('username', username);
            params.append('password', password);

            console.log("API: Sending POST to /api/v1/auth/login");
            const response = await api.post('/api/v1/auth/login', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            console.log("API: Backend response", response.status, response.data);

            if (response.data.access_token) {
                localStorage.setItem('token', response.data.access_token);
                localStorage.setItem('username', username);
            }

            return response.data;
        } catch (error: any) {
            console.error("API: Backend login failed", error);
            const message = error.response?.data?.detail || error.message || 'Login failed';
            throw new Error(message);
        }
    },

    register: async (userData: any) => {
        const response = await api.post('/api/v1/auth/register', userData);
        return response.data;
    },

    getCurrentUser: async () => {
        try {
            const response = await api.get('/api/v1/auth/me');
            return response.data;
        } catch (error) {
            // Fallback to demo user if backend fails
            const username = localStorage.getItem('username');
            if (username) {
                return { username, role: 'admin' };
            }
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
    },
};

// Inventory
export const inventory = {
    getAll: async (params: any) => {
        const response = await api.get('/api/v1/inventory', { params });
        return response.data;
    },

    getInventory: async (warehouseId?: number) => {
        const params = warehouseId ? { warehouse_id: warehouseId } : {};
        const response = await api.get('/api/v1/inventory', { params });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get(`/api/v1/inventory/${id}`);
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post('/api/v1/inventory', data);
        return response.data;
    },

    update: async (id: number, data: any) => {
        const response = await api.put(`/api/v1/inventory/${id}`, data);
        return response.data;
    },

    getWarehouseSummary: async (warehouseId: number) => {
        const response = await api.get(`/api/v1/inventory/warehouse/${warehouseId}/summary`);
        return response.data;
    },

    getByWarehouse: async (warehouseId: number) => {
        const response = await api.get('/api/v1/inventory', {
            params: { warehouse_id: warehouseId },
        });
        return response.data;
    },
};

// Warehouses
export const warehouses = {
    getAll: async () => {
        const response = await api.get('/api/v1/warehouses');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get(`/api/v1/warehouses/${id}`);
        return response.data;
    },

    create: async (data: any) => {
        const resp = await api.post('/api/v1/warehouses', data);
        return resp.data;
    },

    updateLayout: async (id: number, layout: any) => {
        const resp = await api.patch(`/api/v1/warehouses/${id}/layout`, { layout_config: JSON.stringify(layout) });
        return resp.data;
    },
};

// Demand Forecasting
export const demand = {
    getForecast: async (sku: string, params: any) => {
        const response = await api.post('/api/v1/demand/forecast', { sku, ...params });
        return response.data;
    },

    getHistorical: async (sku: string) => {
        const response = await api.get(`/api/v1/demand/historical/${sku}`);
        return response.data;
    },
};

// Routes
export const routes = {
    optimize: async (data: any) => {
        const response = await api.post('/api/v1/routes/optimize', data);
        return response.data;
    },

    getOptimized: async (params: any) => {
        const response = await api.get('/api/v1/routes/optimized', { params });
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post('/api/v1/routes/create', data);
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get(`/api/v1/routes/${id}`);
        return response.data;
    },
};

// AI Recommendations
export const aiRecommendations = {
    get: async (data) => {
        const response = await api.post('/api/v1/ai/recommendations', data);
        return response.data;
    },
};

// AI Command Center
export const ai = {
    command: async (prompt: string, history: any[] = []) => {
        const response = await api.post('/api/v1/ai/command', { prompt, history });
        return response.data;
    },
};

// Anomalies
export const anomalies = {
    detect: async (data: any) => {
        const response = await api.post('/api/v1/anomalies/detect', data);
        return response.data;
    },

    detectInventory: async (id: number) => {
        const response = await api.get(`/api/v1/anomalies/detect/inventory/${id}`);
        return response.data;
    },

    getRecent: async (driverId: number, status: string) => {
        const response = await api.get('/api/v1/anomalies/recent', {
            params: { driver_id: driverId, status },
        });
        return response.data;
    },

    resolve: async (data: any) => {
        const response = await api.put('/api/v1/anomalies/resolve', data);
        return response.data;
    },
};

// Vehicles
export const vehicles = {
    getAll: async (params: any) => {
        const response = await api.get('/api/v1/vehicles', { params });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get(`/api/v1/vehicles/${id}`);
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post('/api/v1/vehicles', data);
        return response.data;
    },
};

// ------------------------------------------------------------------
// Users – admin only
// ------------------------------------------------------------------
export const getAllUsers = async () => {
    const resp = await api.get('/api/v1/users/');
    return resp.data;
};

export const updateUser = async (userId: number, payload: any) => {
    const resp = await api.patch(`/api/v1/users/${userId}`, payload);
    return resp.data;
};

export const getUserUsage = async (userId: number) => {
    const resp = await api.get(`/api/v1/users/${userId}/usage`);
    return resp.data;
};

export const getAuditLogs = async (limit: number = 50) => {
    const resp = await api.get(`/api/v1/users/audit/logs`, { params: { limit } });
    return resp.data;
};

// ------------------------------------------------------------------
// Notifications helpers
// ------------------------------------------------------------------
export const sendPush = async (payload: {
    title: string;
    body: string;
    device_token?: string;
    topic?: string;
}) => {
    const resp = await api.post('/api/v1/notifications/push', payload);
    return resp.data;
};

export const sendEmail = async (payload: {
    to: string;
    subject: string;
    body: string;
    html?: string;
}) => {
    const resp = await api.post('/api/v1/notifications/email', payload);
    return resp.data;
};

export const sendSMS = async (payload: {
    to: string;
    message: string;
}) => {
    const resp = await api.post('/api/v1/notifications/sms', payload);
    return resp.data;
};

// ------------------------------------------------------------------
// Orders
// ------------------------------------------------------------------
export const orders = {
    getAll: async (params?: any) => {
        const resp = await api.get('/api/v1/orders', { params });
        return resp.data;
    },
    getById: async (id: number) => {
        const resp = await api.get(`/api/v1/orders/${id}`);
        return resp.data;
    },
    create: async (data: any) => {
        const resp = await api.post('/api/v1/orders', data);
        return resp.data;
    },
    update: async (id: number, data: any) => {
        const resp = await api.patch(`/api/v1/orders/${id}`, data);
        return resp.data;
    }
};

// ------------------------------------------------------------------
// Reports
// ------------------------------------------------------------------
export const reports = {
    getDashboardStats: async () => {
        const resp = await api.get('/api/v1/reports/dashboard');
        return resp.data;
    }
};

// ------------------------------------------------------------------
// Integrations
// ------------------------------------------------------------------
export const integrations = {
    getAll: async () => {
        const resp = await api.get('/api/v1/integrations/');
        return resp.data;
    },
    create: async (data: any) => {
        const resp = await api.post('/api/v1/integrations/', data);
        return resp.data;
    },
    delete: async (id: number) => {
        const resp = await api.delete(`/api/v1/integrations/${id}`);
        return resp.data;
    }
};

// Error message utility
export function getErrorMessage(error: any): string {
    if (error.response?.data?.detail) {
        return error.response.data.detail;
    }
    if (error.message) {
        return error.message;
    }
    return 'An unexpected error occurred';
}

// Named export for new hooks
export const apiClient = api;

export default api;
