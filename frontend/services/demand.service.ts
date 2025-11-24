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
        predictedDemand: number;
        confidence: number;
    }>;
    model: 'prophet' | 'lstm' | 'xgboost';
    accuracy?: number;
    trend?: 'increasing' | 'decreasing' | 'stable';
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
     * Get forecast for a product
     */
    getForecast: async (sku: string, params?: {
        days?: number;
        model?: 'prophet' | 'lstm' | 'xgboost';
    }) => {
        const response = await apiClient.post<ForecastResult>('/demand/forecast', {
            sku,
            ...params
        });
        return response.data;
    },

    /**
     * Get historical demand data
     */
    getHistorical: async (sku: string) => {
        const response = await apiClient.get<HistoricalData>(`/demand/historical/${sku}`);
        return response.data;
    },

    /**
     * Get forecasts for multiple products
     */
    getBulkForecasts: async (skus: string[], days: number = 30) => {
        const response = await apiClient.post<ForecastResult[]>('/demand/bulk-forecast', {
            skus,
            days
        });
        return response.data;
    },

    /**
     * Get demand trends
     */
    getTrends: async () => {
        const response = await apiClient.get('/demand/trends');
        return response.data;
    },
};
