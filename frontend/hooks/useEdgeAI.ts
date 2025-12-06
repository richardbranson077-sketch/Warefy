import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export interface EdgeDevice {
    id: number;
    name: string;
    status: 'active' | 'inactive';
}

export function useEdgeAI() {
    const [data, setData] = useState<{ devices: EdgeDevice[]; totalInferences: number; averageLatency: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.get('/api/v1/edge-ai/models');
            setData(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch Edge AI data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { data, loading, error, refetch: fetchData };
}
