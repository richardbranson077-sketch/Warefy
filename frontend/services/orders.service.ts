/**
 * Orders Service
 * Handles API calls for order management
 */

import apiClient from '@/lib/api';

export interface Order {
    id: number;
    customer_name: string;
    customerName: string; // Alias for compatibility
    customer_email: string;
    customerEmail: string; // Alias for compatibility
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    total_amount: number;
    totalAmount: number; // Alias for compatibility
    shipping_address?: string;
    shippingAddress?: string; // Alias for compatibility
    tracking_number?: string;
    trackingNumber?: string; // Alias for compatibility
    created_at: string;
    createdAt: string; // Alias for compatibility
    updated_at?: string;
    updatedAt?: string; // Alias for compatibility
    items?: OrderItem[];
}

export interface OrderItem {
    id: number;
    order_id: number;
    sku: string;
    quantity: number;
    unit_price: number;
}

export interface CreateOrder {
    customer_name: string;
    customer_email: string;
    shipping_address?: string;
    items: Array<{
        sku: string;
        quantity: number;
        unit_price?: number;
    }>;
}

export interface UpdateOrder {
    status?: Order['status'];
    tracking_number?: string;
    shipping_address?: string;
}

// Helper function to normalize order data from backend
function normalizeOrder(order: any): Order {
    return {
        ...order,
        // Add camelCase aliases
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        totalAmount: order.total_amount,
        shippingAddress: order.shipping_address,
        trackingNumber: order.tracking_number,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
    };
}

export const ordersService = {
    /**
     * Get all orders
     */
    getAll: async (params?: { status?: string; warehouseId?: number }) => {
        const response = await apiClient.get<any[]>('/api/v1/orders', { params });
        // Normalize each order
        return response.data.map(normalizeOrder);
    },

    /**
     * Get order by ID
     */
    getById: async (id: number) => {
        const response = await apiClient.get<any>(`/api/v1/orders/${id}`);
        return normalizeOrder(response.data);
    },

    /**
     * Create new order
     */
    create: async (data: CreateOrder) => {
        // Format data for backend (ensure all required fields are present)
        const formattedData = {
            customer_name: data.customer_name,
            customer_email: data.customer_email,
            shipping_address: data.shipping_address || '',
            status: 'pending',
            items: data.items.map(item => ({
                sku: item.sku,
                quantity: item.quantity,
                unit_price: item.unit_price || 0 // Default to 0 if not provided
            }))
        };

        const response = await apiClient.post<any>('/api/v1/orders', formattedData);
        return normalizeOrder(response.data);
    },

    /**
     * Update order
     */
    update: async (id: number, data: UpdateOrder) => {
        const response = await apiClient.patch<any>(`/api/v1/orders/${id}`, data);
        return normalizeOrder(response.data);
    },

    /**
     * Delete order
     */
    delete: async (id: number) => {
        await apiClient.delete(`/api/v1/orders/${id}`);
    },

    /**
     * Get order statistics
     */
    getStats: async () => {
        const response = await apiClient.get('/api/v1/orders/stats');
        return response.data;
    },
};
