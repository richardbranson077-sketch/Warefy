import apiClient from '../lib/api';

export interface EdgeAIModel {
    id: string;
    name: string;
    version: string;
    status: 'deployed' | 'training' | 'failed';
    deployedAt?: string;
}

export const getModels = async (): Promise<EdgeAIModel[]> => {
    const response = await apiClient.get<EdgeAIModel[]>('/api/v1/edge-ai/models');
    return response.data;
};

export const deployModel = async (model: Partial<EdgeAIModel>): Promise<EdgeAIModel> => {
    const response = await apiClient.post<EdgeAIModel>('/api/v1/edge-ai/models', model);
    return response.data;
};

export const deleteModel = async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/edge-ai/models/${id}`);
};
