/**
 * Shipping Service
 * Handles API calls for shipping and carrier management with AI features
 */

import apiClient from '@/lib/api';

export interface ShipmentRate {
    carrier: string;
    service_type: string;
    cost: number;
    estimated_days: number;
    estimated_delivery?: string;
    reliability_score: number;
}

export interface Shipment {
    id: number;
    order_id: number;
    tracking_number: string;
    carrier: string;
    service_type: string;
    status: string;
    label_url: string;
    cost: number;
    estimated_delivery?: string;
    origin?: string;
    destination?: string;
    created_at?: string;
    origin_coords?: { lat: number; lng: number };
    destination_coords?: { lat: number; lng: number };
    current_location?: { lat: number; lng: number; speed_kmh?: number };
}

export interface Address {
    name: string;
    company?: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
    email?: string;
}

export interface PackageDetails {
    weight: number;
    length: number;
    width: number;
    height: number;
    insurance_value?: number;
    contents_description?: string;
}

export interface CreateShipmentRequest {
    order_id: number;
    carrier: string;
    service_type: string;
    from_address: Address;
    to_address: Address;
    package: PackageDetails;
}

// AI Interfaces
export interface ETAPrediction {
    predicted_days: number;
    confidence_score: number;
    factors: string[];
    risk_level: 'low' | 'medium' | 'high';
    weather_impact?: string;
}

export interface SmartPackaging {
    recommended_box: string;
    fill_material: string;
    arrangement_strategy?: string;
    estimated_dim_weight: number;
    savings_potential: string;
}

export interface RiskAssessment {
    risk_score: number;
    alerts: Array<{
        type: string;
        severity: 'low' | 'medium' | 'high';
        message: string;
    }>;
    recommendation: string;
}

export interface ShippingAnalytics {
    cost_trend: Array<{ date: string; cost: number }>;
    carrier_distribution: Array<{ name: string; value: number }>;
    on_time_performance: number;
    avg_cost_per_shipment: number;
}

export const shippingService = {
    /**
     * Get all shipments
     */
    getAll: async (params?: { status?: string; carrier?: string }) => {
        const response = await apiClient.get<Shipment[]>('/api/v1/shipping/shipments', { params });
        return response.data;
    },

    /**
     * Get shipping rates
     */
    getRates: async (data: {
        from_address: Address;
        to_address: Address;
        package: PackageDetails;
        carriers?: string[];
    }) => {
        const response = await apiClient.post<ShipmentRate[]>('/api/v1/shipping/rates', data);
        return response.data;
    },

    /**
     * Create shipment
     */
    createShipment: async (data: CreateShipmentRequest) => {
        const response = await apiClient.post<Shipment>('/api/v1/shipping/shipments', data);
        return response.data;
    },

    // AI Features
    predictETA: async (data: { origin_zip: string; destination_zip: string; carrier: string; service_level: string }) => {
        const response = await apiClient.post<ETAPrediction>('/api/v1/shipping/predict-eta', data);
        return response.data;
    },

    getSmartPackaging: async (items: any[]) => {
        const response = await apiClient.post<SmartPackaging>('/api/v1/shipping/smart-packaging', { items });
        return response.data;
    },

    getRiskAssessment: async (data: { origin_zip: string; destination_zip: string }) => {
        const response = await apiClient.post<RiskAssessment>('/api/v1/shipping/risk-assessment', data);
        return response.data;
    },

    getAnalytics: async () => {
        const response = await apiClient.get<ShippingAnalytics>('/api/v1/shipping/analytics/fleet');
        return response.data;
    }
};
