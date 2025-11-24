import apiClient from '../lib/api';

export interface CollaborationSession {
    id: string;
    documentId: string;
    participants: string[];
    startedAt: string;
    updatedAt: string;
}

export const getSessions = async (): Promise<CollaborationSession[]> => {
    const response = await apiClient.get<CollaborationSession[]>('/api/v1/collaboration/sessions');
    return response.data;
};

export const createSession = async (session: Partial<CollaborationSession>): Promise<CollaborationSession> => {
    const response = await apiClient.post<CollaborationSession>('/api/v1/collaboration/sessions', session);
    return response.data;
};

export const deleteSession = async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/collaboration/sessions/${id}`);
};
