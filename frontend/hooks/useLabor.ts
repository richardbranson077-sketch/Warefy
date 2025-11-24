/**
 * useLabor Hook
 * React hook for labor management data
 */

import { useState, useEffect, useCallback } from 'react';
import { laborService, Employee, Shift, LaborStats, TimeEntry } from '@/services/labor.service';
import { getErrorMessage } from '@/lib/api';

interface UseLaborOptions {
    department?: string;
    autoFetch?: boolean;
}

export function useLabor(options: UseLaborOptions = {}) {
    const { department, autoFetch = true } = options;

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [stats, setStats] = useState<LaborStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLaborData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [empData, statsData] = await Promise.all([
                laborService.getEmployees({ department }),
                laborService.getStats()
            ]);
            setEmployees(empData);
            setStats(statsData);
        } catch (err: any) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [department]);

    useEffect(() => {
        if (autoFetch) {
            fetchLaborData();
        }
    }, [autoFetch, fetchLaborData]);

    const logTime = async (employeeId: number, type: TimeEntry['type'], notes?: string) => {
        try {
            const entry = await laborService.logTime({ employeeId, type, notes });
            await fetchLaborData(); // Refresh data to update status
            return entry;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    const createShift = async (shiftData: Partial<Shift>) => {
        try {
            const shift = await laborService.createShift(shiftData);
            return shift;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    const getShifts = async (start: string, end: string, employeeId?: number) => {
        try {
            const shifts = await laborService.getShifts({ start, end, employeeId });
            return shifts;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    return {
        employees,
        stats,
        loading,
        error,
        refetch: fetchLaborData,
        logTime,
        createShift,
        getShifts,
    };
}
