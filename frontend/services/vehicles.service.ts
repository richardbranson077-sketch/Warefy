import apiClient from '@/lib/api';

export interface Vehicle {
    id: string;
    vehicle_number: string;
    vehicle_type: 'van' | 'truck' | 'car';
    make: string;
    model: string;
    year: number;
    capacity_kg: number;
    fuel_type: 'diesel' | 'gasoline' | 'electric' | 'hybrid';
    license_plate: string;
    status: 'available' | 'in_use' | 'maintenance';
    current_mileage: number;
    last_maintenance_date: string;
    last_maintenance_mileage: number;
    assigned_driver?: {
        id: string;
        name: string;
        assigned_at: string;
    };
    health_score: number;
    fuel_efficiency_kmpl: number;
    location: string;
    created_at: string;
}

export interface MaintenancePrediction {
    vehicle_id: string;
    model: string;
    predicted_at: string;
    next_maintenance_date: string;
    next_maintenance_type: string;
    estimated_cost_usd: number;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    confidence_score: number;
    critical_issues: string[];
    recommendations: string[];
    parts_to_replace: string[];
}

export interface FuelOptimization {
    vehicle_id: string;
    model: string;
    analyzed_at: string;
    current_efficiency_rating: 'excellent' | 'good' | 'average' | 'poor';
    potential_savings_percent: number;
    estimated_monthly_savings_usd: number;
    optimization_recommendations: string[];
    driving_tips: string[];
    maintenance_impact: string;
}

export interface FleetAnalytics {
    summary: {
        total_vehicles: number;
        available: number;
        in_use: number;
        maintenance: number;
        avg_health_score: number;
        avg_mileage: number;
    };
    utilization_trend: Array<{
        date: string;
        utilization_percent: number;
        active_vehicles: number;
    }>;
    maintenance_cost_trend: Array<{
        date: string;
        total_cost: number;
        preventive: number;
        corrective: number;
    }>;
    fuel_efficiency_trend: Array<{
        date: string;
        avg_efficiency: number;
        total_fuel_cost: number;
    }>;
    type_distribution: Record<string, number>;
    health_distribution: {
        excellent: number;
        good: number;
        fair: number;
        poor: number;
    };
}

export interface VehicleHealth {
    vehicle_id: string;
    overall_health_score: number;
    last_updated: string;
    diagnostics: {
        engine: { status: string; temperature: number; oil_pressure: number; score: number };
        transmission: { status: string; fluid_level: number; score: number };
        brakes: { status: string; pad_thickness_percent: number; score: number };
        tires: { status: string; front_left_pressure: number; front_right_pressure: number; rear_left_pressure: number; rear_right_pressure: number; score: number };
        battery: { status: string; voltage: number; charge_percent: number; score: number };
    };
    alerts: Array<{
        severity: 'info' | 'warning' | 'critical';
        message: string;
        timestamp: string;
    }>;
}

export const vehiclesService = {
    // Vehicle CRUD
    getVehicles: async (status?: string): Promise<Vehicle[]> => {
        const response = await apiClient.get('/api/v1/vehicles/', { params: { status } });
        return response.data;
    },

    getVehicle: async (id: string): Promise<Vehicle> => {
        const response = await apiClient.get(`/api/v1/vehicles/${id}`);
        return response.data;
    },

    createVehicle: async (vehicle: Omit<Vehicle, 'id' | 'status' | 'current_mileage' | 'last_maintenance_date' | 'last_maintenance_mileage' | 'health_score' | 'fuel_efficiency_kmpl' | 'location' | 'created_at'>): Promise<Vehicle> => {
        const response = await apiClient.post('/api/v1/vehicles/', vehicle);
        return response.data.vehicle;
    },

    updateVehicle: async (id: string, updates: Partial<Vehicle>): Promise<Vehicle> => {
        const response = await apiClient.put(`/api/v1/vehicles/${id}`, updates);
        return response.data;
    },

    deleteVehicle: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/v1/vehicles/${id}`);
    },

    assignDriver: async (vehicleId: string, driverId: string, driverName: string): Promise<Vehicle> => {
        const response = await apiClient.put(`/api/v1/vehicles/${vehicleId}/assign`, {
            driver_id: driverId,
            driver_name: driverName
        });
        return response.data.vehicle;
    },

    // AI Features
    predictMaintenance: async (vehicleId: string): Promise<MaintenancePrediction> => {
        const response = await apiClient.get(`/api/v1/vehicles/${vehicleId}/maintenance/predict`);
        return response.data;
    },

    optimizeFuel: async (vehicleId: string): Promise<FuelOptimization> => {
        const response = await apiClient.get(`/api/v1/vehicles/${vehicleId}/fuel/optimize`);
        return response.data;
    },

    // Analytics & Health
    getFleetAnalytics: async (): Promise<FleetAnalytics> => {
        const response = await apiClient.get('/api/v1/vehicles/analytics/fleet');
        return response.data;
    },

    getVehicleHealth: async (vehicleId: string): Promise<VehicleHealth> => {
        const response = await apiClient.get(`/api/v1/vehicles/${vehicleId}/health`);
        return response.data;
    }
};
