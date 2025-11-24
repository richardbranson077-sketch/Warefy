/**
 * useDashboard Hook
 * React hook for dashboard data with loading states and error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { dashboardService, DashboardMetrics } from '@/services/dashboard.service';
import { getErrorMessage } from '@/lib/api';

interface UseDashboardOptions {
    autoRefresh?: boolean;
    refreshInterval?: number; // in milliseconds
}

export function useDashboard(options: UseDashboardOptions = {}) {
    const { autoRefresh = false, refreshInterval = 30000 } = options;

    const [data, setData] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchDashboard = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const metrics = await dashboardService.getMetrics();
            setData(metrics);
            setLastUpdated(new Date());
        } catch (err: any) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    // Auto-refresh functionality
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            fetchDashboard();
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, fetchDashboard]);

    const getPerformanceMetrics = async (period: 'day' | 'week' | 'month' | 'year') => {
        try {
            const metrics = await dashboardService.getPerformanceMetrics(period);
            return metrics;
        } catch (err: any) {
            throw new Error(getErrorMessage(err));
        }
    };

    return {
        data,
        loading,
        error,
        lastUpdated,
        refetch: fetchDashboard,
        getPerformanceMetrics,
    };
}
