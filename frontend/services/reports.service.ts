/**
 * Reports Service
 * Handles API calls for generating and retrieving reports
 */

import apiClient from '@/lib/api';

export interface Report {
    id: number;
    title: string;
    type: 'inventory' | 'sales' | 'financial' | 'labor' | 'custom';
    format: 'pdf' | 'csv' | 'excel';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    url?: string;
    parameters: Record<string, any>;
    createdAt: string;
    completedAt?: string;
    createdBy: number;
}

export interface CreateReport {
    title: string;
    type: Report['type'];
    format: Report['format'];
    parameters: Record<string, any>;
}

export interface ReportTemplate {
    id: number;
    name: string;
    description: string;
    type: Report['type'];
    defaultParameters: Record<string, any>;
}

export const reportsService = {
    /**
     * Get all reports
     */
    getAll: async (params?: { type?: string; status?: string }) => {
        const response = await apiClient.get<Report[]>('/reports', { params });
        return response.data;
    },

    /**
     * Get report by ID
     */
    getById: async (id: number) => {
        const response = await apiClient.get<Report>(`/reports/${id}`);
        return response.data;
    },

    /**
     * Generate new report
     */
    generate: async (data: CreateReport) => {
        const response = await apiClient.post<Report>('/api/v1/reports/generate', data);
        return response.data;
    },

    /**
     * Delete report
     */
    delete: async (id: number) => {
        await apiClient.delete(`/reports/${id}`);
    },

    /**
     * Get report templates
     */
    getTemplates: async () => {
        const response = await apiClient.get<ReportTemplate[]>('/api/v1/reports/templates');
        return response.data;
    },

    /**
     * Download report
     */
    download: async (id: number) => {
        const response = await apiClient.get(`/reports/${id}/download`, {
            responseType: 'blob'
        });
        return response.data;
    },
};
