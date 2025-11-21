'use client';

import { useState, useEffect } from 'react';
import { Map, Navigation, Clock, Truck, CheckCircle, AlertCircle, Search, Filter, Radio } from 'lucide-react';
import { routes } from '@/lib/api';

interface Route {
    id: number;
    name: string;
    driver: string;
    status: string;
    progress: number;
    eta: string;
    stops: number;
    vehicle: string;
}

export default function RoutesPage() {
    const [activeRoutes, setActiveRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

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
                const data = await routes.getAll({});
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

    const handleOptimize = async () => {
        try {
            setLoading(true);
            // Mock payload for optimization verification
            const payload = {
                vehicle_id: 1,
                start_location: { lat: 40.7128, lon: -74.0060 },
                delivery_points: [
                    { lat: 40.7589, lon: -73.9851, priority: 1 },
                    { lat: 40.7829, lon: -73.9654, priority: 2 }
                ],
                optimization_method: 'ortools'
            };

            const result = await routes.optimize(payload);
            console.log("Optimization Result:", result);
            alert(`Route Optimized! Total Distance: ${result.total_distance}km`);

            // Refresh routes list
            const data = await routes.getAll({});
            // ... (update state logic would go here, but we'll rely on the existing fetch)
        } catch (error) {
            console.error("Optimization failed:", error);
            alert("Optimization failed. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Route Optimization</h1>
                    <p className="text-gray-400 mt-1">Live tracking and AI-optimized delivery paths</p>
                </div>
                <button
                    onClick={handleOptimize}
                    disabled={loading}
                    className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all font-medium shadow-lg shadow-blue-500/20 disabled:opacity-50 border border-blue-500/50"
                >
                    <Navigation className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Optimizing...' : 'Optimize New Route'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
                {/* Route List */}
                <div className="glass-panel rounded-2xl flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search routes or drivers..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-white placeholder-gray-500"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                        {activeRoutes.map((route) => (
                            <div
                                key={route.id}
                                onClick={() => setSelectedRoute(route)}
                                className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedRoute?.id === route.id
                                    ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                                    : 'bg-transparent border-transparent hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className={`font-semibold ${selectedRoute?.id === route.id ? 'text-blue-400' : 'text-white'}`}>
                                        {route.name}
                                    </h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${route.status === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                        route.status === 'Delayed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>
                                        {route.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                                    <div className="flex items-center gap-1">
                                        <Truck className="h-3 w-3" />
                                        {route.vehicle}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        ETA {route.eta}
                                    </div>
                                </div>
                                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${route.status === 'Completed' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' :
                                            route.status === 'Delayed' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                                                'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                                            }`}
                                        style={{ width: `${route.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Map View */}
                <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden flex flex-col relative">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gray-900/50 backdrop-blur-sm z-10">
                        <div className="flex items-center gap-2">
                            <Map className="h-5 w-5 text-blue-400" />
                            <span className="font-medium text-white">Live Map View</span>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 text-gray-400 transition-colors">
                                <Filter className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 bg-[#0f172a] relative group overflow-hidden">
                        {/* Grid Background for Map Placeholder */}
                        <div className="absolute inset-0" style={{
                            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
                            backgroundSize: '50px 50px'
                        }}></div>

                        {/* Map Placeholder Content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 z-0">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full"></div>
                                <Map className="h-24 w-24 mb-4 text-gray-700 relative z-10" />
                            </div>
                            <p className="text-lg font-medium text-gray-400">Interactive Map Visualization</p>
                            <p className="text-sm text-gray-600">Connect Mapbox API to enable live tracking</p>
                        </div>

                        {/* Overlay Stats */}
                        {selectedRoute && (
                            <div className="absolute bottom-6 left-6 right-6 glass-card p-4 rounded-xl flex justify-between items-center z-20 border border-white/10">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-lg shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                                        {selectedRoute.progress}%
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-lg">{selectedRoute.driver}</p>
                                        <p className="text-sm text-gray-400 flex items-center gap-2">
                                            <Radio className="h-3 w-3 text-green-500 animate-pulse" />
                                            {selectedRoute.stops} stops remaining
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/10 text-white transition-colors">
                                        Contact Driver
                                    </button>
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-colors">
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
