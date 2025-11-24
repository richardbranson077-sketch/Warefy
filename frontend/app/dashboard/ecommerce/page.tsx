'use client';

import { useEcommerce } from '@/hooks/useEcommerce';
import { LoadingSpinner } from '@/components/LoadingStates';
import { ErrorAlert } from '@/components/ErrorStates';
import { ShoppingCart, TrendingUp, Package, RefreshCw } from 'lucide-react';

export default function EcommercePage() {
    const { data: ecommerceData, loading, error, refetch } = useEcommerce();

    const stats = {
        totalOrders: ecommerceData?.totalOrders || 0,
        revenue: ecommerceData?.totalRevenue || 0,
        avgOrderValue: ecommerceData?.averageOrderValue || 0
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
                                <ShoppingCart className="h-8 w-8 text-emerald-400" />
                                E-commerce Integration
                            </h1>
                            <p className="text-gray-400 mt-1">Multi-channel sales management</p>
                        </div>
                        <button onClick={() => refetch()} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition">
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Total Orders</p>
                                <Package className="h-5 w-5 text-emerald-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.totalOrders}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Revenue</p>
                                <TrendingUp className="h-5 w-5 text-green-400" />
                            </div>
                            <p className="text-2xl font-bold">${stats.revenue.toFixed(2)}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Avg Order Value</p>
                                <ShoppingCart className="h-5 w-5 text-blue-400" />
                            </div>
                            <p className="text-2xl font-bold">${stats.avgOrderValue.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
