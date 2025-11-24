/**
 * useVehicles Hook
 * React hook for vehicles data with loading states
 */

import { useState, useEffect, useCallback } from 'react';
import { vehiclesService, Vehicle, CreateVehicle } from '@/services/vehicles.service';
import { getErrorMessage } from '@/lib/api';

interface UseVehiclesOptions {
    status?: string;
    type?: string;
    autoFetch?: boolean;
}

export function useVehicles(options: UseVehiclesOptions = {}) {
    const { status, type, autoFetch = true } = options;

    const [data, setData] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchVehicles = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const vehicles = await vehiclesService.getAll({ status, type });
            setData(vehicles);
        } catch (err: any) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [status, type]);

    useEffect(() => {
        if (autoFetch) {
            fetchVehicles();
        }
    }, [autoFetch, fetchVehicles]);

    const createVehicle = async (vehicleData: CreateVehicle) => {
        try {
            const newVehicle = await vehiclesService.create(vehicleData);
            setData([...data, newVehicle]);
            return newVehicle;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    const updateVehicle = async (id: number, updates: Partial<Vehicle>) => {
        try {
            const updated = await vehiclesService.update(id, updates);
            setData(data.map(vehicle => vehicle.id === id ? updated : vehicle));
            return updated;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    const deleteVehicle = async (id: number) => {
        try {
            await vehiclesService.delete(id);
            setData(data.filter(vehicle => vehicle.id !== id));
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    const assignDriver = async (vehicleId: number, driverId: number) => {
        try {
            const updated = await vehiclesService.assignDriver(vehicleId, driverId);
            setData(data.map(vehicle => vehicle.id === vehicleId ? updated : vehicle));
            return updated;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    return {
        data,
        loading,
        error,
        refetch: fetchVehicles,
        createVehicle,
        updateVehicle,
        deleteVehicle,
        assignDriver,
    };
}
