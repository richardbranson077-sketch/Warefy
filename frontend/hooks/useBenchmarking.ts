import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export interface Benchmark {
    id: number;
    metric: string;
    value: number;
    target: number;
    unit: string;
}

export function useBenchmarking() {
    const [data, setData] = useState<{ metrics: Benchmark[]; averageScore: number; topPerformer: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.get('/benchmarking');
            setData(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch benchmarks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { data, loading, error, refetch: fetchData };
}
