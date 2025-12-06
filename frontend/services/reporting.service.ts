import api from '@/lib/api';

export interface ReportData {
    report_type: string;
    generated_at: string;
    summary: any;
    data: any[];
}

export interface AIInsightsResponse {
    insights: string[];
    recommendations: string[];
}

export const reportingService = {
    /**
     * Generate a report based on type and date range
     */
    generateReport: async (
        reportType: string,
        startDate?: Date,
        endDate?: Date
    ): Promise<ReportData> => {
        const params: any = { report_type: reportType };
        if (startDate) params.start_date = startDate.toISOString();
        if (endDate) params.end_date = endDate.toISOString();

        const response = await api.get('/api/v1/reporting/generate', { params });
        return response.data;
    },

    /**
     * Generate AI insights for a report
     */
    generateAIInsights: async (
        reportType: string,
        summary: any,
        dataSample: any[]
    ): Promise<AIInsightsResponse> => {
        const response = await api.post('/api/v1/reporting/ai-insights', {
            report_type: reportType,
            summary,
            data_sample: dataSample
        });
        return response.data;
    }
};
