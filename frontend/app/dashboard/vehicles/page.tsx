'use client';

import { useState, useEffect } from 'react';
import { Truck, Battery, AlertCircle, CheckCircle, MapPin, Fuel, Wrench, Search, Filter } from 'lucide-react';
import { vehicles as vehiclesApi } from '@/lib/api';

export default function FleetPage() {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                setLoading(true);
                const data = await vehiclesApi.getAll();
                if (data && data.length > 0) {
                    const mappedVehicles = data.map((v: any) => ({
                        id: v.vehicle_number,
                        type: v.vehicle_type,
                        driver: v.driver_id ? `Driver #${v.driver_id}` : 'Unassigned',
                        status: v.status,
                        fuel: Math.floor(Math.random() * 40) + 60, // Mock fuel level 60-100%
                        location: 'Active Sector', // Simplified
                        lastMaintenance: v.last_service_date ? new Date(v.last_service_date).toLocaleDateString() : 'N/A',
                        health: Math.floor(Math.random() * 20) + 80 // Mock health 80-100%
                    }));
                    setVehicles(mappedVehicles);
                } else {
                    // Fallback to mock data if empty
                    setVehicles([
                        {
                            id: 'V-101',
                            type: 'Heavy Truck',
                            driver: 'Mike Ross',
                            status: 'Active',
                            fuel: 75,
                            location: 'Route 66, Sector 4',
                            lastMaintenance: '2023-10-15',
                            health: 98
                        },
                        {
                            id: 'V-102',
                            type: 'Delivery Van',
                            driver: 'Rachel Green',
                            status: 'Idle',
                            fuel: 45,
                            location: 'Warehouse A',
                            lastMaintenance: '2023-11-01',
                            health: 100
                        }
                    ]);
                }
            } catch (error) {
                console.error("Failed to fetch vehicles:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchVehicles();
    }, []);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Fleet Management</h1>
                    <p className="text-gray-500 mt-1">Monitor vehicle health, fuel levels, and driver status</p>
                </div>
                <button className="flex items-center px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all font-medium shadow-lg shadow-gray-500/30">
                    <Truck className="h-5 w-5 mr-2" />
                    Add Vehicle
                </button>
            </div>

            {/* Fleet Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Truck className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">+2 new</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">24</h3>
                    <p className="text-sm text-gray-500">Total Vehicles</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                            <CheckCircle className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">85%</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">18</h3>
                    <p className="text-sm text-gray-500">Active Now</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                            <Wrench className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">Urgent</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">3</h3>
                    <p className="text-sm text-gray-500">In Maintenance</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                            <Fuel className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">-12% cost</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">$4.2k</h3>
                    <p className="text-sm text-gray-500">Fuel Cost (Mo)</p>
                </div>
            </div>

            {/* Vehicle Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                    <Truck className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{vehicle.id}</h3>
                                    <p className="text-sm text-gray-500">{vehicle.type}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${vehicle.status === 'Active' ? 'bg-green-100 text-green-700' :
                                vehicle.status === 'Maintenance' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                {vehicle.status}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center text-gray-500">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    Location
                                </div>
                                <span className="font-medium text-gray-900">{vehicle.location}</span>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center text-gray-500">
                                    <Fuel className="h-4 w-4 mr-2" />
                                    Fuel Level
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${vehicle.fuel < 30 ? 'bg-red-500' : 'bg-green-500'
                                                }`}
                                            style={{ width: `${vehicle.fuel}%` }}
                                        ></div>
                                    </div>
                                    <span className="font-medium text-gray-900">{vehicle.fuel}%</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center text-gray-500">
                                    <Activity className="h-4 w-4 mr-2" />
                                    Health Score
                                </div>
                                <span className={`font-bold ${vehicle.health > 90 ? 'text-green-600' :
                                    vehicle.health > 70 ? 'text-orange-600' : 'text-red-600'
                                    }`}>{vehicle.health}%</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100 flex gap-3">
                            <button className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                                View Logs
                            </button>
                            <button className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors">
                                Track Live
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
