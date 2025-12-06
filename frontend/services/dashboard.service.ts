/**
 * Dashboard Service
 * Handles API calls for dashboard metrics and statistics
 */

import apiClient from '@/lib/api';

export interface DashboardMetrics {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalRevenue: number;
    lowStockItems: number;
    totalInventoryValue: number;
    activeShipments: number;
    warehouseUtilization: number;
    recentOrders: Array<{
        id: number;
        orderNumber: string;
        customer: string;
        total: number;
        status: string;
        date: string;
    }>;
    inventoryAlerts: Array<{
        id: number;
        sku: string;
        name: string;
        currentStock: number;
        reorderPoint: number;
        warehouse: string;
    }>;
    revenueData: Array<{
        date: string;
        revenue: number;
    }>;
    ordersByStatus: {
        pending: number;
        processing: number;
        shipped: number;
        delivered: number;
        cancelled: number;
    };
}

export const dashboardService = {
    /**
     * Get dashboard metrics and statistics
     */
    getMetrics: async (): Promise<DashboardMetrics> => {
        const response = await apiClient.get<DashboardMetrics>('/api/v1/reports/dashboard');
        return response.data;
    },

    /**
     * Get real-time statistics
     */
    getRealTimeStats: async () => {
        const response = await apiClient.get('/api/v1/reports/realtime-stats');
        return response.data;
    },

    /**
     * Get performance metrics
     */
    getPerformanceMetrics: async (period: 'day' | 'week' | 'month' | 'year' = 'month') => {
        const response = await apiClient.get('/api/v1/reports/performance', {
            params: { period }
        });
        return response.data;
    },

    /**
     * Get live activity feed
     */
    getLiveFeed: async (limit: number = 10) => {
        const response = await apiClient.get(`/api/v1/reports/live-feed?limit=${limit}`);
        return response.data;
    },

    getTopProducts: async (limit: number = 5, periodDays: number = 30) => {
        const response = await apiClient.get(`/api/v1/reports/top-products?limit=${limit}&period_days=${periodDays}`);
        return response.data;
    }
};
