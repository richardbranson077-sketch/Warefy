/**
 * Demand Forecasting Service
 * Handles API calls for demand forecasting and predictions
 */

import apiClient from '@/lib/api';

export interface ForecastResult {
    sku: string;
    productName: string;
    predictions: Array<{
        date: string;
        quantity: number;
        confidence_low?: number;
        confidence_high?: number;
    }>;
    model: 'gemini-ai' | 'gemini' | 'prophet' | 'lstm' | 'statistical';
    accuracy_estimate?: number;
    mape?: number;
    seasonality_score?: number;
    trend?: 'increasing' | 'decreasing' | 'stable';
    scenario?: {
        promotion: boolean;
        price_change: number;
    };
    insights?: {
        seasonality: string;
        risks: string[];
        recommendations: string[];
    };
}

export interface HistoricalData {
    sku: string;
    data: Array<{
        date: string;
        quantity: number;
    }>;
}

export const demandService = {
    /**
     * Get list of products with sales data
     */
    getProducts: async () => {
        const response = await apiClient.get('/api/v1/demand/products');
        return response.data;
    },

    /**
     * Get forecast for a product
     */
    getForecast: async (sku: string, params?: {
        days?: number;
        model?: 'gemini' | 'prophet' | 'lstm';
        scenario?: {
            promotion: boolean;
            price_change: number;
        };
    }) => {
        const response = await apiClient.post<ForecastResult>('/api/v1/demand/forecast', {
            sku,
            ...params
        });
        return response.data;
    },

    /**
     * Get historical demand data
     */
    getHistorical: async (sku: string) => {
        const response = await apiClient.get<HistoricalData>(`/api/v1/demand/historical/${sku}`);
        return response.data;
    },

    /**
     * Get forecasts for multiple products
     */
    getBulkForecasts: async (skus: string[], days: number = 30) => {
        const response = await apiClient.post<ForecastResult[]>('/api/v1/demand/bulk-forecast', {
            skus,
            days
        });
        return response.data;
    },

    /**
     * Get demand trends
     */
    getTrends: async () => {
        const response = await apiClient.get('/api/v1/demand/trends');
        return response.data;
    },
};
