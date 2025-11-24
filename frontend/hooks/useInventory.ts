/**
 * useInventory Hook
 * React hook for inventory data fetching with loading states and error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { inventoryService, InventoryItem, CreateInventoryItem, UpdateInventoryItem } from '@/services/inventory.service';
import { getErrorMessage } from '@/lib/api';

interface UseInventoryOptions {
    warehouseId?: number;
    autoFetch?: boolean;
}

export function useInventory(options: UseInventoryOptions = {}) {
    const { warehouseId, autoFetch = true } = options;

    const [data, setData] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchInventory = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const items = await inventoryService.getAll({ warehouse_id: warehouseId });
            setData(items);
        } catch (err: any) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [warehouseId]);

    useEffect(() => {
        if (autoFetch) {
            fetchInventory();
        }
    }, [autoFetch, fetchInventory]);

    const createItem = async (item: CreateInventoryItem) => {
        try {
            const newItem = await inventoryService.create(item);
            setData([...data, newItem]);
            return newItem;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    const updateItem = async (id: number, updates: UpdateInventoryItem) => {
        try {
            const updated = await inventoryService.update(id, updates);
            setData(data.map(item => item.id === id ? updated : item));
            return updated;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    const deleteItem = async (id: number) => {
        try {
            await inventoryService.delete(id);
            setData(data.filter(item => item.id !== id));
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    return {
        data,
        loading,
        error,
        refetch: fetchInventory,
        createItem,
        updateItem,
        deleteItem,
    };
}
