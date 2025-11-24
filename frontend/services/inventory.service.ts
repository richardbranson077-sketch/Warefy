/**
 * Inventory Service
 * Handles all inventory-related API calls
 */

import apiClient from '@/lib/api';

export interface InventoryItem {
    id: number;
    sku: string;
    name: string;
    quantity: number;
    warehouse_id: number;
    reorder_point: number;
    unit_price: number | null;
    category?: string;
    location?: string;
}

export interface CreateInventoryItem {
    sku: string;
    name: string;
    quantity: number;
    warehouse_id: number;
    reorder_point: number;
    unit_price?: number;
    category?: string;
    location?: string;
}

export interface UpdateInventoryItem {
    sku?: string;
    name?: string;
    quantity?: number;
    warehouse_id?: number;
    reorder_point?: number;
    unit_price?: number;
    category?: string;
    location?: string;
}

export const inventoryService = {
    /**
     * Get all inventory items
     */
    getAll: async (params?: { warehouse_id?: number; sku?: string }) => {
        const response = await apiClient.get<InventoryItem[]>('/inventory', { params });
        return response.data;
    },

    /**
     * Get inventory item by ID
     */
    getById: async (id: number) => {
        const response = await apiClient.get<InventoryItem>(`/inventory/${id}`);
        return response.data;
    },

    /**
     * Create new inventory item
     */
    create: async (data: CreateInventoryItem) => {
        const response = await apiClient.post<InventoryItem>('/inventory', data);
        return response.data;
    },

    /**
     * Update inventory item
     */
    update: async (id: number, data: UpdateInventoryItem) => {
        const response = await apiClient.put<InventoryItem>(`/inventory/${id}`, data);
        return response.data;
    },

    /**
     * Delete inventory item
     */
    delete: async (id: number) => {
        await apiClient.delete(`/inventory/${id}`);
    },

    /**
     * Get warehouse inventory summary
     */
    getWarehouseSummary: async (warehouseId: number) => {
        const response = await apiClient.get(`/inventory/warehouse/${warehouseId}/summary`);
        return response.data;
    },
};
