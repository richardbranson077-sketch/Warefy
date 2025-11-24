/**
 * Vehicles Service
 * Handles API calls for vehicle/fleet management
 */

import apiClient from '@/lib/api';

export interface Vehicle {
    id: number;
    name: string;
    type: 'truck' | 'van' | 'car';
    licensePlate: string;
    capacity: number;
    status: 'available' | 'in_use' | 'maintenance' | 'inactive';
    currentLocation?: {
        lat: number;
        lng: number;
    };
    driverId?: number;
    driverName?: string;
    fuelLevel?: number;
    mileage?: number;
    lastMaintenance?: string;
    nextMaintenance?: string;
    createdAt?: string;
}

export interface CreateVehicle {
    name: string;
    type: 'truck' | 'van' | 'car';
    licensePlate: string;
    capacity: number;
    status?: Vehicle['status'];
}

export const vehiclesService = {
    /**
     * Get all vehicles
     */
    getAll: async (params?: { status?: string; type?: string }) => {
        const response = await apiClient.get<Vehicle[]>('/vehicles', { params });
        return response.data;
    },

    /**
     * Get vehicle by ID
     */
    getById: async (id: number) => {
        const response = await apiClient.get<Vehicle>(`/vehicles/${id}`);
        return response.data;
    },

    /**
     * Create vehicle
     */
    create: async (data: CreateVehicle) => {
        const response = await apiClient.post<Vehicle>('/vehicles', data);
        return response.data;
    },

    /**
     * Update vehicle
     */
    update: async (id: number, data: Partial<Vehicle>) => {
        const response = await apiClient.put<Vehicle>(`/vehicles/${id}`, data);
        return response.data;
    },

    /**
     * Delete vehicle
     */
    delete: async (id: number) => {
        await apiClient.delete(`/vehicles/${id}`);
    },

    /**
     * Assign driver to vehicle
     */
    assignDriver: async (vehicleId: number, driverId: number) => {
        const response = await apiClient.post(`/vehicles/${vehicleId}/assign-driver`, { driverId });
        return response.data;
    },
};
