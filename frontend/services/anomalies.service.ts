/**
 * Anomalies Service
 * Handles API calls for anomaly detection and alerts
 */

import apiClient from '@/lib/api';

export interface Anomaly {
    id: number;
    anomalyType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    entityType: string;
    entityId: number;
    description: string;
    detectedAt: string;
    resolved: boolean;
    extraData?: Record<string, any>;
}

export interface AnomalyAnalysis {
    root_cause: string;
    impact: string;
    recommendations: string[];
}

export const anomaliesService = {
    /**
     * Get all anomalies
     */
    getAll: async (params?: { severity?: string; status?: string; resolved?: boolean }) => {
        const response = await apiClient.get<Anomaly[]>('/api/v1/anomalies', { params });
        return response.data;
    },

    /**
     * Run anomaly detection
     */
    detectAnomalies: async () => {
        // Run both demand and inventory detection
        await apiClient.get('/api/v1/anomalies/detect/demand');
        await apiClient.get('/api/v1/anomalies/detect/inventory');
        return true;
    },

    /**
     * Update anomaly status
     */
    resolve: async (id: number) => {
        const response = await apiClient.put(`/api/v1/anomalies/${id}/resolve`);
        return response.data;
    },

    /**
     * Analyze anomaly with AI
     */
    analyze: async (id: number): Promise<AnomalyAnalysis> => {
        const response = await apiClient.post<AnomalyAnalysis>(`/api/v1/anomalies/${id}/analyze`);
        return response.data;
    }
};
