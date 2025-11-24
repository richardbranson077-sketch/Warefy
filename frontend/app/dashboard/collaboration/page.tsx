'use client';

import { useState } from 'react';
import { useCollaboration } from '@/hooks/useCollaboration';
import { LoadingSpinner } from '@/components/LoadingStates';
import { ErrorAlert } from '@/components/ErrorStates';
import { MessageSquare, Users, Bell, RefreshCw } from 'lucide-react';

export default function CollaborationPage() {
    const { data: collabData, loading, error, refetch } = useCollaboration();
    
    const stats = {
        totalMessages: collabData?.messages?.length || 0,
        activeUsers: collabData?.activeUsers?.length || 0,
        unreadNotifications: collabData?.notifications?.filter(n => !n.isRead).length || 0
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
                                <MessageSquare className="h-8 w-8 text-sky-400" />
                                Team Collaboration
                            </h1>
                            <p className="text-gray-400 mt-1">Real-time team communication</p>
                        </div>
                        <button onClick={() => refetch()} className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg transition">
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Total Messages</p>
                                <MessageSquare className="h-5 w-5 text-sky-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.totalMessages}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Active Users</p>
                                <Users className="h-5 w-5 text-green-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.activeUsers}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Unread Notifications</p>
                                <Bell className="h-5 w-5 text-orange-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.unreadNotifications}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
