'use client';

import { useEffect, useState } from 'react';
import { warehouses } from '@/lib/api';
import { Map, Plus, Box, Truck } from 'lucide-react';
import Link from 'next/link';

export default function WarehousesPage() {
    const [warehouseList, setWarehouseList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const fetchWarehouses = async () => {
        try {
            const data = await warehouses.getAll();
            setWarehouseList(data);
        } catch (error) {
            console.error('Failed to fetch warehouses:', error);
        } finally {
            setLoading(false);
        }
    };

    const createDemoWarehouse = async () => {
        try {
            await warehouses.create({
                name: 'Demo Fulfillment Center',
                address: '123 Logistics Way, Tech City',
                latitude: 37.7749,
                longitude: -122.4194,
                capacity: 10000
            });
            fetchWarehouses();
        } catch (error) {
            console.error('Failed to create demo warehouse:', error);
        }
    };

    return (
        <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Box className="h-6 w-6 text-blue-400" />
                        Warehouses
                    </h1>
                    <p className="text-gray-400 mt-1">Manage your fulfillment centers</p>
                </div>
                <button
                    onClick={createDemoWarehouse}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow-lg shadow-blue-900/20"
                >
                    <Plus className="h-4 w-4" /> Add Demo Warehouse
                </button>
            </div>

            {loading ? (
                <div className="text-gray-400">Loading warehouses...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        warehouseList.map((wh) => (
                            <div key={wh.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg hover:border-blue-500/50 transition group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition">
                                        <Box className="h-6 w-6" />
                                    </div>
                                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Active</span>
                                </div>

                                <h3 className="text-lg font-bold text-white mb-1">{wh.name}</h3>
                                <p className="text-sm text-gray-400 mb-4">{wh.address}</p>

                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                                    <div className="flex items-center gap-1">
                                        <Box className="h-4 w-4" />
                                        <span>{wh.capacity.toLocaleString()} Capacity</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Link
                                        href={`/dashboard/warehouses/${wh.id}/map`}
                                        className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                                    >
                                        <Map className="h-4 w-4" /> Layout Map
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
