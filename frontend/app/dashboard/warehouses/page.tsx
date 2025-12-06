'use client';

import { useState, useEffect } from 'react';
import { useWarehouses } from '@/hooks/useWarehouses';
import { Warehouse } from '@/services/warehouses.service';
import LoadingSpinner from '@/components/LoadingStates';
import { ErrorAlert } from '@/components/ErrorStates';
import { Map, Plus, Box, Truck, MapPin, BarChart3, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function WarehousesPage() {
    const { data: warehouseList, loading, error, refetch, createWarehouse, deleteWarehouse } = useWarehouses();
    const [stats, setStats] = useState({
        total: 0,
        totalCapacity: 0,
        avgUtilization: 0
    });

    useEffect(() => {
        if (warehouseList) {
            const total = warehouseList.length;
            const totalCapacity = warehouseList.reduce((sum, wh) => sum + wh.capacity, 0);
            const avgUtilization = total > 0
                ? warehouseList.reduce((sum, wh) => sum + (wh.currentUtilization || wh.utilization || 0), 0) / total
                : 0;

            setStats({ total, totalCapacity, avgUtilization });
        }
    }, [warehouseList]);

    const createDemoWarehouse = async () => {
        const toastId = toast.loading('Creating warehouse...');
        try {
            const cities = ['Seattle', 'Miami', 'Denver', 'Boston', 'Atlanta'];
            const city = cities[Math.floor(Math.random() * cities.length)];

            await createWarehouse({
                name: `${city} Fulfillment Center`,
                location: `${Math.floor(Math.random() * 999)} Logistics Blvd, ${city}`,
                address: `${Math.floor(Math.random() * 999)} Logistics Blvd, ${city}`,
                capacity: Math.floor(Math.random() * 15000) + 5000,
                // Add random lat/lon for demo
                latitude: 30 + Math.random() * 10,
                longitude: -100 + Math.random() * 20
            } as any); // Cast to any to bypass strict type check if interface mismatches slightly

            toast.success('Warehouse created!', { id: toastId });
            refetch();
        } catch (error) {
            console.error('Failed to create demo warehouse:', error);
            toast.error('Failed to create warehouse', { id: toastId });
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this warehouse?')) return;

        const toastId = toast.loading('Deleting warehouse...');
        try {
            await deleteWarehouse(id);
            toast.success('Warehouse deleted', { id: toastId });
            refetch();
        } catch (error) {
            console.error('Failed to delete warehouse:', error);
            toast.error('Failed to delete warehouse (check if it has inventory)', { id: toastId });
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorAlert message={error} />;

    return (
        <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Box className="h-6 w-6 text-blue-400" />
                        Warehouses
                    </h1>
                    <p className="text-gray-400 mt-1">Manage your fulfillment centers and inventory distribution</p>
                </div>
                <button
                    onClick={createDemoWarehouse}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow-lg shadow-blue-900/20"
                >
                    <Plus className="h-4 w-4" /> Add Warehouse
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                            <Box className="h-6 w-6" />
                        </div>
                        <span className="text-xs text-gray-400">Total Facilities</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white">{stats.total}</h3>
                    <p className="text-sm text-gray-400 mt-1">Active Warehouses</p>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
                            <Box className="h-6 w-6" />
                        </div>
                        <span className="text-xs text-gray-400">Total Capacity</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white">{stats.totalCapacity.toLocaleString()}</h3>
                    <p className="text-sm text-gray-400 mt-1">Storage Units</p>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-500/10 rounded-lg text-green-400">
                            <BarChart3 className="h-6 w-6" />
                        </div>
                        <span className="text-xs text-gray-400">Avg Utilization</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white">{stats.avgUtilization.toFixed(1)}%</h3>
                    <p className="text-sm text-gray-400 mt-1">Space Usage</p>
                </div>
            </div>

            {/* Warehouse Grid */}
            {warehouseList.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
                    <Box className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white">No Warehouses Found</h3>
                    <p className="text-gray-400 mt-2 mb-6">Get started by adding your first warehouse.</p>
                    <button
                        onClick={createDemoWarehouse}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                    >
                        Create Demo Warehouse
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {warehouseList.map((wh: any) => (
                        <div key={wh.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg hover:border-blue-500/50 transition group flex flex-col">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition">
                                    <Box className="h-6 w-6" />
                                </div>
                                <div className="flex gap-2">
                                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center">
                                        Active
                                    </span>
                                    <button
                                        onClick={() => handleDelete(wh.id)}
                                        className="p-1 text-gray-500 hover:text-red-400 transition"
                                        title="Delete Warehouse"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-1 truncate">{wh.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                                <MapPin className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{wh.address || wh.location}</span>
                            </div>

                            <div className="mt-auto">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400">Utilization</span>
                                    <span className="text-white font-medium">{(wh.utilization || wh.currentUtilization || 0).toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2 mb-4 overflow-hidden">
                                    <div
                                        className={`h-2 rounded-full ${(wh.utilization || 0) > 90 ? 'bg-red-500' :
                                            (wh.utilization || 0) > 75 ? 'bg-yellow-500' : 'bg-blue-500'
                                            }`}
                                        style={{ width: `${Math.min(wh.utilization || 0, 100)}%` }}
                                    ></div>
                                </div>

                                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                    <span>0 Items</span>
                                    <span>{wh.capacity.toLocaleString()} Max</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Link
                                        href={`/dashboard/warehouses/${wh.id}`}
                                        className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                                    >
                                        <Box className="h-4 w-4" /> Inventory
                                    </Link>
                                    <Link
                                        href={`/dashboard/warehouses/${wh.id}/map`}
                                        className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                                    >
                                        <Map className="h-4 w-4" /> Map
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
