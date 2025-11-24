import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export interface Block {
    id: number;
    hash: string;
    previousHash: string;
    timestamp: string;
    data: any;
}

export function useBlockchain() {
    const [data, setData] = useState<{ blocks: Block[]; totalTransactions: number; verifiedTransactions: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.get('/blockchain');
            setData(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch blockchain data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { data, loading, error, refetch: fetchData };
}
