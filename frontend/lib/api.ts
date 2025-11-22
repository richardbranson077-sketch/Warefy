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
    login: async (username: string, password: string) => {
        // 1. Try real backend login first
        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            const response = await api.post('/api/auth/login', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.access_token) {
                localStorage.setItem('token', response.data.access_token);
                localStorage.setItem('username', username);
            }

            return response.data;
        } catch (error) {
            console.log('Backend login failed, checking demo credentials...');

            // 2. Demo mode fallback if backend fails
            if (username === 'demo@warefy.com' || username === 'demo' || username === 'admin') {
                if (password === 'demo123' || password === 'admin123') {
                    // Create a demo token
                    const demoToken = btoa(JSON.stringify({
                        username: username,
                        role: 'admin',
                        exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
                    }));

                    localStorage.setItem('token', demoToken);
                    localStorage.setItem('username', username);

                    return {
                        access_token: demoToken,
                        token_type: 'bearer'
                    };
                }
            }

            // If neither works, throw error
            throw new Error('Invalid credentials. Use demo/admin123 for demo access.');
        }
    },

    register: async (userData: any) => {
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
    getAll: async (params: any) => {
        const response = await api.get('/api/inventory', { params });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get(`/api/inventory/${id}`);
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post('/api/inventory', data);
        return response.data;
    },

    update: async (id: number, data: any) => {
        const response = await api.put(`/api/inventory/${id}`, data);
        return response.data;
    },

    getWarehouseSummary: async (warehouseId) => {
        const response = await api.get(`/api/inventory/warehouse/${warehouseId}/summary`);
        return response.data;
    },

    getByWarehouse: async (warehouseId: number) => {
        const response = await api.get('/api/inventory', {
            params: { warehouse_id: warehouseId },
        });
        return response.data;
    },
};

// Warehouses
export const warehouses = {
    getAll: async () => {
        const response = await api.get('/api/warehouses');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get(`/api/warehouses/${id}`);
        return response.data;
    },

    create: async (data: any) => {
        const resp = await api.post('/api/warehouses', data);
        return resp.data;
    },

    updateLayout: async (id: number, layout: any) => {
        const resp = await api.patch(`/api/warehouses/${id}/layout`, { layout_config: JSON.stringify(layout) });
        return resp.data;
    },
};

// Demand Forecasting
export const demand = {
    getForecast: async (sku: string, params: any) => {
        const response = await api.post('/api/demand/forecast', { sku, ...params });
        return response.data;
    },

    getHistorical: async (sku: string) => {
        const response = await api.get(`/api/demand/historical/${sku}`);
        return response.data;
    },
};

// Routes
export const routes = {
    optimize: async (data: any) => {
        const response = await api.post('/api/routes/optimize', data);
        return response.data;
    },

    getOptimized: async (params: any) => {
        const response = await api.get('/api/routes/optimized', { params });
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
};

// AI Recommendations
export const aiRecommendations = {
    get: async (data) => {
        const response = await api.post('/api/ai/recommendations', data);
        return response.data;
    },
};

// AI Command Center
export const ai = {
    command: async (prompt: string) => {
        const response = await api.post('/api/ai/command', { prompt });
        return response.data;
    },
};

// Anomalies
export const anomalies = {
    detect: async (data: any) => {
        const response = await api.post('/api/anomalies/detect', data);
        return response.data;
    },

    detectInventory: async (id: number) => {
        const response = await api.get(`/api/anomalies/detect/inventory/${id}`);
        return response.data;
    },

    getRecent: async (driverId: number, status: string) => {
        const response = await api.get('/api/anomalies/recent', {
            params: { driver_id: driverId, status },
        });
        return response.data;
    },

    resolve: async (data: any) => {
        const response = await api.put('/api/anomalies/resolve', data);
        return response.data;
    },
};

// Vehicles
export const vehicles = {
    getAll: async (params: any) => {
        const response = await api.get('/api/vehicles', { params });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get(`/api/vehicles/${id}`);
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post('/api/vehicles', data);
        return response.data;
    },
};

// ------------------------------------------------------------------
// Users – admin only
// ------------------------------------------------------------------
export const getAllUsers = async () => {
    const resp = await api.get('/api/users/');
    return resp.data;
};

export const updateUser = async (userId: number, payload: any) => {
    const resp = await api.patch(`/api/users/${userId}`, payload);
    return resp.data;
};

export const getUserUsage = async (userId: number) => {
    const resp = await api.get(`/api/users/${userId}/usage`);
    return resp.data;
};

export const getAuditLogs = async (limit: number = 50) => {
    const resp = await api.get(`/api/users/audit/logs`, { params: { limit } });
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
    const resp = await api.post('/api/notifications/push', payload);
    return resp.data;
};

export const sendEmail = async (payload: {
    to: string;
    subject: string;
    body: string;
    html?: string;
}) => {
    const resp = await api.post('/api/notifications/email', payload);
    return resp.data;
};

export const sendSMS = async (payload: {
    to: string;
    message: string;
}) => {
    const resp = await api.post('/api/notifications/sms', payload);
    return resp.data;
};

// ------------------------------------------------------------------
// Orders
// ------------------------------------------------------------------
export const orders = {
    getAll: async (params?: any) => {
        const resp = await api.get('/api/orders', { params });
        return resp.data;
    },
    getById: async (id: number) => {
        const resp = await api.get(`/api/orders/${id}`);
        return resp.data;
    },
    create: async (data: any) => {
        const resp = await api.post('/api/orders', data);
        return resp.data;
    },
    update: async (id: number, data: any) => {
        const resp = await api.patch(`/api/orders/${id}`, data);
        return resp.data;
    }
};

// ------------------------------------------------------------------
// Reports
// ------------------------------------------------------------------
export const reports = {
    getDashboardStats: async () => {
        const resp = await api.get('/api/reports/dashboard');
        return resp.data;
    }
};

// ------------------------------------------------------------------
// Integrations
// ------------------------------------------------------------------
export const integrations = {
    getAll: async () => {
        const resp = await api.get('/api/integrations/');
        return resp.data;
    },
    create: async (data: any) => {
        const resp = await api.post('/api/integrations/', data);
        return resp.data;
    },
    delete: async (id: number) => {
        const resp = await api.delete(`/api/integrations/${id}`);
        return resp.data;
    }
};

export default api;
