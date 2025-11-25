/**
 * Financials Service
 * Handles API calls for financial reporting and transactions
 */

import apiClient from '@/lib/api';

export interface FinancialSummary {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    period: string;
}

export interface Transaction {
    id: number;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description: string;
    date: string;
}

export const financialsService = {
    /**
     * Get financial summary
     */
    getSummary: async (period: 'month' | 'quarter' | 'year' = 'month') => {
        const response = await apiClient.get<FinancialSummary>('/api/v1/financials/summary', {
            params: { period }
        });
        return response.data;
    },

    /**
     * Get all transactions
     */
    getTransactions: async (params?: { startDate?: string; endDate?: string; type?: string }) => {
        const response = await apiClient.get<Transaction[]>('/api/v1/financials/transactions', { params });
        return response.data;
    },

    /**
     * Get profit and loss statement
     */
    getProfitLoss: async (startDate: string, endDate: string) => {
        const response = await apiClient.get('/api/v1/financials/profit-loss', {
            params: { startDate, endDate }
        });
        return response.data;
    },
};
