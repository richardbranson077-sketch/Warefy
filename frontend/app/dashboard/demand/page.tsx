'use client';

import { useState } from 'react';
import { useDemand } from '@/hooks/useDemand';
import { LoadingSpinner } from '@/components/LoadingStates';
import { ErrorAlert } from '@/components/ErrorStates';
import {
    TrendingUp,
    Calendar,
    BarChart3,
    Download,
    RefreshCw,
    AlertCircle
} from 'lucide-react';

export default function DemandForecastingPage() {
    const { data: forecasts, loading, error, refetch } = useDemand();

    const [timeRange, setTimeRange] = useState('30');

    const stats = {
        totalForecasts: forecasts?.length || 0,
        avgAccuracy: forecasts?.reduce((sum, f) => sum + (f.accuracy || 0), 0) / (forecasts?.length || 1) || 0,
        highDemand: forecasts?.filter(f => f.predictedDemand > 100).length || 0
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
                                <TrendingUp className="h-8 w-8 text-purple-400" />
                                Demand Forecasting
                            </h1>
                            <p className="text-gray-400 mt-1">AI-powered demand predictions</p>
                        </div>
                        <button
                            onClick={() => refetch()}
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Total Forecasts</p>
                                <BarChart3 className="h-5 w-5 text-purple-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.totalForecasts}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Avg Accuracy</p>
                                <TrendingUp className="h-5 w-5 text-green-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.avgAccuracy.toFixed(1)}%</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">High Demand Items</p>
                                <AlertCircle className="h-5 w-5 text-orange-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.highDemand}</p>
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">Forecast Data</h2>
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                            >
                                <option value="7">7 Days</option>
                                <option value="30">30 Days</option>
                                <option value="90">90 Days</option>
                            </select>
                        </div>
                        <div className="text-center py-12 text-gray-400">
                            {forecasts?.length === 0 ? 'No forecast data available' : `${forecasts?.length} forecasts loaded`}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
