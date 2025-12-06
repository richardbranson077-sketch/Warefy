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
    sku: string;
    product_name: string;
    current_stock: number;
    reorder_point: number;
    recommended_quantity: number;
    urgency: 'critical' | 'high' | 'medium' | 'low';
    reason: string;
    supplier: string;
    estimated_cost: number;
    ai_insight?: string;
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

export interface AIReorderInsight {
    insight: string;
}

export interface StockoutRiskAnalysis {
    critical_risk: any[];
    high_risk: any[];
    medium_risk: any[];
    low_risk: any[];
    no_risk: any[];
}

export const getAIReorderInsight = async (
    sku: string,
    currentStock: number,
    dailyDemand: number,
    leadTime: number
): Promise<AIReorderInsight> => {
    const response = await apiClient.post<AIReorderInsight>('/api/v1/reorder/ai-insight', null, {
        params: { sku, current_stock: currentStock, daily_demand: dailyDemand, lead_time: leadTime }
    });
    return response.data;
};

export const getStockoutRiskAnalysis = async (warehouseId?: number): Promise<StockoutRiskAnalysis> => {
    const response = await apiClient.get<StockoutRiskAnalysis>('/api/v1/reorder/analytics/stockout-risk', {
        params: { warehouse_id: warehouseId }
    });
    return response.data;
};

export const getSupplierPerformance = async (): Promise<any[]> => {
    const response = await apiClient.get<any[]>('/api/v1/reorder/suppliers/performance');
    return response.data;
};
