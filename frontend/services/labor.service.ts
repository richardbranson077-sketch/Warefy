/**
 * Labor Management Service
 * Handles API calls for shifts, time tracking, and productivity
 */

import apiClient from '@/lib/api';

export interface TimeClockEntry {
    id: number;
    user_id: number;
    clock_in: string;
    clock_out?: string;
    break_minutes: number;
    hours_worked?: number;
}

export interface ShiftSchedule {
    user_id: number;
    shift_date: string;
    start_time: string;
    end_time: string;
    role: string;
}

export interface Employee {
    id: number;
    name: string;
    role: string;
    status: 'active' | 'inactive';
    current_shift?: ShiftSchedule;
}

export interface ProductivityMetric {
    user_id: number;
    date: string;
    picks_per_hour: number;
    accuracy_percentage: number;
    orders_processed: number;
}

export interface TeamPerformance {
    user_id: number;
    name: string;
    avg_picks_per_hour: number;
    avg_accuracy: number;
    total_orders: number;
    score: number;
}

export interface LaborCostAnalytics {
    period: { start: string; end: string };
    total_hours: number;
    hourly_rate: number;
    total_labor_cost: number;
    total_orders: number;
    cost_per_order: number;
}

export const laborService = {
    /**
     * Clock in
     */
    clockIn: async () => {
        const response = await apiClient.post<{ message: string; clock_in_time: string; entry_id: number }>('/api/v1/labor/clock-in');
        return response.data;
    },

    /**
     * Clock out
     */
    clockOut: async (breakMinutes: number = 0) => {
        const response = await apiClient.post<{ message: string; clock_out_time: string; hours_worked: number }>(
            `/api/v1/labor/clock-out?break_minutes=${breakMinutes}`
        );
        return response.data;
    },

    /**
     * Get timesheet
     */
    getTimesheet: async (userId?: number, startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (userId) params.append('user_id', userId.toString());
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);

        const response = await apiClient.get<{ entries: TimeClockEntry[]; total_hours: number }>(`/api/v1/labor/timesheet?${params.toString()}`);
        return response.data;
    },

    /**
     * Get employees
     */
    getEmployees: async () => {
        const response = await apiClient.get<Employee[]>('/api/v1/labor/employees');
        return response.data;
    },

    /**
     * Create shift schedule
     */
    createSchedule: async (schedule: ShiftSchedule) => {
        const response = await apiClient.post('/api/v1/labor/schedule', schedule);
        return response.data;
    },

    /**
     * Get schedules
     */
    getSchedules: async (userId?: number, date?: string) => {
        const params = new URLSearchParams();
        if (userId) params.append('user_id', userId.toString());
        if (date) params.append('date', date);

        const response = await apiClient.get<ShiftSchedule[]>(`/api/v1/labor/schedule?${params.toString()}`);
        return response.data;
    },

    /**
     * Get team performance
     */
    getTeamPerformance: async (days: number = 7) => {
        const response = await apiClient.get<TeamPerformance[]>(`/api/v1/labor/analytics/team-performance?days=${days}`);
        return response.data;
    },

    /**
     * Get labor cost analytics
     */
    getLaborCosts: async (startDate: string, endDate: string) => {
        const response = await apiClient.get<LaborCostAnalytics>(
            `/api/v1/labor/analytics/labor-cost?start_date=${startDate}&end_date=${endDate}`
        );
        return response.data;
    }
};
