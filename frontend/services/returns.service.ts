/**
 * Returns Service
 * Handles API calls for returns/RMA management
 */

import apiClient from '@/lib/api';

export interface ReturnRequest {
    id: number;
    rmaNumber: string;
    orderId: number;
    orderNumber?: string;
    customerName: string;
    customerEmail: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'received' | 'refunded';
    items: ReturnItem[];
    refundAmount?: number;
    inspectionNotes?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface ReturnItem {
    id: number;
    sku: string;
    productName: string;
    quantity: number;
    condition?: 'new' | 'used' | 'damaged';
    reason: string;
}

export interface CreateReturn {
    orderId: number;
    customerName: string;
    customerEmail: string;
    reason: string;
    items: Array<{
        sku: string;
        quantity: number;
        reason: string;
    }>;
}

export interface UpdateReturn {
    status?: ReturnRequest['status'];
    inspectionNotes?: string;
    refundAmount?: number;
}

export const returnsService = {
    /**
     * Get all returns
     */
    getAll: async (params?: { status?: string }) => {
        const response = await apiClient.get<ReturnRequest[]>('/api/v1/returns', { params });
        return response.data;
    },

    /**
     * Get return by ID
     */
    getById: async (id: number) => {
        const response = await apiClient.get<ReturnRequest>(`/api/v1/returns/${id}`);
        return response.data;
    },

    /**
     * Create new return request
     */
    create: async (data: CreateReturn) => {
        const response = await apiClient.post<ReturnRequest>('/api/v1/returns', data);
        return response.data;
    },

    /**
     * Update return request
     */
    update: async (id: number, data: UpdateReturn) => {
        const response = await apiClient.patch<ReturnRequest>(`/api/v1/returns/${id}`, data);
        return response.data;
    },

    /**
     * Approve return
     */
    approve: async (id: number) => {
        const response = await apiClient.post<ReturnRequest>(`/api/v1/returns/${id}/approve`);
        return response.data;
    },

    /**
     * Reject return
     */
    reject: async (id: number, reason: string) => {
        const response = await apiClient.post<ReturnRequest>(`/api/v1/returns/${id}/reject`, { reason });
        return response.data;
    },

    /**
     * Process refund
     */
    processRefund: async (id: number, amount: number) => {
        const response = await apiClient.post<ReturnRequest>(`/api/v1/returns/${id}/refund`, { amount });
        return response.data;
    },
};
