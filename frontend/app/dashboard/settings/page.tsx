'use client';

import { useSettings } from '@/hooks/useSettings';
import { LoadingSpinner } from '@/components/LoadingStates';
import { ErrorAlert } from '@/components/ErrorStates';
import { Settings, Bell, Lock, Globe, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
    const { data: settings, loading, error, refetch } = useSettings();

    return (
        <>
            {loading && <LoadingSpinner />}
            {error && <ErrorAlert message={error} />}
            {!loading && !error && (
                <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <Settings className="h-8 w-8 text-gray-400" />
                                System Settings
                            </h1>
                            <p className="text-gray-400 mt-1">Configure application preferences</p>
                        </div>
                        <button onClick={() => refetch()} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition">
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>
                    <div className="space-y-6">
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Bell className="h-6 w-6 text-yellow-400" />
                                <h2 className="text-xl font-bold">Notifications</h2>
                            </div>
                            <p className="text-gray-400">Manage notification preferences</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Lock className="h-6 w-6 text-red-400" />
                                <h2 className="text-xl font-bold">Security</h2>
                            </div>
                            <p className="text-gray-400">Security and privacy settings</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Globe className="h-6 w-6 text-blue-400" />
                                <h2 className="text-xl font-bold">Localization</h2>
                            </div>
                            <p className="text-gray-400">Language and region preferences</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
