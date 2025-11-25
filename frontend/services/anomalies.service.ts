/**
 * Anomalies Service
 * Handles API calls for anomaly detection and alerts
 */

import apiClient from '@/lib/api';

export interface Anomaly {
    id: number;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    detectedAt: string;
    status: 'open' | 'investigating' | 'resolved';
    affectedResource: string;
}

export const anomaliesService = {
    /**
     * Get all anomalies
     */
    getAll: async (params?: { severity?: string; status?: string }) => {
        const response = await apiClient.get<Anomaly[]>('/api/v1/anomalies', { params });
        return response.data;
    },

    /**
     * Run anomaly detection
     */
    detectAnomalies: async () => {
        const response = await apiClient.post('/api/v1/anomalies/detect');
        return response.data;
    },

    /**
     * Update anomaly status
     */
    updateStatus: async (id: number, status: Anomaly['status']) => {
        const response = await apiClient.patch(`/api/v1/anomalies/${id}`, { status });
        return response.data;
    },
};
