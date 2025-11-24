'use client';

import { useState } from 'react';
import { useQuality } from '@/hooks/useQuality';
import { LoadingSpinner } from '@/components/LoadingStates';
import { ErrorAlert } from '@/components/ErrorStates';
import { Shield, CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

export default function QualityControlPage() {
    const { data: qualityData, loading, error, refetch } = useQuality();
    
    const stats = {
        totalInspections: qualityData?.length || 0,
        passed: qualityData?.filter(q => q.status === 'passed').length || 0,
        failed: qualityData?.filter(q => q.status === 'failed').length || 0,
        passRate: qualityData?.length ? ((qualityData.filter(q => q.status === 'passed').length / qualityData.length) * 100) : 0
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
                                <Shield className="h-8 w-8 text-teal-400" />
                                Quality Control
                            </h1>
                            <p className="text-gray-400 mt-1">Monitor product quality</p>
                        </div>
                        <button onClick={() => refetch()} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition">
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Total Inspections</p>
                                <Shield className="h-5 w-5 text-teal-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.totalInspections}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Passed</p>
                                <CheckCircle className="h-5 w-5 text-green-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.passed}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Failed</p>
                                <XCircle className="h-5 w-5 text-red-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.failed}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Pass Rate</p>
                                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.passRate.toFixed(1)}%</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
