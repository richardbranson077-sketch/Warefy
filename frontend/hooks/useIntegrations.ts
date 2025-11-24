import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export interface Integration {
    id: number;
    name: string;
    type: string;
    status: 'active' | 'inactive';
}

export function useIntegrations() {
    const [data, setData] = useState<Integration[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.get('/integrations');
            setData(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch integrations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { data, loading, error, refetch: fetchData };
}
