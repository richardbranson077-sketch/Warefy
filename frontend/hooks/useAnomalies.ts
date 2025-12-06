import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export interface Anomaly {
    id: number;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    status: 'detected' | 'investigating' | 'resolved';
    detectedAt: string;
    resolvedAt?: string;
}

export function useAnomalies() {
    const [data, setData] = useState<Anomaly[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.get('/api/v1/anomalies');
            setData(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch anomalies');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { data, loading, error, refetch: fetchData };
}
