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
            const routes = await routesService.getRoutes(status);
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

    const optimizeRoute = async (routeData: any) => {
        try {
            setLoading(true);
            const optimized = await routesService.optimizeRoute(routeData);
            // Optimization returns a result, not necessarily a saved route yet, 
            // but if it does return a route structure, we can add it.
            // The service returns OptimizationResult which is different from Route.
            // We might not want to add it to 'data' directly unless it's saved.
            // For now, let's just return it.
            return optimized;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const createRoute = async (routeData: any) => {
        try {
            const response = await routesService.createRoute(routeData);
            // response might be { message, route }
            const newRoute = response.route || response;
            setData(prev => [newRoute, ...prev]);
            return newRoute;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    const updateRouteStatus = async (id: string, status: string) => {
        try {
            const updated = await routesService.updateStatus(id, status);
            setData(prev => prev.map(route => route.id === id || route.route_id === id ? updated : route));
            return updated;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    const assignDriver = async (routeId: string, driverId: string, driverName: string) => {
        try {
            const response = await routesService.assignDriver(routeId, driverId, driverName);
            const updated = response.route;
            setData(prev => prev.map(route => route.id === routeId || route.route_id === routeId ? updated : route));
            return updated;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    const deleteRoute = async (id: string) => {
        try {
            await routesService.deleteRoute(id);
            setData(prev => prev.filter(route => route.id !== id && route.route_id !== id));
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
        updateRouteStatus,
        assignDriver,
        deleteRoute,
    };
}
