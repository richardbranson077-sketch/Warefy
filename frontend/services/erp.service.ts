/**
 * ERP Service
 * Handles API calls for ERP system integration and synchronization
 */

import apiClient from '@/lib/api';

export interface ERPConnection {
    id: number;
    erp_type: string;
    company_id: string;
    is_active: boolean;
    last_sync: string | null;
    sync_frequency: string;
    created_at: string;
}

export interface MappingSuggestion {
    erp_field: string;
    warefy_field: string;
    confidence: number;
    reasoning: string;
}

export interface Discrepancy {
    id: string;
    type: string;
    item_id: string;
    erp_value: string;
    warefy_value: string;
    erp_source: string;
    detected_at: string;
}

export interface SyncLog {
    id: number;
    sync_type: string;
    direction: string;
    status: string;
    records_processed: number;
    records_failed: number;
    started_at: string;
    completed_at: string | null;
    error_details?: any;
}

export const erpService = {
    // Connections
    getConnections: async () => {
        const response = await apiClient.get<ERPConnection[]>('/api/v1/erp/connections');
        return response.data;
    },

    connectERP: async (data: any) => {
        const response = await apiClient.post<ERPConnection>('/api/v1/erp/connections', data);
        return response.data;
    },

    deleteConnection: async (id: number) => {
        const response = await apiClient.delete(`/api/v1/erp/connections/${id}`);
        return response.data;
    },

    // Sync
    triggerSync: async (connectionId: number, syncTypes: string[]) => {
        const response = await apiClient.post('/api/v1/erp/sync', { connection_id: connectionId, sync_types: syncTypes });
        return response.data;
    },

    getSyncLogs: async (connectionId?: number) => {
        const params = connectionId ? { connection_id: connectionId } : {};
        const response = await apiClient.get<SyncLog[]>('/api/v1/erp/sync-logs', { params });
        return response.data;
    },

    // AI & Discrepancies
    getAIMapping: async (erpFields: string[], warefyFields: string[]) => {
        const response = await apiClient.post<MappingSuggestion[]>('/api/v1/erp/ai-mapping', { erp_fields: erpFields, warefy_fields: warefyFields });
        return response.data;
    },

    getDiscrepancies: async () => {
        const response = await apiClient.get<Discrepancy[]>('/api/v1/erp/discrepancies');
        return response.data;
    },

    resolveDiscrepancy: async (id: string, resolution: string, manualValue?: string) => {
        const response = await apiClient.post('/api/v1/erp/resolve-discrepancy', { discrepancy_id: id, resolution, manual_value: manualValue });
        return response.data;
    }
};
