'use client';

import { useState, useEffect } from 'react';
import { Truck, Battery, AlertCircle, CheckCircle, MapPin, Fuel, Wrench, Search, Filter, Activity } from 'lucide-react';
import { vehicles as vehiclesApi } from '@/lib/api';

interface Vehicle {
    id: string;
    type: string;
    driver: string;
    status: string;
    fuel: number;
    location: string;
    lastMaintenance: string;
    health: number;
}

export default function FleetPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                setLoading(true);
                const data = await vehiclesApi.getAll({});
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
                    <h1 className="text-3xl font-bold text-white">Fleet Management</h1>
                    <p className="text-gray-400 mt-1">Monitor vehicle health, fuel levels, and driver status</p>
                </div>
                <button className="flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all font-medium border border-blue-500/50">
                    <Truck className="h-5 w-5 mr-2" />
                    Add Vehicle
                </button>
            </div>

            {/* Fleet Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card rounded-2xl p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Truck className="h-16 w-16 text-blue-500" />
                    </div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 border border-blue-500/20">
                            <Truck className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-lg border border-green-500/20">+2 new</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white relative z-10">24</h3>
                    <p className="text-sm text-gray-400 relative z-10">Total Vehicles</p>
                </div>
                <div className="glass-card rounded-2xl p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                    </div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-2 bg-green-500/20 rounded-lg text-green-400 border border-green-500/20">
                            <CheckCircle className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-bold text-gray-300 bg-white/10 px-2 py-1 rounded-lg border border-white/10">85%</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white relative z-10">18</h3>
                    <p className="text-sm text-gray-400 relative z-10">Active Now</p>
                </div>
                <div className="glass-card rounded-2xl p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wrench className="h-16 w-16 text-orange-500" />
                    </div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400 border border-orange-500/20">
                            <Wrench className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-1 rounded-lg border border-orange-500/20">Urgent</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white relative z-10">3</h3>
                    <p className="text-sm text-gray-400 relative z-10">In Maintenance</p>
                </div>
                <div className="glass-card rounded-2xl p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Fuel className="h-16 w-16 text-purple-500" />
                    </div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400 border border-purple-500/20">
                            <Fuel className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-lg border border-green-500/20">-12% cost</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white relative z-10">$4.2k</h3>
                    <p className="text-sm text-gray-400 relative z-10">Fuel Cost (Mo)</p>
                </div>
            </div>

            {/* Vehicle Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="glass-card rounded-2xl p-6 group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors border border-white/5 group-hover:border-blue-500/30">
                                    <Truck className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{vehicle.id}</h3>
                                    <p className="text-sm text-gray-400">{vehicle.type}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${vehicle.status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                vehicle.status === 'Maintenance' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                    'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                }`}>
                                {vehicle.status}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center text-gray-400">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    Location
                                </div>
                                <span className="font-medium text-white">{vehicle.location}</span>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center text-gray-400">
                                    <Fuel className="h-4 w-4 mr-2" />
                                    Fuel Level
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${vehicle.fuel < 30 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
                                                }`}
                                            style={{ width: `${vehicle.fuel}%` }}
                                        ></div>
                                    </div>
                                    <span className="font-medium text-white">{vehicle.fuel}%</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center text-gray-400">
                                    <Activity className="h-4 w-4 mr-2" />
                                    Health Score
                                </div>
                                <span className={`font-bold ${vehicle.health > 90 ? 'text-green-400' :
                                    vehicle.health > 70 ? 'text-orange-400' : 'text-red-400'
                                    }`}>{vehicle.health}%</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/10 flex gap-3">
                            <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors border border-white/10">
                                View Logs
                            </button>
                            <button className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20">
                                Track Live
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
