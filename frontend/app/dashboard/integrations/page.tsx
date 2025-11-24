'use client';

import { useIntegrations } from '@/hooks/useIntegrations';
import { LoadingSpinner } from '@/components/LoadingStates';
import { ErrorAlert } from '@/components/ErrorStates';
import { Plug, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export default function IntegrationsPage() {
    const { data: integrations, loading, error, refetch } = useIntegrations();

    const stats = {
        total: integrations?.length || 0,
        active: integrations?.filter(i => i.status === 'active').length || 0,
        inactive: integrations?.filter(i => i.status === 'inactive').length || 0
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
                                <Plug className="h-8 w-8 text-teal-400" />
                                Integrations Hub
                            </h1>
                            <p className="text-gray-400 mt-1">Manage third-party connections</p>
                        </div>
                        <button onClick={() => refetch()} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition">
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Total Integrations</p>
                                <Plug className="h-5 w-5 text-teal-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Active</p>
                                <CheckCircle className="h-5 w-5 text-green-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.active}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Inactive</p>
                                <XCircle className="h-5 w-5 text-gray-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.inactive}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
