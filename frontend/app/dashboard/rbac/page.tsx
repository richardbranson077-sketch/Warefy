'use client';

import { useState } from 'react';
import { useRBAC } from '@/hooks/useRBAC';
import { LoadingSpinner } from '@/components/LoadingStates';
import { ErrorAlert } from '@/components/ErrorStates';
import { Lock, Users, Key, Shield, RefreshCw } from 'lucide-react';

export default function RBACPage() {
    const { data: rbacData, loading, error, refetch } = useRBAC();
    
    const stats = {
        totalRoles: rbacData?.roles?.length || 0,
        totalUsers: rbacData?.users?.length || 0,
        totalPermissions: rbacData?.permissions?.length || 0,
        activeUsers: rbacData?.users?.filter(u => u.isActive).length || 0
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
                                <Lock className="h-8 w-8 text-rose-400" />
                                Role-Based Access Control
                            </h1>
                            <p className="text-gray-400 mt-1">Manage roles and permissions</p>
                        </div>
                        <button onClick={() => refetch()} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg transition">
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Total Roles</p>
                                <Shield className="h-5 w-5 text-rose-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.totalRoles}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Total Users</p>
                                <Users className="h-5 w-5 text-blue-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.totalUsers}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Permissions</p>
                                <Key className="h-5 w-5 text-yellow-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.totalPermissions}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Active Users</p>
                                <Users className="h-5 w-5 text-green-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.activeUsers}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
