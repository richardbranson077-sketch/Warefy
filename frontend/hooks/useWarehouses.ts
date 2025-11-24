/**
 * useWarehouses Hook
 * React hook for warehouses data with loading states and error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { warehousesService, Warehouse, CreateWarehouse, UpdateWarehouse, WarehouseSummary } from '@/services/warehouses.service';
import { getErrorMessage } from '@/lib/api';

interface UseWarehousesOptions {
    autoFetch?: boolean;
}

export function useWarehouses(options: UseWarehousesOptions = {}) {
    const { autoFetch = true } = options;

    const [data, setData] = useState<Warehouse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchWarehouses = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const warehouses = await warehousesService.getAll();
            setData(warehouses);
        } catch (err: any) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (autoFetch) {
            fetchWarehouses();
        }
    }, [autoFetch, fetchWarehouses]);

    const createWarehouse = async (warehouse: CreateWarehouse) => {
        try {
            const newWarehouse = await warehousesService.create(warehouse);
            setData([...data, newWarehouse]);
            return newWarehouse;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    const updateWarehouse = async (id: number, updates: UpdateWarehouse) => {
        try {
            const updated = await warehousesService.update(id, updates);
            setData(data.map(wh => wh.id === id ? updated : wh));
            return updated;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    const deleteWarehouse = async (id: number) => {
        try {
            await warehousesService.delete(id);
            setData(data.filter(wh => wh.id !== id));
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    const getWarehouseById = async (id: number) => {
        try {
            const warehouse = await warehousesService.getById(id);
            return warehouse;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    const getWarehouseSummary = async (id: number): Promise<WarehouseSummary> => {
        try {
            const summary = await warehousesService.getSummary(id);
            return summary;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    const updateLayout = async (id: number, layout: any) => {
        try {
            const updated = await warehousesService.updateLayout(id, layout);
            setData(data.map(wh => wh.id === id ? updated : wh));
            return updated;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    return {
        data,
        loading,
        error,
        refetch: fetchWarehouses,
        createWarehouse,
        updateWarehouse,
        deleteWarehouse,
        getWarehouseById,
        getWarehouseSummary,
        updateLayout,
    };
}
