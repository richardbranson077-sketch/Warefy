/**
 * useDemand Hook
 * React hook for demand forecasting with loading states
 */

import { useState, useCallback } from 'react';
import { demandService, ForecastResult, HistoricalData } from '@/services/demand.service';
import { getErrorMessage } from '@/lib/api';

export function useDemand() {
    const [forecast, setForecast] = useState<ForecastResult | null>(null);
    const [historical, setHistorical] = useState<HistoricalData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getForecast = useCallback(async (sku: string, params?: {
        days?: number;
        model?: 'prophet' | 'lstm' | 'xgboost';
    }) => {
        try {
            setLoading(true);
            setError(null);
            const result = await demandService.getForecast(sku, params);
            setForecast(result);
            return result;
        } catch (err: any) {
            const errorMsg = getErrorMessage(err);
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, []);

    const getHistorical = useCallback(async (sku: string) => {
        try {
            setLoading(true);
            setError(null);
            const data = await demandService.getHistorical(sku);
            setHistorical(data);
            return data;
        } catch (err: any) {
            const errorMsg = getErrorMessage(err);
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, []);

    const getBulkForecasts = async (skus: string[], days: number = 30) => {
        try {
            setLoading(true);
            setError(null);
            const forecasts = await demandService.getBulkForecasts(skus, days);
            return forecasts;
        } catch (err: any) {
            const errorMsg = getErrorMessage(err);
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const getTrends = async () => {
        try {
            const trends = await demandService.getTrends();
            return trends;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    return {
        forecast,
        historical,
        loading,
        error,
        getForecast,
        getHistorical,
        getBulkForecasts,
        getTrends,
    };
}
