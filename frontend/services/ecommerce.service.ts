/**
 * E-commerce Service
 * Handles API calls for e-commerce platform integration and synchronization
 */

import apiClient from '@/lib/api';

export interface EcommerceSyncStatus {
    platform: string;
    lastSync: string;
    status: 'connected' | 'syncing' | 'error' | 'disconnected';
    itemsSynced: number;
    errors: number;
}

export const ecommerceService = {
    /**
     * Get sync status
     */
    getSyncStatus: async () => {
        const response = await apiClient.get<EcommerceSyncStatus>('/api/v1/ecommerce/sync');
        return response.data;
    },

    /**
     * Start synchronization
     */
    startSync: async () => {
        const response = await apiClient.post('/api/v1/ecommerce/sync/start');
        return response.data;
    },

    /**
     * Get synced products
     */
    getProducts: async () => {
        const response = await apiClient.get('/api/v1/ecommerce/products');
        return response.data;
    },
};
