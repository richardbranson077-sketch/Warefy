import { apiClient } from '@/lib/api';

export interface Waypoint {
    address: string;
    lat?: number;
    lng?: number;
    stop_duration_minutes?: number;
}

export interface Route {
    id: string;
    name: string;
    origin: Waypoint;
    destination: Waypoint;
    waypoints: Waypoint[];
    optimization_mode: string;
    vehicle_type: string;
    status: string;
    created_at: string;
    assigned_driver?: {
        id: string;
        name: string;
        assigned_at: string;
    };
    total_distance_km: number;
    total_duration_minutes: number;
    estimated_cost: number;
    optimized: boolean;
}

export interface OptimizationResult {
    route_id: string;
    optimized_sequence: number[];
    optimized_stops?: Waypoint[];
    total_distance_km: number;
    total_duration_minutes: number;
    fuel_cost_usd: number;
    toll_cost_usd: number;
    total_cost_usd: number;
    insights: string[];
    recommendations: string[];
    alternative_routes: Array<{
        description: string;
        distance_km: number;
        duration_minutes: number;
        cost_usd: number;
    }>;
    model: string;
    optimized_at: string;
}

export interface RouteAnalytics {
    summary: {
        total_routes: number;
        completed_routes: number;
        in_progress_routes: number;
        avg_distance_km: number;
        avg_duration_minutes: number;
        avg_cost_usd: number;
    };
    daily_routes: Array<{ date: string; completed: number; planned: number }>;
    distance_trend: Array<{ date: string; total_km: number; avg_km_per_route: number }>;
    cost_trend: Array<{ date: string; total_cost: number; fuel_cost: number; toll_cost: number }>;
    driver_stats: Array<{
        driver_name: string;
        routes_completed: number;
        avg_duration_minutes: number;
        on_time_percentage: number;
    }>;
    optimization_impact: {
        routes_optimized: number;
        avg_distance_saved_km: number;
        avg_time_saved_minutes: number;
        avg_cost_saved_usd: number;
        total_savings_usd: number;
    };
}

export const routesService = {
    /**
     * Create a new route
     */
    createRoute: async (data: {
        name: string;
        origin: Waypoint;
        destination: Waypoint;
        waypoints?: Waypoint[];
        optimization_mode?: string;
        vehicle_type?: string;
    }) => {
        const response = await apiClient.post('/api/v1/routes/create', data);
        return response.data;
    },

    /**
     * Optimize route with AI
     */
    optimizeRoute: async (data: {
        route_id?: string;
        origin: Waypoint;
        destination: Waypoint;
        waypoints?: Waypoint[];
        optimization_mode?: string;
        avoid_tolls?: boolean;
        avoid_highways?: boolean;
    }) => {
        const response = await apiClient.post<OptimizationResult>('/api/v1/routes/optimize', data);
        return response.data;
    },

    /**
     * Get all routes
     */
    getRoutes: async (status?: string) => {
        const params = status ? `?status=${status}` : '';
        const response = await apiClient.get<Route[]>(`/api/v1/routes/${params}`);
        return response.data;
    },

    /**
     * Get specific route
     */
    getRoute: async (routeId: string) => {
        const response = await apiClient.get<Route>(`/api/v1/routes/${routeId}`);
        return response.data;
    },

    /**
     * Assign driver to route
     */
    assignDriver: async (routeId: string, driverId: string, driverName: string) => {
        const response = await apiClient.put(`/api/v1/routes/${routeId}/assign`, {
            driver_id: driverId,
            driver_name: driverName
        });
        return response.data;
    },

    /**
     * Update route status
     */
    updateStatus: async (routeId: string, status: string) => {
        const response = await apiClient.put(`/api/v1/routes/${routeId}/status?status=${status}`);
        return response.data;
    },

    /**
     * Delete route
     */
    deleteRoute: async (routeId: string) => {
        await apiClient.delete(`/api/v1/routes/${routeId}`);
    },

    /**
     * Get route analytics
     */
    getAnalytics: async () => {
        const response = await apiClient.get<RouteAnalytics>('/api/v1/routes/analytics/performance');
        return response.data;
    },

    /**
     * Simulate route with traffic
     */
    simulateRoute: async (data: {
        origin: Waypoint;
        destination: Waypoint;
        waypoints?: Waypoint[];
        traffic_condition?: string;
    }, trafficCondition: string = 'normal') => {
        const response = await apiClient.post(`/api/v1/routes/simulate?traffic_condition=${trafficCondition}`, data);
        return response.data;
    },

    /**
     * Get live tracking for a route
     */
    getLiveTracking: async (routeId: string) => {
        const response = await apiClient.get(`/api/v1/routes/${routeId}/tracking`);
        return response.data;
    },

    /**
     * Get live tracking for all active routes
     */
    getAllLiveTracking: async () => {
        const response = await apiClient.get('/api/v1/routes/tracking/all');
        return response.data;
    }
};
