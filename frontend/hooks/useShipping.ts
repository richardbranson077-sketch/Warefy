/**
 * useShipping Hook
 * React hook for shipping data with loading states and error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { shippingService, Shipment, CreateShipment, ShipmentRate } from '@/services/shipping.service';
import { getErrorMessage } from '@/lib/api';

interface UseShippingOptions {
    status?: string;
    carrier?: string;
    autoFetch?: boolean;
}

export function useShipping(options: UseShippingOptions = {}) {
    const { status, carrier, autoFetch = true } = options;

    const [data, setData] = useState<Shipment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchShipments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const shipments = await shippingService.getAll({ status, carrier });
            setData(shipments);
        } catch (err: any) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [status, carrier]);

    useEffect(() => {
        if (autoFetch) {
            fetchShipments();
        }
    }, [autoFetch, fetchShipments]);

    const getRates = async (rateData: {
        weight: number;
        dimensions?: { length: number; width: number; height: number };
        fromZip: string;
        toZip: string;
    }): Promise<ShipmentRate[]> => {
        try {
            const rates = await shippingService.getRates(rateData);
            return rates;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    const createShipment = async (shipmentData: CreateShipment) => {
        try {
            const newShipment = await shippingService.createShipment(shipmentData);
            setData([newShipment, ...data]);
            return newShipment;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    const trackShipment = async (trackingNumber: string) => {
        try {
            const tracking = await shippingService.track(trackingNumber);
            return tracking;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    const cancelShipment = async (id: number) => {
        try {
            await shippingService.cancel(id);
            setData(data.filter(shipment => shipment.id !== id));
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    return {
        data,
        loading,
        error,
        refetch: fetchShipments,
        getRates,
        createShipment,
        trackShipment,
        cancelShipment,
    };
}
