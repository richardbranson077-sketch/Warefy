/**
 * useReturns Hook
 * React hook for returns/RMA data with loading states and error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { returnsService, ReturnRequest, CreateReturn, UpdateReturn } from '@/services/returns.service';
import { getErrorMessage } from '@/lib/api';

interface UseReturnsOptions {
    status?: string;
    autoFetch?: boolean;
}

export function useReturns(options: UseReturnsOptions = {}) {
    const { status, autoFetch = true } = options;

    const [data, setData] = useState<ReturnRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchReturns = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const returns = await returnsService.getAll({ status });
            setData(returns);
        } catch (err: any) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [status]);

    useEffect(() => {
        if (autoFetch) {
            fetchReturns();
        }
    }, [autoFetch, fetchReturns]);

    const createReturn = async (returnData: CreateReturn) => {
        try {
            const newReturn = await returnsService.create(returnData);
            setData([newReturn, ...data]);
            return newReturn;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    const updateReturn = async (id: number, updates: UpdateReturn) => {
        try {
            const updated = await returnsService.update(id, updates);
            setData(data.map(ret => ret.id === id ? updated : ret));
            return updated;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    const approveReturn = async (id: number) => {
        try {
            const approved = await returnsService.approve(id);
            setData(data.map(ret => ret.id === id ? approved : ret));
            return approved;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    const rejectReturn = async (id: number, reason: string) => {
        try {
            const rejected = await returnsService.reject(id, reason);
            setData(data.map(ret => ret.id === id ? rejected : ret));
            return rejected;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    const processRefund = async (id: number, amount: number) => {
        try {
            const refunded = await returnsService.processRefund(id, amount);
            setData(data.map(ret => ret.id === id ? refunded : ret));
            return refunded;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    return {
        data,
        loading,
        error,
        refetch: fetchReturns,
        createReturn,
        updateReturn,
        approveReturn,
        rejectReturn,
        processRefund,
    };
}
