import apiClient from '../lib/api';

export interface AuditLog {
    id: number;
    user_id: number;
    target_user_id?: number;
    action: string;
    details?: string;
    extra_data?: any;
    hash?: string;
    previous_hash?: string;
    timestamp: string;
}

export interface ChainStatus {
    isValid: boolean;
    totalBlocks: number;
    compromisedBlockId?: number;
    message: string;
}

export const blockchainService = {
    getBlocks: async (limit: number = 50): Promise<AuditLog[]> => {
        const response = await apiClient.get<AuditLog[]>('/api/v1/blockchain/blocks', { params: { limit } });
        return response.data;
    },

    verifyChain: async (): Promise<ChainStatus> => {
        const response = await apiClient.post<ChainStatus>('/api/v1/blockchain/verify');
        return response.data;
    },

    analyzeChain: async (query: string): Promise<{ analysis: string }> => {
        const response = await apiClient.post<{ analysis: string }>('/api/v1/blockchain/analyze', null, { params: { query } });
        return response.data;
    }
};
