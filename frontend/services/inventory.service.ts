/**
 * Inventory Service
 * Handles all inventory-related API calls
 */

import apiClient from '@/lib/api';

export interface InventoryItem {
    id: number;
    sku: string;
    productName: string;
    quantity: number;
    warehouseId: number;
    reorderPoint: number;
    unitPrice: number;
    category?: string;
    location?: string;
    supplier?: string;
}

export interface CreateInventoryItem {
    sku: string;
    productName: string;
    quantity: number;
    warehouseId: number;
    reorderPoint: number;
    unitPrice?: number;
    category?: string;
    location?: string;
}

export interface UpdateInventoryItem {
    sku?: string;
    productName?: string;
    quantity?: number;
    warehouseId?: number;
    reorderPoint?: number;
    unitPrice?: number;
    category?: string;
    location?: string;
}

export const inventoryService = {
    /**
     * Get all inventory items
     */
    getAll: async (params?: { warehouse_id?: number; sku?: string }) => {
        const response = await apiClient.get<InventoryItem[]>('/api/v1/inventory', { params });
        return response.data;
    },

    /**
     * Get inventory item by ID
     */
    getById: async (id: number) => {
        const response = await apiClient.get<InventoryItem>(`/api/v1/inventory/${id}`);
        return response.data;
    },

    /**
     * Create new inventory item
     */
    create: async (data: CreateInventoryItem) => {
        const response = await apiClient.post<InventoryItem>('/api/v1/inventory', data);
        return response.data;
    },

    /**
     * Update inventory item
     */
    update: async (id: number, data: UpdateInventoryItem) => {
        const response = await apiClient.put<InventoryItem>(`/api/v1/inventory/${id}`, data);
        return response.data;
    },

    /**
     * Delete inventory item
     */
    delete: async (id: number) => {
        await apiClient.delete(`/api/v1/inventory/${id}`);
    },

    /**
     * Get warehouse inventory summary
     */
    getWarehouseSummary: async (warehouseId: number) => {
        const response = await apiClient.get(`/api/v1/inventory/warehouse/${warehouseId}/summary`);
        return response.data;
    },

    /**
     * Adjust stock level
     */
    adjustStock: async (id: number, changeAmount: number, reason: string) => {
        const response = await apiClient.post<InventoryItem>(`/api/v1/inventory/${id}/adjust`, {
            change_amount: changeAmount,
            reason
        });
        return response.data;
    },

    /**
     * Get stock history
     */
    getHistory: async (id: number) => {
        const response = await apiClient.get<any[]>(`/api/v1/inventory/${id}/history`);
        return response.data;
    }
};
