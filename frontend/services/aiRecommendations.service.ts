import apiClient from '../lib/api';

export interface AIRecommendation {
    id: string;
    title: string;
    description: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    impact: string;
    status: string;
    createdAt?: string;
    updatedAt?: string;
    // Legacy fields for backward compatibility
    content?: string;
    relevanceScore?: number;
}

export const getRecommendations = async (): Promise<AIRecommendation[]> => {
    // Corrected endpoint to match backend/main_lite.py
    const response = await apiClient.get<AIRecommendation[]>('/api/v1/recommendations');
    return response.data;
};

export const createRecommendation = async (rec: Partial<AIRecommendation>): Promise<AIRecommendation> => {
    const response = await apiClient.post<AIRecommendation>('/api/v1/recommendations', rec);
    return response.data;
};

export const deleteRecommendation = async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/recommendations/${id}`);
};
