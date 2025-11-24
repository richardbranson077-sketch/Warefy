/**
 * Quality Service
 * Handles API calls for quality control and inspections
 */

import apiClient from '@/lib/api';

export interface Inspection {
    id: number;
    type: 'inbound' | 'outbound' | 'inventory' | 'production';
    referenceId: number; // Order ID, Shipment ID, etc.
    referenceNumber: string;
    inspectorId: number;
    inspectorName: string;
    status: 'pending' | 'in_progress' | 'passed' | 'failed' | 'conditional_pass';
    score: number;
    items: InspectionItem[];
    notes?: string;
    images?: string[];
    createdAt: string;
    completedAt?: string;
}

export interface InspectionItem {
    id: number;
    sku: string;
    productName: string;
    quantity: number;
    samplesChecked: number;
    defectsFound: number;
    defectType?: string;
    passed: boolean;
    notes?: string;
}

export interface Defect {
    id: number;
    sku: string;
    type: string;
    severity: 'minor' | 'major' | 'critical';
    description: string;
    detectedAt: string;
    status: 'open' | 'resolved' | 'investigating';
}

export interface QualityStats {
    passRate: number;
    defectRate: number;
    inspectionsToday: number;
    pendingInspections: number;
    topDefects: Array<{ type: string; count: number }>;
}

export const qualityService = {
    /**
     * Get all inspections
     */
    getAll: async (params?: { status?: string; type?: string }) => {
        const response = await apiClient.get<Inspection[]>('/quality/inspections', { params });
        return response.data;
    },

    /**
     * Get inspection by ID
     */
    getById: async (id: number) => {
        const response = await apiClient.get<Inspection>(`/quality/inspections/${id}`);
        return response.data;
    },

    /**
     * Create inspection
     */
    create: async (data: Partial<Inspection>) => {
        const response = await apiClient.post<Inspection>('/quality/inspections', data);
        return response.data;
    },

    /**
     * Update inspection
     */
    update: async (id: number, data: Partial<Inspection>) => {
        const response = await apiClient.put<Inspection>(`/quality/inspections/${id}`, data);
        return response.data;
    },

    /**
     * Get defects
     */
    getDefects: async (params?: { status?: string; severity?: string }) => {
        const response = await apiClient.get<Defect[]>('/quality/defects', { params });
        return response.data;
    },

    /**
     * Report defect
     */
    reportDefect: async (data: Partial<Defect>) => {
        const response = await apiClient.post<Defect>('/quality/defects', data);
        return response.data;
    },

    /**
     * Get quality statistics
     */
    getStats: async () => {
        const response = await apiClient.get<QualityStats>('/quality/stats');
        return response.data;
    },
};
