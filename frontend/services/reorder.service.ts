import apiClient from '../lib/api';

export interface ReorderItem {
    id: string;
    productId: string;
    quantity: number;
    status: 'pending' | 'ordered' | 'received' | 'canceled';
    createdAt: string;
    updatedAt: string;
}

export interface ReorderSuggestion {
    productId: string;
    suggestedQuantity: number;
    confidence: number; // 0-1
}

export const getReorderItems = async (): Promise<ReorderItem[]> => {
    const response = await apiClient.get<ReorderItem[]>('/api/v1/reorder/items');
    return response.data;
};

export const createReorderItem = async (item: Partial<ReorderItem>): Promise<ReorderItem> => {
    const response = await apiClient.post<ReorderItem>('/api/v1/reorder/items', item);
    return response.data;
};

export const updateReorderItem = async (id: string, item: Partial<ReorderItem>): Promise<ReorderItem> => {
    const response = await apiClient.put<ReorderItem>(`/api/v1/reorder/items/${id}`, item);
    return response.data;
};

export const deleteReorderItem = async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/reorder/items/${id}`);
};

export const getReorderSuggestions = async (): Promise<ReorderSuggestion[]> => {
    const response = await apiClient.get<ReorderSuggestion[]>('/api/v1/reorder/suggestions');
    return response.data;
};
