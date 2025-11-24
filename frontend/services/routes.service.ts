/**
 * Routes Service
 * Handles API calls for route optimization
 */

import apiClient from '@/lib/api';

export interface Route {
    id: number;
    name: string;
    vehicleId: number;
    driverId?: number;
    stops: RouteStop[];
    totalDistance: number;
    totalDuration: number;
    status: 'planned' | 'in_progress' | 'completed';
    optimized: boolean;
    createdAt: string;
}

export interface RouteStop {
    id: number;
    sequence: number;
    warehouseId?: number;
    address: string;
    lat: number;
    lng: number;
    type: 'pickup' | 'delivery';
    estimatedArrival?: string;
    actualArrival?: string;
    completed: boolean;
}

export interface OptimizeRouteRequest {
    vehicleId: number;
    startLocation: { lat: number; lng: number };
    stops: Array<{
        address: string;
        lat: number;
        lng: number;
        type: 'pickup' | 'delivery';
    }>;
}

export const routesService = {
    /**
     * Get all routes
     */
    getAll: async (params?: { status?: string; vehicleId?: number }) => {
        const response = await apiClient.get<Route[]>('/routes', { params });
        return response.data;
    },

    /**
     * Get route by ID
     */
    getById: async (id: number) => {
        const response = await apiClient.get<Route>(`/routes/${id}`);
        return response.data;
    },

    /**
     * Optimize route
     */
    optimize: async (data: OptimizeRouteRequest) => {
        const response = await apiClient.post<Route>('/routes/optimize', data);
        return response.data;
    },

    /**
     * Create route
     */
    create: async (data: Partial<Route>) => {
        const response = await apiClient.post<Route>('/routes/create', data);
        return response.data;
    },

    /**
     * Update route
     */
    update: async (id: number, data: Partial<Route>) => {
        const response = await apiClient.put<Route>(`/routes/${id}`, data);
        return response.data;
    },

    /**
     * Delete route
     */
    delete: async (id: number) => {
        await apiClient.delete(`/routes/${id}`);
    },
};
