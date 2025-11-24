/**
 * Labor Service
 * Handles API calls for labor management and time tracking
 */

import apiClient from '@/lib/api';

export interface Employee {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    department: string;
    hourlyRate: number;
    status: 'active' | 'inactive' | 'on_leave';
    shift?: string;
    currentStatus?: 'working' | 'break' | 'off_duty';
}

export interface TimeEntry {
    id: number;
    employeeId: number;
    type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end';
    timestamp: string;
    location?: string;
    notes?: string;
}

export interface Shift {
    id: number;
    employeeId: number;
    startTime: string;
    endTime: string;
    type: 'regular' | 'overtime';
    status: 'scheduled' | 'completed' | 'missed';
}

export interface LaborStats {
    totalEmployees: number;
    activeNow: number;
    totalHoursToday: number;
    overtimeHoursToday: number;
    laborCostToday: number;
    productivityScore: number;
}

export const laborService = {
    /**
     * Get all employees
     */
    getEmployees: async (params?: { department?: string; status?: string }) => {
        const response = await apiClient.get<Employee[]>('/labor/employees', { params });
        return response.data;
    },

    /**
     * Get employee by ID
     */
    getEmployeeById: async (id: number) => {
        const response = await apiClient.get<Employee>(`/labor/employees/${id}`);
        return response.data;
    },

    /**
     * Clock in/out
     */
    logTime: async (data: { employeeId: number; type: TimeEntry['type']; notes?: string }) => {
        const response = await apiClient.post<TimeEntry>('/labor/time-entries', data);
        return response.data;
    },

    /**
     * Get shifts
     */
    getShifts: async (params?: { start: string; end: string; employeeId?: number }) => {
        const response = await apiClient.get<Shift[]>('/labor/shifts', { params });
        return response.data;
    },

    /**
     * Create shift
     */
    createShift: async (data: Partial<Shift>) => {
        const response = await apiClient.post<Shift>('/labor/shifts', data);
        return response.data;
    },

    /**
     * Get labor statistics
     */
    getStats: async () => {
        const response = await apiClient.get<LaborStats>('/labor/stats');
        return response.data;
    },
};
