/**
 * useOrders Hook
 * React hook for orders data with loading states and error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { ordersService, Order, CreateOrder, UpdateOrder } from '@/services/orders.service';
import { getErrorMessage } from '@/lib/api';

interface UseOrdersOptions {
    status?: string;
    warehouseId?: number;
    autoFetch?: boolean;
}

export function useOrders(options: UseOrdersOptions = {}) {
    const { status, warehouseId, autoFetch = true } = options;

    const [data, setData] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<any>(null);

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const orders = await ordersService.getAll({ status, warehouseId });
            setData(orders);
        } catch (err: any) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [status, warehouseId]);

    const fetchStats = useCallback(async () => {
        try {
            const statistics = await ordersService.getStats();
            setStats(statistics);
        } catch (err: any) {
            console.error('Failed to fetch stats:', err);
        }
    }, []);

    useEffect(() => {
        if (autoFetch) {
            fetchOrders();
            fetchStats();
        }
    }, [autoFetch, fetchOrders, fetchStats]);

    const createOrder = async (order: CreateOrder) => {
        try {
            const newOrder = await ordersService.create(order);
            setData(prev => [newOrder, ...prev]);
            await fetchStats(); // Refresh stats
            return newOrder;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    const updateOrder = async (id: number, updates: UpdateOrder) => {
        try {
            const updated = await ordersService.update(id, updates);
            setData(data.map(order => order.id === id ? updated : order));
            await fetchStats(); // Refresh stats
            return updated;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    const deleteOrder = async (id: number) => {
        try {
            await ordersService.delete(id);
            setData(data.filter(order => order.id !== id));
            await fetchStats(); // Refresh stats
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    const getOrderById = async (id: number) => {
        try {
            const order = await ordersService.getById(id);
            return order;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    return {
        data,
        loading,
        error,
        stats,
        refetch: fetchOrders,
        createOrder,
        updateOrder,
        deleteOrder,
        getOrderById,
    };
}
