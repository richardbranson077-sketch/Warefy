'use client';

import { useState } from 'react';
import { useRoutes } from '@/hooks/useRoutes';
import { LoadingSpinner } from '@/components/LoadingStates';
import { ErrorAlert } from '@/components/ErrorStates';
import {
    MapPin,
    Navigation,
    Clock,
    TrendingUp,
    RefreshCw,
    Eye
} from 'lucide-react';

export default function RoutesPage() {
    const { data: routes, loading, error, refetch } = useRoutes();

    const [selectedRoute, setSelectedRoute] = useState(null);

    const stats = {
        totalRoutes: routes?.length || 0,
        activeRoutes: routes?.filter(r => r.status === 'active').length || 0,
        avgDistance: routes?.reduce((sum, r) => sum + (r.distance || 0), 0) / (routes?.length || 1) || 0
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
                                <Navigation className="h-8 w-8 text-indigo-400" />
                                Route Optimization
                            </h1>
                            <p className="text-gray-400 mt-1">Optimize delivery routes</p>
                        </div>
                        <button
                            onClick={() => refetch()}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Total Routes</p>
                                <MapPin className="h-5 w-5 text-indigo-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.totalRoutes}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Active Routes</p>
                                <Navigation className="h-5 w-5 text-green-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.activeRoutes}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Avg Distance</p>
                                <TrendingUp className="h-5 w-5 text-blue-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.avgDistance.toFixed(1)} km</p>
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-750 border-b border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Route ID</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Origin</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Destination</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {routes?.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                                            No routes found
                                        </td>
                                    </tr>
                                ) : (
                                    routes?.map((route) => (
                                        <tr key={route.id} className="hover:bg-gray-750 transition">
                                            <td className="px-4 py-3 text-sm font-mono">{route.id}</td>
                                            <td className="px-4 py-3 text-sm">{route.origin}</td>
                                            <td className="px-4 py-3 text-sm">{route.destination}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs ${route.status === 'active' ? 'bg-green-400/10 text-green-400' : 'bg-gray-400/10 text-gray-400'
                                                    }`}>
                                                    {route.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button className="p-1 hover:bg-gray-700 rounded transition">
                                                    <Eye className="h-4 w-4 text-gray-400" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
}
