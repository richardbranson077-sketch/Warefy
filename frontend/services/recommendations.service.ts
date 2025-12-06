import api from '@/lib/api';

export interface Recommendation {
    id: string;
    title: string;
    description: string;
    type: 'inventory' | 'logistics' | 'maintenance' | 'safety' | 'cost';
    severity: 'low' | 'medium' | 'high' | 'critical';
    impact: string;
    status: 'active' | 'resolved' | 'ignored';
    created_at: string;
}

export const recommendationsService = {
    // Get all active recommendations
    getAll: async (): Promise<Recommendation[]> => {
        const response = await api.get('/api/v1/recommendations');
        return response.data;
    },

    // Generate new recommendations using AI
    generate: async (): Promise<Recommendation[]> => {
        const response = await api.post('/api/v1/recommendations/generate');
        return response.data;
    },

    // Execute an action on a recommendation
    executeAction: async (id: string, action: string) => {
        const response = await api.post(`/api/v1/recommendations/${id}/action`, null, {
            params: { action }
        });
        return response.data;
    }
};
