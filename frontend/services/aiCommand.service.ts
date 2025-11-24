import apiClient from '../lib/api';

export interface AICommand {
    id: string;
    command: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export const getCommands = async (): Promise<AICommand[]> => {
    const response = await apiClient.get<AICommand[]>('/api/v1/ai/commands');
    return response.data;
};

export const executeCommand = async (commandId: string, payload: any): Promise<any> => {
    const response = await apiClient.post<any>(`/api/v1/ai/commands/${commandId}/execute`, payload);
    return response.data;
};

export const createCommand = async (cmd: Partial<AICommand>): Promise<AICommand> => {
    const response = await apiClient.post<AICommand>('/api/v1/ai/commands', cmd);
    return response.data;
};

export const deleteCommand = async (commandId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/ai/commands/${commandId}`);
};
