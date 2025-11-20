'use client';

import { useState, useEffect } from 'react';
import { Map, Navigation, Clock, Truck, CheckCircle, AlertCircle, Search, Filter } from 'lucide-react';
import { routes } from '@/lib/api';

export default function RoutesPage() {
    const [activeRoutes, setActiveRoutes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState(null);

    // Mock data for visualization since we might not have real route data yet
    const mockRoutes = [
        { id: 1, name: 'Route A-101', driver: 'John Doe', status: 'In Transit', progress: 65, eta: '14:30', stops: 8, vehicle: 'Van-01' },
        { id: 2, name: 'Route B-205', driver: 'Jane Smith', status: 'Completed', progress: 100, eta: '11:45', stops: 12, vehicle: 'Truck-05' },
        { id: 3, name: 'Route C-309', driver: 'Mike Johnson', status: 'Delayed', progress: 30, eta: '16:15', stops: 15, vehicle: 'Van-03' },
        { id: 4, name: 'Route D-412', driver: 'Sarah Wilson', status: 'In Transit', progress: 45, eta: '15:00', stops: 10, vehicle: 'Truck-02' },
    ];

    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                setLoading(true);
                const data = await routes.getAll();
                if (data && data.length > 0) {
                    // Map API response to UI format
                    const mappedRoutes = data.map((r: any) => ({
                        id: r.id,
                        name: r.route_name || `Route #${r.id}`,
                        driver: r.driver_id ? `Driver #${r.driver_id}` : 'Unassigned',
                        status: r.status || 'Planned',
                        progress: r.status === 'completed' ? 100 : 0, // Simplified progress
                        eta: r.estimated_duration ? `${Math.round(r.estimated_duration)} min` : 'N/A',
                        stops: r.optimized_sequence ? r.optimized_sequence.length : 0,
                        vehicle: r.vehicle_id ? `Vehicle #${r.vehicle_id}` : 'N/A'
                    }));
                    setActiveRoutes(mappedRoutes);
                    setSelectedRoute(mappedRoutes[0]);
                } else {
                    setActiveRoutes(mockRoutes);
                    setSelectedRoute(mockRoutes[0]);
                }
            } catch (error) {
                console.error("Failed to fetch routes:", error);
                setActiveRoutes(mockRoutes);
                setSelectedRoute(mockRoutes[0]);
            } finally {
                setLoading(false);
            }
        };

        fetchRoutes();
    }, []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Route Optimization</h1>
                    <p className="text-gray-500 mt-1">Live tracking and AI-optimized delivery paths</p>
                </div>
                <button className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-lg shadow-blue-500/30">
                    <Navigation className="h-5 w-5 mr-2" />
                    Optimize New Route
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
                {/* Route List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search routes or drivers..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {activeRoutes.map((route) => (
                            <div
                                key={route.id}
                                onClick={() => setSelectedRoute(route)}
                                className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedRoute?.id === route.id
                                    ? 'bg-blue-50 border-blue-200 shadow-sm'
                                    : 'bg-white border-transparent hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className={`font-semibold ${selectedRoute?.id === route.id ? 'text-blue-900' : 'text-gray-900'}`}>
                                        {route.name}
                                    </h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${route.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                        route.status === 'Delayed' ? 'bg-red-100 text-red-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                        {route.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                    <div className="flex items-center gap-1">
                                        <Truck className="h-3 w-3" />
                                        {route.vehicle}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        ETA {route.eta}
                                    </div>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${route.status === 'Completed' ? 'bg-green-500' :
                                            route.status === 'Delayed' ? 'bg-red-500' :
                                                'bg-blue-500'
                                            }`}
                                        style={{ width: `${route.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Map View */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div className="flex items-center gap-2">
                            <Map className="h-5 w-5 text-gray-500" />
                            <span className="font-medium text-gray-700">Live Map View</span>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                                <Filter className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 bg-gray-100 relative group">
                        {/* Map Placeholder */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-122.4241,37.78,14.25,0,0/600x600?access_token=YOUR_TOKEN')] bg-cover bg-center opacity-50 group-hover:opacity-40 transition-opacity">
                            <Map className="h-16 w-16 mb-4 text-gray-300" />
                            <p className="text-lg font-medium text-gray-500">Interactive Map Visualization</p>
                            <p className="text-sm text-gray-400">Connect Mapbox API to enable live tracking</p>
                        </div>

                        {/* Overlay Stats */}
                        {selectedRoute && (
                            <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/20 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                        {selectedRoute.progress}%
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{selectedRoute.driver}</p>
                                        <p className="text-sm text-gray-500">{selectedRoute.stops} stops remaining</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
                                        Contact Driver
                                    </button>
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
