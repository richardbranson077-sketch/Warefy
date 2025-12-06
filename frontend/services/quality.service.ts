/**
 * Quality Control Service
 * Handles API calls for inspections, defects, and supplier quality
 */

import apiClient from '@/lib/api';

export interface InspectionChecklistItem {
    item_name: string;
    passed: boolean;
    notes?: string;
}

export interface QualityInspection {
    id?: number;
    inspection_type: 'receiving' | 'picking' | 'packing' | 'shipping';
    sku: string;
    quantity_inspected: number;
    checklist: InspectionChecklistItem[];
    overall_result: 'pass' | 'fail' | 'conditional';
    inspector_id?: number;
    photos?: string[];
    created_at?: string;
}

export interface DefectReport {
    id?: number;
    sku: string;
    defect_type: 'damaged' | 'wrong_item' | 'missing_parts' | 'quality_issue';
    severity: 'minor' | 'major' | 'critical';
    quantity_affected: number;
    supplier: string;
    description: string;
    photos?: string[];
    status?: 'open' | 'resolved' | 'investigating';
    reported_at?: string;
    resolution_notes?: string;
}

export interface SupplierScore {
    supplier: string;
    quality_score: number;
    total_inspections: number;
    passed_inspections: number;
    failed_inspections: number;
    total_defects: number;
    critical_defects: number;
    rating: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface DefectTrends {
    period_days: number;
    total_defects: number;
    defect_by_type: Record<string, number>;
    defect_by_severity: Record<string, number>;
    top_defect_type: string | null;
}

export const qualityService = {
    /**
     * Get all inspections
     */
    getInspections: async (type?: string, result?: string) => {
        const params = new URLSearchParams();
        if (type) params.append('inspection_type', type);
        if (result) params.append('result', result);

        const response = await apiClient.get<QualityInspection[]>(`/api/v1/quality/inspections?${params.toString()}`);
        return response.data;
    },

    /**
     * Create a new inspection
     */
    createInspection: async (data: QualityInspection) => {
        const response = await apiClient.post('/api/v1/quality/inspection', data);
        return response.data;
    },

    /**
     * Get all defects
     */
    getDefects: async (status?: string, severity?: string) => {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (severity) params.append('severity', severity);

        const response = await apiClient.get<DefectReport[]>(`/api/v1/quality/defects?${params.toString()}`);
        return response.data;
    },

    /**
     * Report a defect
     */
    reportDefect: async (data: DefectReport) => {
        const response = await apiClient.post('/api/v1/quality/defect', data);
        return response.data;
    },

    /**
     * Update defect status
     */
    updateDefectStatus: async (id: number, status: string, notes?: string) => {
        const response = await apiClient.put(`/api/v1/quality/defects/${id}`, null, {
            params: { status, resolution_notes: notes }
        });
        return response.data;
    },

    /**
     * Get supplier quality score
     */
    getSupplierScore: async (supplier: string) => {
        const response = await apiClient.get<SupplierScore>(`/api/v1/quality/supplier-quality/${supplier}`);
        return response.data;
    },

    /**
     * Get defect trends
     */
    getDefectTrends: async (days: number = 30) => {
        const response = await apiClient.get<DefectTrends>(`/api/v1/quality/analytics/defect-trends?days=${days}`);
        return response.data;
    }
};
