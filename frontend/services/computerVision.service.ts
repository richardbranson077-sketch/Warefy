import apiClient from '../lib/api';

export interface VisionResult {
    id: string;
    imageUrl: string;
    labels: string[];
    confidenceScores: number[]; // same length as labels
    processedAt: string;
}

export const analyzeImage = async (imageUrl: string): Promise<VisionResult> => {
    const response = await apiClient.post<VisionResult>('/api/v1/vision/analyze', { imageUrl });
    return response.data;
};

export const getResults = async (): Promise<VisionResult[]> => {
    const response = await apiClient.get<VisionResult[]>('/api/v1/vision/results');
    return response.data;
};

export const deleteResult = async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/vision/results/${id}`);
};
