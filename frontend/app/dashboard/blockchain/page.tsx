'use client';

import { useBlockchain } from '@/hooks/useBlockchain';
import { LoadingSpinner } from '@/components/LoadingStates';
import { ErrorAlert } from '@/components/ErrorStates';
import { Link, Shield, Hash, RefreshCw } from 'lucide-react';

export default function BlockchainPage() {
    const { data: blockchainData, loading, error, refetch } = useBlockchain();

    const stats = {
        totalBlocks: blockchainData?.blocks?.length || 0,
        transactions: blockchainData?.totalTransactions || 0,
        verified: blockchainData?.verifiedTransactions || 0
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
                                <Link className="h-8 w-8 text-purple-400" />
                                Blockchain Tracking
                            </h1>
                            <p className="text-gray-400 mt-1">Immutable supply chain records</p>
                        </div>
                        <button onClick={() => refetch()} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition">
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Total Blocks</p>
                                <Hash className="h-5 w-5 text-purple-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.totalBlocks}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Transactions</p>
                                <Link className="h-5 w-5 text-blue-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.transactions}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Verified</p>
                                <Shield className="h-5 w-5 text-green-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.verified}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
