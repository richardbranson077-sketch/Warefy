import apiClient from '../lib/api';

export interface BlockchainTransaction {
    id: string;
    hash: string;
    status: 'pending' | 'confirmed' | 'failed';
    createdAt: string;
    confirmedAt?: string;
}

export const getTransactions = async (): Promise<BlockchainTransaction[]> => {
    const response = await apiClient.get<BlockchainTransaction[]>('/api/v1/blockchain/transactions');
    return response.data;
};

export const submitTransaction = async (tx: Partial<BlockchainTransaction>): Promise<BlockchainTransaction> => {
    const response = await apiClient.post<BlockchainTransaction>('/api/v1/blockchain/transactions', tx);
    return response.data;
};

export const deleteTransaction = async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/blockchain/transactions/${id}`);
};
