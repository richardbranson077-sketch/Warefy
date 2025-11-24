import apiClient from '../lib/api';

export interface Setting {
    key: string;
    value: string;
    description?: string;
}

export const getSettings = async (): Promise<Setting[]> => {
    const response = await apiClient.get<Setting[]>('/api/v1/settings');
    return response.data;
};

export const updateSetting = async (key: string, value: string): Promise<Setting> => {
    const response = await apiClient.put<Setting>(`/api/v1/settings/${key}`, { value });
    return response.data;
};

export const deleteSetting = async (key: string): Promise<void> => {
    await apiClient.delete(`/api/v1/settings/${key}`);
};
