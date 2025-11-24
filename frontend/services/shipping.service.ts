/**
 * Shipping Service
 * Handles API calls for shipping and carrier management
 */

import apiClient from '@/lib/api';

export interface ShipmentRate {
    carrier: string;
    service: string;
    rate: number;
    estimatedDays: number;
}

export interface Shipment {
    id: number;
    orderId: number;
    orderNumber?: string;
    carrier: 'fedex' | 'ups' | 'usps' | 'dhl';
    service: string;
    trackingNumber: string;
    status: 'pending' | 'in_transit' | 'delivered' | 'failed';
    labelUrl?: string;
    rate: number;
    weight?: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };
    fromAddress: Address;
    toAddress: Address;
    createdAt: string;
    deliveredAt?: string;
}

export interface Address {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone?: string;
}

export interface CreateShipment {
    orderId: number;
    carrier: string;
    service: string;
    weight: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };
    fromAddress: Address;
    toAddress: Address;
}

export const shippingService = {
    /**
     * Get all shipments
     */
    getAll: async (params?: { status?: string; carrier?: string }) => {
        const response = await apiClient.get<Shipment[]>('/shipping/shipments', { params });
        return response.data;
    },

    /**
     * Get shipment by ID
     */
    getById: async (id: number) => {
        const response = await apiClient.get<Shipment>(`/shipping/shipments/${id}`);
        return response.data;
    },

    /**
     * Get shipping rates
     */
    getRates: async (data: {
        weight: number;
        dimensions?: { length: number; width: number; height: number };
        fromZip: string;
        toZip: string;
    }) => {
        const response = await apiClient.post<ShipmentRate[]>('/shipping/rates', data);
        return response.data;
    },

    /**
     * Create shipment and generate label
     */
    createShipment: async (data: CreateShipment) => {
        const response = await apiClient.post<Shipment>('/shipping/shipments', data);
        return response.data;
    },

    /**
     * Track shipment
     */
    track: async (trackingNumber: string) => {
        const response = await apiClient.get(`/shipping/track/${trackingNumber}`);
        return response.data;
    },

    /**
     * Cancel shipment
     */
    cancel: async (id: number) => {
        const response = await apiClient.post(`/shipping/shipments/${id}/cancel`);
        return response.data;
    },
};
