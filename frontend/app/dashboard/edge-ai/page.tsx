'use client';

import { useEdgeAI } from '@/hooks/useEdgeAI';
import { LoadingSpinner } from '@/components/LoadingStates';
import { ErrorAlert } from '@/components/ErrorStates';
import { Cpu, Zap, Activity, RefreshCw } from 'lucide-react';

export default function EdgeAIPage() {
    const { data: edgeData, loading, error, refetch } = useEdgeAI();

    const stats = {
        activeDevices: edgeData?.devices?.filter(d => d.status === 'active').length || 0,
        totalInferences: edgeData?.totalInferences || 0,
        avgLatency: edgeData?.averageLatency || 0
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
                                <Cpu className="h-8 w-8 text-lime-400" />
                                Edge AI
                            </h1>
                            <p className="text-gray-400 mt-1">Distributed AI processing</p>
                        </div>
                        <button onClick={() => refetch()} className="flex items-center gap-2 bg-lime-600 hover:bg-lime-700 text-white px-4 py-2 rounded-lg transition">
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Active Devices</p>
                                <Cpu className="h-5 w-5 text-lime-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.activeDevices}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Total Inferences</p>
                                <Zap className="h-5 w-5 text-yellow-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.totalInferences}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Avg Latency</p>
                                <Activity className="h-5 w-5 text-green-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.avgLatency}ms</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
