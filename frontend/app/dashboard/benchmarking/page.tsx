'use client';

import { useBenchmarking } from '@/hooks/useBenchmarking';
import { LoadingSpinner } from '@/components/LoadingStates';
import { ErrorAlert } from '@/components/ErrorStates';
import { BarChart3, TrendingUp, Award, RefreshCw } from 'lucide-react';

export default function BenchmarkingPage() {
    const { data: benchmarks, loading, error, refetch } = useBenchmarking();

    const stats = {
        totalMetrics: benchmarks?.metrics?.length || 0,
        avgScore: benchmarks?.averageScore || 0,
        topPerformer: benchmarks?.topPerformer || 'N/A'
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
                                <BarChart3 className="h-8 w-8 text-cyan-400" />
                                Performance Benchmarking
                            </h1>
                            <p className="text-gray-400 mt-1">Compare against industry standards</p>
                        </div>
                        <button onClick={() => refetch()} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition">
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Total Metrics</p>
                                <BarChart3 className="h-5 w-5 text-cyan-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.totalMetrics}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Avg Score</p>
                                <TrendingUp className="h-5 w-5 text-green-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.avgScore.toFixed(1)}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Top Performer</p>
                                <Award className="h-5 w-5 text-yellow-400" />
                            </div>
                            <p className="text-lg font-bold truncate">{stats.topPerformer}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
