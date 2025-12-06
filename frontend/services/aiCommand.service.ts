import apiClient from '../lib/api';

export interface AICommandResponse {
    response: string;
}

export const sendCommand = async (prompt: string, history: any[] = []): Promise<AICommandResponse> => {
    const response = await apiClient.post<AICommandResponse>('/api/v1/ai/command', { prompt, history });
    return response.data;
};

