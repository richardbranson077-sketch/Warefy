'use client';

import { useAnomalies } from '@/hooks/useAnomalies';
import { LoadingSpinner } from '@/components/LoadingStates';
import { ErrorAlert } from '@/components/ErrorStates';
import { AlertTriangle, Shield, Eye, RefreshCw } from 'lucide-react';

export default function AnomaliesPage() {
    const { data: anomalies, loading, error, refetch } = useAnomalies();

    const stats = {
        total: anomalies?.length || 0,
        critical: anomalies?.filter(a => a.severity === 'critical').length || 0,
        resolved: anomalies?.filter(a => a.status === 'resolved').length || 0
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
                                <AlertTriangle className="h-8 w-8 text-red-400" />
                                Anomaly Detection
                            </h1>
                            <p className="text-gray-400 mt-1">AI-powered anomaly monitoring</p>
                        </div>
                        <button onClick={() => refetch()} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition">
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Total Anomalies</p>
                                <Eye className="h-5 w-5 text-red-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Critical</p>
                                <AlertTriangle className="h-5 w-5 text-orange-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.critical}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Resolved</p>
                                <Shield className="h-5 w-5 text-green-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.resolved}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
