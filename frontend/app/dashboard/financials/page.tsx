'use client';

import { useFinancials } from '@/hooks/useFinancials';
import { LoadingSpinner } from '@/components/LoadingStates';
import { ErrorAlert } from '@/components/ErrorStates';
import { DollarSign, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

export default function FinancialsPage() {
    const { data: financials, loading, error, refetch } = useFinancials();

    const stats = {
        revenue: financials?.totalRevenue || 0,
        expenses: financials?.totalExpenses || 0,
        profit: (financials?.totalRevenue || 0) - (financials?.totalExpenses || 0),
        margin: financials?.profitMargin || 0
    };

    return (
        <>
            {loading && <LoadingSpinner />}
            {error && <ErrorAlert message={error} />}
            {!loading && !error && (
                <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <DollarSign className="h-8 w-8 text-green-400" />
                                Financial Overview
                            </h1>
                            <p className="text-gray-400 mt-1">Revenue, expenses, and profitability</p>
                        </div>
                        <button onClick={() => refetch()} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Revenue</p>
                                <TrendingUp className="h-5 w-5 text-green-400" />
                            </div>
                            <p className="text-2xl font-bold">${stats.revenue.toFixed(2)}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Expenses</p>
                                <TrendingDown className="h-5 w-5 text-red-400" />
                            </div>
                            <p className="text-2xl font-bold">${stats.expenses.toFixed(2)}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Profit</p>
                                <DollarSign className="h-5 w-5 text-blue-400" />
                            </div>
                            <p className="text-2xl font-bold">${stats.profit.toFixed(2)}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Margin</p>
                                <TrendingUp className="h-5 w-5 text-purple-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.margin.toFixed(1)}%</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
