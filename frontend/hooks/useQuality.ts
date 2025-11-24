/**
 * useQuality Hook
 * React hook for quality control data
 */

import { useState, useEffect, useCallback } from 'react';
import { qualityService, Inspection, Defect, QualityStats } from '@/services/quality.service';
import { getErrorMessage } from '@/lib/api';

interface UseQualityOptions {
    status?: string;
    type?: string;
    autoFetch?: boolean;
}

export function useQuality(options: UseQualityOptions = {}) {
    const { status, type, autoFetch = true } = options;

    const [inspections, setInspections] = useState<Inspection[]>([]);
    const [stats, setStats] = useState<QualityStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchQualityData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [inspData, statsData] = await Promise.all([
                qualityService.getAll({ status, type }),
                qualityService.getStats()
            ]);
            setInspections(inspData);
            setStats(statsData);
        } catch (err: any) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [status, type]);

    useEffect(() => {
        if (autoFetch) {
            fetchQualityData();
        }
    }, [autoFetch, fetchQualityData]);

    const createInspection = async (data: Partial<Inspection>) => {
        try {
            const newInspection = await qualityService.create(data);
            setInspections([newInspection, ...inspections]);
            return newInspection;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    const updateInspection = async (id: number, updates: Partial<Inspection>) => {
        try {
            const updated = await qualityService.update(id, updates);
            setInspections(inspections.map(insp => insp.id === id ? updated : insp));
            return updated;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    const getDefects = async (params?: { status?: string; severity?: string }) => {
        try {
            const defects = await qualityService.getDefects(params);
            return defects;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    const reportDefect = async (data: Partial<Defect>) => {
        try {
            const defect = await qualityService.reportDefect(data);
            return defect;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    return {
        inspections,
        stats,
        loading,
        error,
        refetch: fetchQualityData,
        createInspection,
        updateInspection,
        getDefects,
        reportDefect,
    };
}
