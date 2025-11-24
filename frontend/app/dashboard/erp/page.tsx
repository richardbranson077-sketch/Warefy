'use client';

import { useERP } from '@/hooks/useERP';
import { LoadingSpinner } from '@/components/LoadingStates';
import { ErrorAlert } from '@/components/ErrorStates';
import { Database, Sync, CheckCircle, RefreshCw } from 'lucide-react';

export default function ERPPage() {
    const { data: erpData, loading, error, refetch } = useERP();

    const stats = {
        connectedSystems: erpData?.systems?.filter(s => s.status === 'connected').length || 0,
        totalSyncs: erpData?.totalSyncs || 0,
        lastSync: erpData?.lastSyncTime || 'Never'
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
                                <Database className="h-8 w-8 text-blue-400" />
                                ERP Integration
                            </h1>
                            <p className="text-gray-400 mt-1">Enterprise resource planning sync</p>
                        </div>
                        <button onClick={() => refetch()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Connected Systems</p>
                                <CheckCircle className="h-5 w-5 text-green-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.connectedSystems}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Total Syncs</p>
                                <Sync className="h-5 w-5 text-blue-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.totalSyncs}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Last Sync</p>
                                <Database className="h-5 w-5 text-purple-400" />
                            </div>
                            <p className="text-sm font-bold truncate">{stats.lastSync}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
