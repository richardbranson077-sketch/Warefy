import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export interface ERPSystem {
    id: number;
    name: string;
    status: 'connected' | 'disconnected';
}

export function useERP() {
    const [data, setData] = useState<{ systems: ERPSystem[]; totalSyncs: number; lastSyncTime: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.get('/api/v1/erp/status');
            setData(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch ERP data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { data, loading, error, refetch: fetchData };
}
