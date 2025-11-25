/**
 * Integrations Service
 * Handles API calls for third-party integrations management
 */

import apiClient from '@/lib/api';

export interface Integration {
    id: number;
    name: string;
    type: string;
    status: 'connected' | 'disconnected' | 'error';
    lastSync: string;
    config: Record<string, any>;
}

export const integrationsService = {
    /**
     * Get all integrations
     */
    getAll: async () => {
        const response = await apiClient.get<Integration[]>('/api/v1/integrations');
        return response.data;
    },

    /**
     * Connect to an integration
     */
    connect: async (id: number, config: Record<string, any>) => {
        const response = await apiClient.post(`/api/v1/integrations/${id}/connect`, config);
        return response.data;
    },

    /**
     * Disconnect from an integration
     */
    disconnect: async (id: number) => {
        const response = await apiClient.post(`/api/v1/integrations/${id}/disconnect`);
        return response.data;
    },
};
