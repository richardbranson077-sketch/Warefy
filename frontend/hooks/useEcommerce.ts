import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export function useEcommerce() {
    const [data, setData] = useState<{ totalOrders: number; totalRevenue: number; averageOrderValue: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.get('/api/v1/ecommerce/stats');
            setData(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch e-commerce data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { data, loading, error, refetch: fetchData };
}
