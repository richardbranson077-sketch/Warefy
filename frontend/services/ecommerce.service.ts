/**
 * E-commerce Service
 * Handles API calls for e-commerce platform integration and synchronization
 */

import apiClient from '@/lib/api';

export interface EcommerceConnection {
    id: number;
    platform: string;
    store_name: string;
    is_active: boolean;
    last_order_sync: string | null;
    last_inventory_sync: string | null;
    created_at: string;
}

export interface ProductRecommendation {
    product_name: string;
    sku: string;
    confidence: number;
    reasoning: string;
    expected_revenue: number;
}

export interface PricingRecommendation {
    sku: string;
    current_price: number;
    recommended_price: number;
    confidence: number;
    reasoning: string;
    expected_impact: string;
}

export interface OrderAnalytics {
    total_orders: number;
    total_revenue: number;
    avg_order_value: number;
    top_products: Array<{ sku: string; quantity: number }>;
    trends: Array<{ period: string; orders: number; revenue: number }>;
    insights: string;
}

export interface SyncLog {
    id: number;
    platform: string;
    sync_type: string;
    status: string;
    records_processed: number;
    started_at: string;
    completed_at: string | null;
}

export const ecommerceService = {
    // Connections
    getConnections: async () => {
        const response = await apiClient.get<EcommerceConnection[]>('/api/v1/ecommerce/connections');
        return response.data;
    },

    connectPlatform: async (data: any) => {
        const response = await apiClient.post<EcommerceConnection>('/api/v1/ecommerce/connections', data);
        return response.data;
    },

    updateConnection: async (id: number, data: Partial<EcommerceConnection>) => {
        const response = await apiClient.patch<EcommerceConnection>(`/api/v1/ecommerce/connections/${id}`, data);
        return response.data;
    },

    deleteConnection: async (id: number) => {
        const response = await apiClient.delete(`/api/v1/ecommerce/connections/${id}`);
        return response.data;
    },

    // Sync
    syncOrders: async (connectionId: number) => {
        const response = await apiClient.post('/api/v1/ecommerce/sync/orders', { connection_id: connectionId });
        return response.data;
    },

    syncInventory: async (connectionId: number) => {
        const response = await apiClient.post('/api/v1/ecommerce/sync/inventory', { connection_id: connectionId });
        return response.data;
    },

    getSyncLogs: async (connectionId?: number) => {
        const params = connectionId ? { connection_id: connectionId } : {};
        const response = await apiClient.get<SyncLog[]>('/api/v1/ecommerce/sync-logs', { params });
        return response.data;
    },

    // AI Features
    getProductRecommendations: async (connectionId: number, customerSegment?: string) => {
        const response = await apiClient.post<ProductRecommendation[]>('/api/v1/ecommerce/ai-product-recommendations', {
            connection_id: connectionId,
            customer_segment: customerSegment
        });
        return response.data;
    },

    getPricingOptimization: async (connectionId: number) => {
        const response = await apiClient.post<PricingRecommendation[]>('/api/v1/ecommerce/ai-pricing', {
            connection_id: connectionId
        });
        return response.data;
    },

    getOrderAnalytics: async (connectionId: number) => {
        const response = await apiClient.get<OrderAnalytics>(`/api/v1/ecommerce/order-analytics?connection_id=${connectionId}`);
        return response.data;
    },
};
