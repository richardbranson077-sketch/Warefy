import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export interface Forecast {
    id: number;
    period: string;
    predictedValue: number;
    accuracy: number;
}

export function useForecasting() {
    const [data, setData] = useState<Forecast[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.get('/api/v1/forecasting');
            setData(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch forecasts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { data, loading, error, refetch: fetchData };
}
