import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export function useFinancials() {
    const [data, setData] = useState<{ totalRevenue: number; totalExpenses: number; profitMargin: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.get('/financials');
            setData(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch financial data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { data, loading, error, refetch: fetchData };
}
