import { apiClient } from '@/lib/api';

export interface AIReport {
    id: string;
    title: string;
    query: string;
    summary: string;
    insights: string[];
    recommendations: string[];
    data: {
        labels: string[];
        values: number[];
        details: any[];
    };
    chart_type: 'line' | 'bar' | 'pie' | 'table';
    generated_at: string;
    model: string;
}

export interface GenerateReportRequest {
    query: string;
    date_range?: {
        start: string;
        end: string;
    };
}

export const aiReportsService = {
    /**
     * Generate AI report from natural language query
     */
    generateReport: async (request: GenerateReportRequest) => {
        const response = await apiClient.post<AIReport>('/api/v1/ai-reports/generate', request);
        return response.data;
    },

    /**
     * Get all generated reports
     */
    getReports: async () => {
        const response = await apiClient.get<AIReport[]>('/api/v1/ai-reports/');
        return response.data;
    },

    /**
     * Get specific report by ID
     */
    getReport: async (reportId: string) => {
        const response = await apiClient.get<AIReport>(`/api/v1/ai-reports/${reportId}`);
        return response.data;
    },

    /**
     * Regenerate report with fresh data
     */
    regenerateReport: async (reportId: string) => {
        const response = await apiClient.post<AIReport>(`/api/v1/ai-reports/${reportId}/regenerate`);
        return response.data;
    },

    /**
     * Delete a report
     */
    deleteReport: async (reportId: string) => {
        await apiClient.delete(`/api/v1/ai-reports/${reportId}`);
    }
};
