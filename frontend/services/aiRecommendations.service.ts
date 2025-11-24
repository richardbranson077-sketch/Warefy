import apiClient from '../lib/api';

export interface AIRecommendation {
    id: string;
    title: string;
    content: string;
    relevanceScore: number; // 0-1
    createdAt: string;
    updatedAt: string;
}

export const getRecommendations = async (): Promise<AIRecommendation[]> => {
    const response = await apiClient.get<AIRecommendation[]>('/api/v1/ai/recommendations');
    return response.data;
};

export const createRecommendation = async (rec: Partial<AIRecommendation>): Promise<AIRecommendation> => {
    const response = await apiClient.post<AIRecommendation>('/api/v1/ai/recommendations', rec);
    return response.data;
};

export const deleteRecommendation = async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/ai/recommendations/${id}`);
};
