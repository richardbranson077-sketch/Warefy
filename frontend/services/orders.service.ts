/**
 * Orders Service
 * Handles API calls for order management
 */

import apiClient from '@/lib/api';

export interface Order {
    id: number;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    totalAmount: number;
    warehouseId: number;
    warehouseName?: string;
    items?: OrderItem[];
    shippingAddress?: string;
    trackingNumber?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface OrderItem {
    id: number;
    orderId: number;
    sku: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface CreateOrder {
    customerName: string;
    customerEmail: string;
    warehouseId: number;
    items: Array<{
        sku: string;
        quantity: number;
    }>;
    shippingAddress?: string;
}

export interface UpdateOrder {
    status?: Order['status'];
    trackingNumber?: string;
    shippingAddress?: string;
}

export const ordersService = {
    /**
     * Get all orders
     */
    getAll: async (params?: { status?: string; warehouseId?: number }) => {
        const response = await apiClient.get<Order[]>('/orders', { params });
        return response.data;
    },

    /**
     * Get order by ID
     */
    getById: async (id: number) => {
        const response = await apiClient.get<Order>(`/orders/${id}`);
        return response.data;
    },

    /**
     * Create new order
     */
    create: async (data: CreateOrder) => {
        const response = await apiClient.post<Order>('/orders', data);
        return response.data;
    },

    /**
     * Update order
     */
    update: async (id: number, data: UpdateOrder) => {
        const response = await apiClient.patch<Order>(`/orders/${id}`, data);
        return response.data;
    },

    /**
     * Delete order
     */
    delete: async (id: number) => {
        await apiClient.delete(`/orders/${id}`);
    },

    /**
     * Get order statistics
     */
    getStats: async () => {
        const response = await apiClient.get('/orders/stats');
        return response.data;
    },
};
