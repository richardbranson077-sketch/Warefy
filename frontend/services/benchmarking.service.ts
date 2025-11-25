/**
 * Benchmarking Service
 * Handles API calls for performance benchmarking and metrics comparison
 */

import apiClient from '@/lib/api';

export interface BenchmarkMetric {
    id: number;
    name: string;
    value: number;
    unit: string;
    category: string;
    timestamp: string;
}

export interface BenchmarkComparison {
    metric: string;
    current: number;
    previous: number;
    change: number;
    changePercent: number;
}

export const benchmarkingService = {
    /**
     * Get all benchmark metrics
     */
    getMetrics: async () => {
        const response = await apiClient.get<BenchmarkMetric[]>('/api/v1/benchmarking/metrics');
        return response.data;
    },

    /**
     * Compare metrics between periods
     */
    compareMetrics: async (startDate: string, endDate: string) => {
        const response = await apiClient.post<BenchmarkComparison[]>('/api/v1/benchmarking/compare', {
            startDate,
            endDate
        });
        return response.data;
    },

    /**
     * Get industry benchmarks
     */
    getIndustryBenchmarks: async () => {
        const response = await apiClient.get('/api/v1/benchmarking/industry');
        return response.data;
    },
};
