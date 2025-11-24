import apiClient from '../lib/api';

export interface AIChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

export interface AIChatSession {
    id: string;
    messages: AIChatMessage[];
    createdAt: string;
    updatedAt: string;
}

export const getChatSessions = async (): Promise<AIChatSession[]> => {
    const response = await apiClient.get<AIChatSession[]>('/api/v1/ai/chat/sessions');
    return response.data;
};

export const getChatMessages = async (sessionId: string): Promise<AIChatMessage[]> => {
    const response = await apiClient.get<AIChatMessage[]>(`/api/v1/ai/chat/sessions/${sessionId}/messages`);
    return response.data;
};

export const sendMessage = async (sessionId: string, content: string): Promise<AIChatMessage> => {
    const response = await apiClient.post<AIChatMessage>(`/api/v1/ai/chat/sessions/${sessionId}/messages`, { role: 'user', content });
    return response.data;
};

export const createChatSession = async (): Promise<AIChatSession> => {
    const response = await apiClient.post<AIChatSession>('/api/v1/ai/chat/sessions');
    return response.data;
};

export const deleteChatSession = async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/ai/chat/sessions/${sessionId}`);
};
