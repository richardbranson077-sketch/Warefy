/**
 * useRoutes Hook
 * React hook for routes data with loading states
 */

import { useState, useEffect, useCallback } from 'react';
import { routesService, Route, OptimizeRouteRequest } from '@/services/routes.service';
import { getErrorMessage } from '@/lib/api';

interface UseRoutesOptions {
    status?: string;
    vehicleId?: number;
    autoFetch?: boolean;
}

export function useRoutes(options: UseRoutesOptions = {}) {
    const { status, vehicleId, autoFetch = true } = options;

    const [data, setData] = useState<Route[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRoutes = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const routes = await routesService.getAll({ status, vehicleId });
            setData(routes);
        } catch (err: any) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [status, vehicleId]);

    useEffect(() => {
        if (autoFetch) {
            fetchRoutes();
        }
    }, [autoFetch, fetchRoutes]);

    const optimizeRoute = async (routeData: OptimizeRouteRequest) => {
        try {
            setLoading(true);
            const optimized = await routesService.optimize(routeData);
            setData([optimized, ...data]);
            return optimized;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const createRoute = async (routeData: Partial<Route>) => {
        try {
            const newRoute = await routesService.create(routeData);
            setData([newRoute, ...data]);
            return newRoute;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    const updateRoute = async (id: number, updates: Partial<Route>) => {
        try {
            const updated = await routesService.update(id, updates);
            setData(data.map(route => route.id === id ? updated : route));
            return updated;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    const deleteRoute = async (id: number) => {
        try {
            await routesService.delete(id);
            setData(data.filter(route => route.id !== id));
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    return {
        data,
        loading,
        error,
        refetch: fetchRoutes,
        optimizeRoute,
        createRoute,
        updateRoute,
        deleteRoute,
    };
}
