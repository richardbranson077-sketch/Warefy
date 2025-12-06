import apiClient from '../lib/api';

export interface Team {
    id: number;
    name: string;
    description?: string;
    createdBy: number;
    createdAt: string;
    memberCount: number;
}

export interface TeamMember {
    id: number;
    userId: number;
    username: string;
    role: string;
    joinedAt: string;
}

export interface Message {
    id: number;
    teamId: number;
    userId: number;
    username: string;
    content: string;
    sentiment?: string;
    attachments?: any[];
    createdAt: string;
    editedAt?: string;
}

export interface Task {
    id: number;
    teamId: number;
    title: string;
    description?: string;
    assignedTo?: number;
    assigneeName?: string;
    createdBy: number;
    creatorName: string;
    status: string;
    priority: string;
    dueDate?: string;
    createdAt: string;
}

export interface Notification {
    id: number;
    type: string;
    content: string;
    relatedId?: number;
    isRead: boolean;
    createdAt: string;
}

export interface AISummary {
    summary: string;
    keyPoints: string[];
    actionItems: string[];
}

export const collaborationService = {
    // Teams
    getTeams: async (): Promise<Team[]> => {
        const response = await apiClient.get<Team[]>('/api/v1/collaboration/teams');
        return response.data;
    },

    createTeam: async (name: string, description?: string): Promise<Team> => {
        const response = await apiClient.post<Team>('/api/v1/collaboration/teams', { name, description });
        return response.data;
    },

    getTeamMembers: async (teamId: number): Promise<TeamMember[]> => {
        const response = await apiClient.get<TeamMember[]>(`/api/v1/collaboration/teams/${teamId}/members`);
        return response.data;
    },

    addTeamMember: async (teamId: number, userId: number): Promise<void> => {
        await apiClient.post(`/api/v1/collaboration/teams/${teamId}/members`, null, { params: { user_id: userId } });
    },

    // Messages
    getMessages: async (teamId: number, limit: number = 50): Promise<Message[]> => {
        const response = await apiClient.get<Message[]>(`/api/v1/collaboration/teams/${teamId}/messages`, { params: { limit } });
        return response.data;
    },

    sendMessage: async (teamId: number, content: string): Promise<Message> => {
        const response = await apiClient.post<Message>(`/api/v1/collaboration/teams/${teamId}/messages`, { content });
        return response.data;
    },

    // AI Features
    generateAIReply: async (context: string, tone: string = 'professional'): Promise<{ suggestedReply: string }> => {
        const response = await apiClient.post<{ suggestedReply: string }>('/api/v1/collaboration/messages/ai-reply', { context, tone });
        return response.data;
    },

    summarizeDiscussion: async (teamId: number): Promise<AISummary> => {
        const response = await apiClient.post<AISummary>(`/api/v1/collaboration/teams/${teamId}/summarize`);
        return response.data;
    },

    // Tasks
    getTasks: async (teamId: number): Promise<Task[]> => {
        const response = await apiClient.get<Task[]>(`/api/v1/collaboration/teams/${teamId}/tasks`);
        return response.data;
    },

    createTask: async (teamId: number, taskData: {
        title: string;
        description?: string;
        assignedTo?: number;
        priority?: string;
        dueDate?: string;
    }): Promise<Task> => {
        const response = await apiClient.post<Task>(`/api/v1/collaboration/teams/${teamId}/tasks`, taskData);
        return response.data;
    },

    updateTask: async (taskId: number, updates: {
        status?: string;
        priority?: string;
        assignedTo?: number;
    }): Promise<void> => {
        await apiClient.put(`/api/v1/collaboration/tasks/${taskId}`, updates);
    },

    // Notifications
    getNotifications: async (limit: number = 20): Promise<Notification[]> => {
        const response = await apiClient.get<Notification[]>('/api/v1/collaboration/notifications', { params: { limit } });
        return response.data;
    },

    markNotificationRead: async (notificationId: number): Promise<void> => {
        await apiClient.put(`/api/v1/collaboration/notifications/${notificationId}/read`);
    }
};
