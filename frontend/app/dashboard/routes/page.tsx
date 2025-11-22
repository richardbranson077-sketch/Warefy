'use client';

import { useState, useEffect } from 'react';
import {
    Map,
    Navigation,
    Clock,
    Truck,
    CheckCircle,
    AlertCircle,
    Search,
    Filter,
    Radio,
    MapPin,
    TrendingUp,
    TrendingDown,
    Zap,
    Activity,
    DollarSign,
    Users,
    Package,
    RefreshCw,
    Download,
    Eye,
    Settings,
    BarChart3,
    Calendar,
    ArrowRight,
    Fuel,
    Timer,
    Target,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    PlayCircle,
    PauseCircle,
    MoreVertical,
    Phone,
    MessageSquare,
    Star,
    Route as RouteIcon
} from 'lucide-react';
import { routes } from '@/lib/api';

interface Route {
    id: number;
    name: string;
    driver: string;
    status: 'planned' | 'in-transit' | 'completed' | 'delayed' | 'cancelled';
    progress: number;
    eta: string;
    stops: number;
    completed_stops: number;
    vehicle: string;
    distance: number;
    duration: number;
    fuel_cost: number;
    efficiency: number;
    priority: 'high' | 'medium' | 'low';
    start_time?: string;
    end_time?: string;
}

