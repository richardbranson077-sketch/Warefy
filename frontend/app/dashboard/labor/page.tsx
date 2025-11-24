'use client';

import { useState } from 'react';
import { useLabor } from '@/hooks/useLabor';
import { LoadingSpinner } from '@/components/LoadingStates';
import { ErrorAlert } from '@/components/ErrorStates';
import { Users, Clock, DollarSign, TrendingUp, RefreshCw } from 'lucide-react';

export default function LaborManagementPage() {
    const { data: laborData, loading, error, refetch } = useLabor();
    
    const stats = {
        totalEmployees: laborData?.length || 0,
        activeShifts: laborData?.filter(l => l.status === 'active').length || 0,
        totalHours: laborData?.reduce((sum, l) => sum + (l.hoursWorked || 0), 0) || 0,
        totalCost: laborData?.reduce((sum, l) => sum + (l.cost || 0), 0) || 0
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
                                <Users className="h-8 w-8 text-amber-400" />
                                Labor Management
                            </h1>
                            <p className="text-gray-400 mt-1">Track workforce and shifts</p>
                        </div>
                        <button onClick={() => refetch()} className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition">
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Total Employees</p>
                                <Users className="h-5 w-5 text-amber-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.totalEmployees}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Active Shifts</p>
                                <Clock className="h-5 w-5 text-green-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.activeShifts}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Total Hours</p>
                                <TrendingUp className="h-5 w-5 text-blue-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.totalHours.toFixed(1)}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Total Cost</p>
                                <DollarSign className="h-5 w-5 text-red-400" />
                            </div>
                            <p className="text-2xl font-bold">${stats.totalCost.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
