'use client';

import { useState } from 'react';
import { useVehicles } from '@/hooks/useVehicles';
import { LoadingSpinner } from '@/components/LoadingStates';
import { ErrorAlert } from '@/components/ErrorStates';
import {
    Truck,
    Activity,
    AlertTriangle,
    CheckCircle,
    RefreshCw,
    Eye,
    Plus
} from 'lucide-react';

export default function VehiclesPage() {
    const { data: vehicles, loading, error, refetch } = useVehicles();

    const [statusFilter, setStatusFilter] = useState('all');

    const filteredVehicles = (vehicles || []).filter(vehicle => {
        if (statusFilter === 'all') return true;
        return vehicle.status === statusFilter;
    });

    const stats = {
        total: vehicles?.length || 0,
        active: vehicles?.filter(v => v.status === 'active').length || 0,
        maintenance: vehicles?.filter(v => v.status === 'maintenance').length || 0,
        inactive: vehicles?.filter(v => v.status === 'inactive').length || 0
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
                                <Truck className="h-8 w-8 text-cyan-400" />
                                Fleet Management
                            </h1>
                            <p className="text-gray-400 mt-1">Manage delivery vehicles</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => refetch()}
                                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Refresh
                            </button>
                            <button className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition">
                                <Plus className="h-4 w-4" />
                                Add Vehicle
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Total Vehicles</p>
                                <Truck className="h-5 w-5 text-cyan-400" />
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
                                <p className="text-sm text-gray-400">Maintenance</p>
                                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.maintenance}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Inactive</p>
                                <Activity className="h-5 w-5 text-gray-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.inactive}</p>
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-750 border-b border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Vehicle ID</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">License Plate</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Type</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {filteredVehicles.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                                            No vehicles found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredVehicles.map((vehicle) => (
                                        <tr key={vehicle.id} className="hover:bg-gray-750 transition">
                                            <td className="px-4 py-3 text-sm font-mono">{vehicle.id}</td>
                                            <td className="px-4 py-3 text-sm">{vehicle.licensePlate}</td>
                                            <td className="px-4 py-3 text-sm">{vehicle.type}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs ${vehicle.status === 'active' ? 'bg-green-400/10 text-green-400' :
                                                        vehicle.status === 'maintenance' ? 'bg-yellow-400/10 text-yellow-400' :
                                                            'bg-gray-400/10 text-gray-400'
                                                    }`}>
                                                    {vehicle.status}
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