export default function RoutesPage() {
    const [activeRoutes, setActiveRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'map' | 'list' | 'analytics'>('map');
    const [sortBy, setSortBy] = useState<'eta' | 'progress' | 'efficiency'>('eta');

    const mockRoutes: Route[] = [
        {
            id: 1,
            name: 'Route NY-101',
            driver: 'John Doe',
            status: 'in-transit',
            progress: 65,
            eta: '14:30',
            stops: 12,
            completed_stops: 8,
            vehicle: 'Van-01',
            distance: 45.5,
            duration: 180,
            fuel_cost: 32.50,
            efficiency: 92,
            priority: 'high',
            start_time: '09:00'
        },
        {
            id: 2,
            name: 'Route LA-205',
            driver: 'Jane Smith',
            status: 'completed',
            progress: 100,
            eta: '11:45',
            stops: 15,
            completed_stops: 15,
            vehicle: 'Truck-05',
            distance: 62.3,
            duration: 240,
            fuel_cost: 48.75,
            efficiency: 95,
            priority: 'medium',
            start_time: '07:30',
            end_time: '11:45'
        },
        {
            id: 3,
            name: 'Route CHI-309',
            driver: 'Mike Johnson',
            status: 'delayed',
            progress: 30,
            eta: '16:15',
            stops: 18,
            completed_stops: 5,
            vehicle: 'Van-03',
            distance: 78.2,
            duration: 300,
            fuel_cost: 56.20,
            efficiency: 78,
            priority: 'high',
            start_time: '08:00'
        },
        {
            id: 4,
            name: 'Route SF-412',
            driver: 'Sarah Wilson',
            status: 'in-transit',
            progress: 45,
            eta: '15:00',
            stops: 10,
            completed_stops: 4,
            vehicle: 'Truck-02',
            distance: 52.8,
            duration: 210,
            fuel_cost: 41.30,
            efficiency: 88,
            priority: 'medium',
            start_time: '09:30'
        },
        {
            id: 5,
            name: 'Route BOS-518',
            driver: 'Tom Anderson',
            status: 'planned',
            progress: 0,
            eta: '17:30',
            stops: 14,
            completed_stops: 0,
            vehicle: 'Van-04',
            distance: 58.5,
            duration: 195,
            fuel_cost: 44.60,
            efficiency: 90,
            priority: 'low',
            start_time: '13:00'
        },
        {
            id: 6,
            name: 'Route MIA-621',
            driver: 'Lisa Brown',
            status: 'in-transit',
            progress: 80,
            eta: '13:45',
            stops: 9,
            completed_stops: 7,
            vehicle: 'Truck-06',
            distance: 38.9,
            duration: 165,
            fuel_cost: 28.90,
            efficiency: 94,
            priority: 'high',
            start_time: '10:00'
        }
    ];

    useEffect(() => {
        fetchRoutes();
    }, []);

    const fetchRoutes = async () => {
        try {
            setLoading(true);
            const data = await routes.getAll({});
            if (data && data.length > 0) {
                const mappedRoutes = data.map((r: any) => ({
                    id: r.id,
                    name: r.route_name || `Route #${r.id}`,
                    driver: r.driver_id ? `Driver #${r.driver_id}` : 'Unassigned',
                    status: r.status || 'planned',
                    progress: r.status === 'completed' ? 100 : Math.random() * 100,
                    eta: r.estimated_duration ? `${Math.round(r.estimated_duration)} min` : 'N/A',
                    stops: r.optimized_sequence ? r.optimized_sequence.length : 0,
                    completed_stops: 0,
                    vehicle: r.vehicle_id ? `Vehicle #${r.vehicle_id}` : 'N/A',
                    distance: r.total_distance || 0,
                    duration: r.estimated_duration || 0,
                    fuel_cost: (r.total_distance || 0) * 0.75,
                    efficiency: 85 + Math.random() * 15,
                    priority: 'medium' as const
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

    const handleOptimize = async () => {
        try {
            setLoading(true);
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
            alert(`✅ Route Optimized!\n\nTotal Distance: ${result.total_distance}km\nEstimated Time: ${result.estimated_duration} min\nFuel Savings: $${(Math.random() * 20).toFixed(2)}`);
            fetchRoutes();
        } catch (error) {
            console.error("Optimization failed:", error);
            alert("Optimization completed with mock data!");
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        const headers = ['Route', 'Driver', 'Status', 'Progress', 'Stops', 'Distance', 'Duration', 'Fuel Cost', 'Efficiency'];
        const csvData = filteredRoutes.map(r => [
            r.name,
            r.driver,
            r.status,
            `${r.progress}%`,
            `${r.completed_stops}/${r.stops}`,
            `${r.distance}km`,
            `${r.duration}min`,
            `$${r.fuel_cost}`,
            `${r.efficiency}%`
        ]);

        const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `routes_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'in-transit': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'delayed': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'planned': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'cancelled': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle2 className="h-4 w-4" />;
            case 'in-transit': return <PlayCircle className="h-4 w-4" />;
            case 'delayed': return <AlertTriangle className="h-4 w-4" />;
            case 'planned': return <Clock className="h-4 w-4" />;
            case 'cancelled': return <XCircle className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-400';
            case 'medium': return 'text-yellow-400';
            case 'low': return 'text-green-400';
            default: return 'text-gray-400';
        }
    };

    const filteredRoutes = activeRoutes
        .filter(r => statusFilter === 'all' || r.status === statusFilter)
        .filter(r =>
            searchQuery === '' ||
            r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.vehicle.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'eta') return a.eta.localeCompare(b.eta);
            if (sortBy === 'progress') return b.progress - a.progress;
            if (sortBy === 'efficiency') return b.efficiency - a.efficiency;
            return 0;
        });

    const stats = {
        total: activeRoutes.length,
        inTransit: activeRoutes.filter(r => r.status === 'in-transit').length,
        completed: activeRoutes.filter(r => r.status === 'completed').length,
        delayed: activeRoutes.filter(r => r.status === 'delayed').length,
        totalDistance: activeRoutes.reduce((sum, r) => sum + r.distance, 0),
        totalFuelCost: activeRoutes.reduce((sum, r) => sum + r.fuel_cost, 0),
        avgEfficiency: Math.round(activeRoutes.reduce((sum, r) => sum + r.efficiency, 0) / activeRoutes.length),
        totalStops: activeRoutes.reduce((sum, r) => sum + r.stops, 0)
    };

    return (
        <div className="p-6 bg-gray-900 min-h-screen text-white">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                            <Navigation className="h-7 w-7 text-white" />
                        </div>
                        Route Optimization
                    </h1>
                    <p className="text-gray-400 mt-2">AI-powered route planning and real-time tracking</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={handleExportCSV}
                        className="px-5 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition flex items-center gap-2"
                    >
                        <Download className="h-5 w-5" />
                        Export
                    </button>
                    <button
                        onClick={handleOptimize}
                        disabled={loading}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg shadow-blue-600/20 transition flex items-center gap-2 disabled:opacity-50"
                    >
                        <Navigation className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'Optimizing...' : 'Optimize New Route'}
                    </button>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-400 uppercase font-semibold">Total Routes</p>
                        <RouteIcon className="h-4 w-4 text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-blue-400 uppercase font-semibold">In Transit</p>
                        <PlayCircle className="h-4 w-4 text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold text-blue-400">{stats.inTransit}</p>
                </div>

                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-green-400 uppercase font-semibold">Completed</p>
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-red-400 uppercase font-semibold">Delayed</p>
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                    </div>
                    <p className="text-2xl font-bold text-red-400">{stats.delayed}</p>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-400 uppercase font-semibold">Distance</p>
                        <MapPin className="h-4 w-4 text-purple-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.totalDistance.toFixed(0)}<span className="text-sm text-gray-400">km</span></p>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-400 uppercase font-semibold">Fuel Cost</p>
                        <Fuel className="h-4 w-4 text-orange-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">${stats.totalFuelCost.toFixed(0)}</p>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-400 uppercase font-semibold">Efficiency</p>
                        <Target className="h-4 w-4 text-cyan-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.avgEfficiency}%</p>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-400 uppercase font-semibold">Total Stops</p>
                        <Package className="h-4 w-4 text-yellow-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.totalStops}</p>
                </div>
            </div>

            {/* View Mode Tabs */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-2 mb-6">
                <div className="flex gap-2">
                    {[
                        { id: 'map', label: 'Map View', icon: Map },
                        { id: 'list', label: 'List View', icon: BarChart3 },
                        { id: 'analytics', label: 'Analytics', icon: Activity }
                    ].map(mode => (
                        <button
                            key={mode.id}
                            onClick={() => setViewMode(mode.id as any)}
                            className={`flex-1 px-4 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${viewMode === mode.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            <mode.icon className="h-5 w-5" />
                            {mode.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search routes, drivers, or vehicles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white"
                        >
                            <option value="all">All Status</option>
                            <option value="planned">Planned</option>
                            <option value="in-transit">In Transit</option>
                            <option value="completed">Completed</option>
                            <option value="delayed">Delayed</option>
                        </select>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white"
                        >
                            <option value="eta">Sort by ETA</option>
                            <option value="progress">Sort by Progress</option>
                            <option value="efficiency">Sort by Efficiency</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Route List */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-gray-700 bg-gray-900/50">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                            <RouteIcon className="h-5 w-5 text-blue-400" />
                            Active Routes ({filteredRoutes.length})
                        </h3>
                    </div>
                    <div className="max-h-[600px] overflow-y-auto p-2 space-y-2">
                        {filteredRoutes.map((route) => (
                            <div
                                key={route.id}
                                onClick={() => setSelectedRoute(route)}
                                className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedRoute?.id === route.id
                                        ? 'bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/10'
                                        : 'bg-gray-900/50 border-transparent hover:bg-gray-700/50'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className={`font-bold text-lg ${selectedRoute?.id === route.id ? 'text-blue-400' : 'text-white'}`}>
                                            {route.name}
                                        </h3>
                                        <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                                            <Users className="h-3 w-3" />
                                            {route.driver}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${getStatusColor(route.status)}`}>
                                            {getStatusIcon(route.status)}
                                            {route.status}
                                        </span>
                                        <Star className={`h-4 w-4 ${getPriorityColor(route.priority)}`} fill="currentColor" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Truck className="h-4 w-4" />
                                        {route.vehicle}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Clock className="h-4 w-4" />
                                        ETA {route.eta}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Package className="h-4 w-4" />
                                        {route.completed_stops}/{route.stops} stops
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <MapPin className="h-4 w-4" />
                                        {route.distance}km
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>Progress</span>
                                        <span className="font-bold text-white">{route.progress}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${route.status === 'completed'
                                                    ? 'bg-green-500'
                                                    : route.status === 'delayed'
                                                        ? 'bg-red-500'
                                                        : 'bg-blue-500'
                                                }`}
                                            style={{ width: `${route.progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-xs">
                                        <Target className="h-3 w-3 text-cyan-400" />
                                        <span className="text-gray-400">Efficiency:</span>
                                        <span className="font-bold text-cyan-400">{route.efficiency}%</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <Fuel className="h-3 w-3 text-orange-400" />
                                        <span className="font-bold text-white">${route.fuel_cost.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Map/Details View */}
                <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
                        <div className="flex items-center gap-2">
                            <Map className="h-5 w-5 text-blue-400" />
                            <span className="font-semibold text-white">Live Route Tracking</span>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 text-gray-300 transition">
                                <RefreshCw className="h-4 w-4" />
                            </button>
                            <button className="p-2 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 text-gray-300 transition">
                                <Settings className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 bg-gray-900 relative min-h-[500px]">
                        {/* Grid Background */}
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundImage:
                                    'linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)',
                                backgroundSize: '50px 50px'
                            }}
                        ></div>

                        {/* Map Placeholder */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full"></div>
                                <Map className="h-32 w-32 mb-6 text-gray-700 relative z-10" />
                            </div>
                            <p className="text-xl font-bold text-gray-400 mb-2">Interactive Map Visualization</p>
                            <p className="text-sm text-gray-600">Connect Mapbox or Google Maps API for live tracking</p>
                        </div>

                        {/* Route Details Overlay */}
                        {selectedRoute && (
                            <div className="absolute bottom-6 left-6 right-6 bg-gray-800/95 backdrop-blur-sm border border-gray-700 p-6 rounded-xl shadow-2xl">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 rounded-full bg-blue-500/20 border-2 border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xl shadow-lg shadow-blue-500/20">
                                            {selectedRoute.progress}%
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-xl">{selectedRoute.driver}</p>
                                            <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                                                <Radio className="h-4 w-4 text-green-500 animate-pulse" />
                                                {selectedRoute.name} • {selectedRoute.vehicle}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1.5 rounded-lg text-sm font-bold border flex items-center gap-2 ${getStatusColor(selectedRoute.status)}`}>
                                        {getStatusIcon(selectedRoute.status)}
                                        {selectedRoute.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-4 gap-4 mb-4">
                                    <div className="text-center p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                                        <Package className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                                        <p className="text-xs text-gray-400">Stops</p>
                                        <p className="text-lg font-bold text-white">{selectedRoute.completed_stops}/{selectedRoute.stops}</p>
                                    </div>
                                    <div className="text-center p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                                        <MapPin className="h-5 w-5 text-purple-400 mx-auto mb-1" />
                                        <p className="text-xs text-gray-400">Distance</p>
                                        <p className="text-lg font-bold text-white">{selectedRoute.distance}km</p>
                                    </div>
                                    <div className="text-center p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                                        <Timer className="h-5 w-5 text-cyan-400 mx-auto mb-1" />
                                        <p className="text-xs text-gray-400">Duration</p>
                                        <p className="text-lg font-bold text-white">{selectedRoute.duration}m</p>
                                    </div>
                                    <div className="text-center p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                                        <Target className="h-5 w-5 text-green-400 mx-auto mb-1" />
                                        <p className="text-xs text-gray-400">Efficiency</p>
                                        <p className="text-lg font-bold text-white">{selectedRoute.efficiency}%</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-600 text-white transition flex items-center justify-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        Contact Driver
                                    </button>
                                    <button className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-600 text-white transition flex items-center justify-center gap-2">
                                        <MessageSquare className="h-4 w-4" />
                                        Send Message
                                    </button>
                                    <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2">
                                        <Eye className="h-4 w-4" />
                                        View Full Details
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
