/**
 * Warehouses Service
 * Handles API calls for warehouse management
 */

import apiClient from '@/lib/api';

export interface Warehouse {
    id: number;
    name: string;
    location: string;
    capacity: number;
    currentUtilization?: number;
    layoutConfig?: any;
    address?: string;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    utilization?: number;
}

export interface CreateWarehouse {
    name: string;
    location: string;
    capacity: number;
    address?: string;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
}

export interface UpdateWarehouse {
    name?: string;
    location?: string;
    capacity?: number;
    layoutConfig?: any;
    address?: string;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    isActive?: boolean;
}

export interface WarehouseSummary {
    warehouseId: number;
    warehouseName: string;
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    utilizationPercentage: number;
}

export const warehousesService = {
    /**
     * Get all warehouses
     */
    getAll: async () => {
        const response = await apiClient.get<Warehouse[]>('/api/v1/warehouses');
        return response.data;
    },

    /**
     * Get warehouse by ID
     */
    getById: async (id: number) => {
        const response = await apiClient.get<Warehouse>(`/api/v1/warehouses/${id}`);
        return response.data;
    },

    /**
     * Create new warehouse
     */
    create: async (data: CreateWarehouse) => {
        const response = await apiClient.post<Warehouse>('/api/v1/warehouses', data);
        return response.data;
    },

    /**
     * Update warehouse
     */
    update: async (id: number, data: UpdateWarehouse) => {
        const response = await apiClient.put<Warehouse>(`/api/v1/warehouses/${id}`, data);
        return response.data;
    },

    /**
     * Delete warehouse
     */
    delete: async (id: number) => {
        await apiClient.delete(`/api/v1/warehouses/${id}`);
    },

    /**
     * Get warehouse summary/statistics
     */
    getSummary: async (id: number) => {
        const response = await apiClient.get<WarehouseSummary>(`/api/v1/inventory/warehouse/${id}/summary`);
        return response.data;
    },

    /**
     * Update warehouse layout
     */
    updateLayout: async (id: number, layout: any) => {
        const response = await apiClient.patch<Warehouse>(`/api/v1/warehouses/${id}/layout`, {
            layout_config: JSON.stringify(layout)
        });
        return response.data;
    },
};
