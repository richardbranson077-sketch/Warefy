import apiClient from '../lib/api';

export interface AIReport {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

export const getReports = async (): Promise<AIReport[]> => {
    const response = await apiClient.get<AIReport[]>('/api/v1/ai/reports');
    return response.data;
};

export const createReport = async (report: Partial<AIReport>): Promise<AIReport> => {
    const response = await apiClient.post<AIReport>('/api/v1/ai/reports', report);
    return response.data;
};

export const deleteReport = async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/ai/reports/${id}`);
};
