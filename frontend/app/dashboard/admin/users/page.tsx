'use client';

import { useAdmin } from '@/hooks/useAdmin';
import { LoadingSpinner } from '@/components/LoadingStates';
import { ErrorAlert } from '@/components/ErrorStates';
import { Users, UserPlus, Shield, RefreshCw } from 'lucide-react';

export default function AdminUsersPage() {
    const { data: adminData, loading, error, refetch } = useAdmin();

    const stats = {
        totalUsers: adminData?.users?.length || 0,
        activeUsers: adminData?.users?.filter(u => u.isActive).length || 0,
        admins: adminData?.users?.filter(u => u.role === 'admin').length || 0
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
                                <Users className="h-8 w-8 text-indigo-400" />
                                User Administration
                            </h1>
                            <p className="text-gray-400 mt-1">Manage system users</p>
                        </div>
                        <button onClick={() => refetch()} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition">
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Total Users</p>
                                <Users className="h-5 w-5 text-indigo-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.totalUsers}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Active Users</p>
                                <UserPlus className="h-5 w-5 text-green-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.activeUsers}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Administrators</p>
                                <Shield className="h-5 w-5 text-red-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.admins}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
