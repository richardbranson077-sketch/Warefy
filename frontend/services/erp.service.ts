/**
 * ERP Service
 * Handles API calls for ERP system integration and synchronization
 */

import apiClient from '@/lib/api';

export interface ERPSyncStatus {
    system: string;
    lastSync: string;
    status: 'connected' | 'syncing' | 'error' | 'disconnected';
    recordsSynced: number;
    errors: number;
}

export const erpService = {
    /**
     * Get sync status
     */
    getSyncStatus: async () => {
        const response = await apiClient.get<ERPSyncStatus>('/api/v1/erp/sync');
        return response.data;
    },

    /**
     * Start synchronization
     */
    startSync: async () => {
        const response = await apiClient.post('/api/v1/erp/sync/start');
        return response.data;
    },

    /**
     * Get synced data
     */
    getSyncedData: async () => {
        const response = await apiClient.get('/api/v1/erp/data');
        return response.data;
    },
};
