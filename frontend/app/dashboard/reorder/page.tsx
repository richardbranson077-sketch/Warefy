'use client';

import { useState } from 'react';
import { useReorder } from '@/hooks/useReorder';
import { LoadingSpinner } from '@/components/LoadingStates';
import { ErrorAlert } from '@/components/ErrorStates';
import { Package, AlertCircle, TrendingDown, RefreshCw } from 'lucide-react';

export default function ReorderPage() {
    const { data: reorderData, loading, error, refetch } = useReorder();
    
    const stats = {
        totalItems: reorderData?.length || 0,
        belowReorder: reorderData?.filter(r => r.currentStock < r.reorderPoint).length || 0,
        criticalStock: reorderData?.filter(r => r.currentStock < (r.reorderPoint * 0.5)).length || 0,
        totalValue: reorderData?.reduce((sum, r) => sum + (r.reorderValue || 0), 0) || 0
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
                                <Package className="h-8 w-8 text-orange-400" />
                                Reorder Points
                            </h1>
                            <p className="text-gray-400 mt-1">Automated reorder management</p>
                        </div>
                        <button onClick={() => refetch()} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition">
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Total Items</p>
                                <Package className="h-5 w-5 text-orange-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.totalItems}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Below Reorder</p>
                                <TrendingDown className="h-5 w-5 text-yellow-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.belowReorder}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Critical Stock</p>
                                <AlertCircle className="h-5 w-5 text-red-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.criticalStock}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Reorder Value</p>
                                <Package className="h-5 w-5 text-green-400" />
                            </div>
                            <p className="text-2xl font-bold">${stats.totalValue.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
