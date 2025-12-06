'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
    Navigation,
    MapPin,
    Plus,
    Trash2,
    RefreshCw,
    Zap,
    TrendingUp,
    Clock,
    DollarSign,
    Users,
    BarChart3,
    Play,
    CheckCircle,
    AlertCircle,
    Truck,
    Settings
} from 'lucide-react';
import {
    ResponsiveContainer,
    LineChart,
    BarChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts';
import { routesService, Route, Waypoint, OptimizationResult, RouteAnalytics } from '@/services/routes.service';

// Dynamically import LiveMap to avoid SSR issues with Leaflet
const LiveMap = dynamic(() => import('@/components/LiveMap'), {
    ssr: false,
    loading: () => <div className="w-full h-64 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
    </div>
});

export default function RoutesPage() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [analytics, setAnalytics] = useState<RouteAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'routes' | 'planner' | 'analytics' | 'tracking'>('routes');

    // Live tracking state
    const [liveTracking, setLiveTracking] = useState<any[]>([]);
    const [trackingLoading, setTrackingLoading] = useState(false);

    // Route planner state
    const [routeName, setRouteName] = useState('');
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [waypoints, setWaypoints] = useState<string[]>([]);
    const [optimizationMode, setOptimizationMode] = useState('balanced');
    const [vehicleType, setVehicleType] = useState('van');

    // Optimization result
    const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
    const [optimizing, setOptimizing] = useState(false);

    // Driver assignment
    const [assigningRoute, setAssigningRoute] = useState<string | null>(null);
    const [driverName, setDriverName] = useState('');

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (activeTab === 'tracking') {
            fetchLiveTracking();
            const trackingInterval = setInterval(fetchLiveTracking, 3000); // Update every 3 seconds
            return () => clearInterval(trackingInterval);
        }
    }, [activeTab]);

    const fetchData = async () => {
        try {
            const [routesData, analyticsData] = await Promise.all([
                routesService.getRoutes(),
                routesService.getAnalytics()
            ]);
            setRoutes(routesData);
            setAnalytics(analyticsData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLiveTracking = async () => {
        setTrackingLoading(true);
        try {
            const trackingData = await routesService.getAllLiveTracking();
            setLiveTracking(trackingData);
        } catch (error) {
            console.error('Failed to fetch live tracking:', error);
        } finally {
            setTrackingLoading(false);
        }
    };

    const handleOptimizeRoute = async () => {
        if (!origin || !destination) return;

        setOptimizing(true);
        try {
            const result = await routesService.optimizeRoute({
                origin: { address: origin },
                destination: { address: destination },
                waypoints: waypoints.map(w => ({ address: w })),
                optimization_mode: optimizationMode
            });
            setOptimizationResult(result);
        } catch (error) {
            console.error('Failed to optimize route:', error);
        } finally {
            setOptimizing(false);
        }
    };

    const handleCreateRoute = async () => {
        if (!routeName || !origin || !destination) return;

        try {
            await routesService.createRoute({
                name: routeName,
                origin: { address: origin },
                destination: { address: destination },
                waypoints: waypoints.map(w => ({ address: w })),
                optimization_mode: optimizationMode,
                vehicle_type: vehicleType
            });

            // Reset form
            setRouteName('');
            setOrigin('');
            setDestination('');
            setWaypoints([]);
            setOptimizationResult(null);

            fetchData();
            setActiveTab('routes');
        } catch (error) {
            console.error('Failed to create route:', error);
        }
    };

    const handleAssignDriver = async (routeId: string) => {
        if (!driverName) return;

        try {
            await routesService.assignDriver(routeId, `driver_${Date.now()}`, driverName);
            setAssigningRoute(null);
            setDriverName('');
            fetchData();
        } catch (error) {
            console.error('Failed to assign driver:', error);
        }
    };

    const handleUpdateStatus = async (routeId: string, status: string) => {
        try {
            await routesService.updateStatus(routeId, status);
            fetchData();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const handleDeleteRoute = async (routeId: string) => {
        try {
            await routesService.deleteRoute(routeId);
            fetchData();
        } catch (error) {
            console.error('Failed to delete route:', error);
        }
    };

    const addWaypoint = () => {
        setWaypoints([...waypoints, '']);
    };

    const updateWaypoint = (index: number, value: string) => {
        const updated = [...waypoints];
        updated[index] = value;
        setWaypoints(updated);
    };

    const removeWaypoint = (index: number) => {
        setWaypoints(waypoints.filter((_, i) => i !== index));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Navigation className="h-8 w-8 text-purple-600" />
                        Route Optimization
                    </h1>
                    <p className="text-gray-600 mt-1">
                        AI-powered route planning and optimization
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg shadow-sm transition-all flex items-center gap-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-500 uppercase">Total Routes</p>
                            <MapPin className="h-5 w-5 text-purple-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{analytics.summary.total_routes}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-500 uppercase">Completed</p>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{analytics.summary.completed_routes}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-500 uppercase">In Progress</p>
                            <Truck className="h-5 w-5 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{analytics.summary.in_progress_routes}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-500 uppercase">Avg Distance</p>
                            <TrendingUp className="h-5 w-5 text-orange-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{analytics.summary.avg_distance_km.toFixed(1)} km</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-500 uppercase">Avg Duration</p>
                            <Clock className="h-5 w-5 text-indigo-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{analytics.summary.avg_duration_minutes.toFixed(0)} min</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-500 uppercase">Avg Cost</p>
                            <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">${analytics.summary.avg_cost_usd.toFixed(2)}</p>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6" aria-label="Tabs">
                        {[
                            { id: 'routes', label: 'All Routes', icon: MapPin },
                            { id: 'planner', label: 'Route Planner', icon: Zap },
                            { id: 'tracking', label: 'Live Tracking', icon: Navigation },
                            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                    ? 'border-purple-600 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <tab.icon className="h-5 w-5" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {/* Routes Tab */}
                    {activeTab === 'routes' && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">All Routes</h2>

                            <div className="grid grid-cols-1 gap-4">
                                {routes.map((route) => (
                                    <div key={route.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 text-lg">{route.name}</h3>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-4 w-4" />
                                                        {route.origin.address} → {route.destination.address}
                                                    </span>
                                                    {route.waypoints.length > 0 && (
                                                        <span className="text-purple-600">+{route.waypoints.length} stops</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 text-xs rounded-full font-medium ${route.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    route.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                        route.status === 'assigned' ? 'bg-purple-100 text-purple-700' :
                                                            'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {route.status.replace('_', ' ')}
                                                </span>
                                                <button
                                                    onClick={() => handleDeleteRoute(route.id)}
                                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-4 gap-4 mb-3">
                                            <div className="bg-white rounded-lg p-3">
                                                <p className="text-xs text-gray-500">Distance</p>
                                                <p className="text-lg font-bold text-gray-900">{route.total_distance_km.toFixed(1)} km</p>
                                            </div>
                                            <div className="bg-white rounded-lg p-3">
                                                <p className="text-xs text-gray-500">Duration</p>
                                                <p className="text-lg font-bold text-gray-900">{route.total_duration_minutes} min</p>
                                            </div>
                                            <div className="bg-white rounded-lg p-3">
                                                <p className="text-xs text-gray-500">Cost</p>
                                                <p className="text-lg font-bold text-gray-900">${route.estimated_cost.toFixed(2)}</p>
                                            </div>
                                            <div className="bg-white rounded-lg p-3">
                                                <p className="text-xs text-gray-500">Vehicle</p>
                                                <p className="text-lg font-bold text-gray-900 capitalize">{route.vehicle_type}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {route.optimized && (
                                                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                                                        <Zap className="h-3 w-3" />
                                                        AI Optimized
                                                    </span>
                                                )}
                                                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full capitalize">
                                                    {route.optimization_mode}
                                                </span>
                                            </div>

                                            {route.assigned_driver ? (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Users className="h-4 w-4" />
                                                    {route.assigned_driver.name}
                                                </div>
                                            ) : (
                                                assigningRoute === route.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Driver name"
                                                            value={driverName}
                                                            onChange={(e) => setDriverName(e.target.value)}
                                                            className="px-3 py-1 border border-gray-300 rounded text-sm"
                                                        />
                                                        <button
                                                            onClick={() => handleAssignDriver(route.id)}
                                                            className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                                                        >
                                                            Assign
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setAssigningRoute(route.id)}
                                                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
                                                    >
                                                        Assign Driver
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Route Planner Tab */}
                    {activeTab === 'planner' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Input Form */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-gray-900">Plan New Route</h2>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Route Name</label>
                                    <input
                                        type="text"
                                        value={routeName}
                                        onChange={(e) => setRouteName(e.target.value)}
                                        placeholder="e.g., Downtown Delivery"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Origin</label>
                                    <input
                                        type="text"
                                        value={origin}
                                        onChange={(e) => setOrigin(e.target.value)}
                                        placeholder="Starting address"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                                    <input
                                        type="text"
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                        placeholder="Ending address"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-700">Waypoints</label>
                                        <button
                                            onClick={addWaypoint}
                                            className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add Stop
                                        </button>
                                    </div>
                                    {waypoints.map((waypoint, index) => (
                                        <div key={index} className="flex items-center gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={waypoint}
                                                onChange={(e) => updateWaypoint(index, e.target.value)}
                                                placeholder={`Stop ${index + 1}`}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                            />
                                            <button
                                                onClick={() => removeWaypoint(index)}
                                                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Optimization</label>
                                        <select
                                            value={optimizationMode}
                                            onChange={(e) => setOptimizationMode(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        >
                                            <option value="fastest">Fastest</option>
                                            <option value="shortest">Shortest</option>
                                            <option value="cheapest">Cheapest</option>
                                            <option value="balanced">Balanced</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle</label>
                                        <select
                                            value={vehicleType}
                                            onChange={(e) => setVehicleType(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        >
                                            <option value="car">Car</option>
                                            <option value="van">Van</option>
                                            <option value="truck">Truck</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleOptimizeRoute}
                                        disabled={!origin || !destination || optimizing}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {optimizing ? (
                                            <RefreshCw className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <Zap className="h-5 w-5" />
                                        )}
                                        {optimizing ? 'Optimizing...' : 'Optimize Route'}
                                    </button>
                                    <button
                                        onClick={handleCreateRoute}
                                        disabled={!routeName || !origin || !destination}
                                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition-all disabled:opacity-50"
                                    >
                                        Create Route
                                    </button>
                                </div>
                            </div>

                            {/* Optimization Results */}
                            <div>
                                {optimizationResult ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-xl font-bold text-gray-900">Optimization Results</h2>
                                            <span className={`text-xs px-3 py-1 rounded-full ${optimizationResult.model === 'gemini-ai'
                                                ? 'bg-purple-100 text-purple-700'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {optimizationResult.model === 'gemini-ai' ? 'AI Powered' : 'Standard'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                                <p className="text-xs text-purple-600 mb-1">Distance</p>
                                                <p className="text-xl font-bold text-purple-900">{optimizationResult.total_distance_km.toFixed(1)} km</p>
                                            </div>
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                <p className="text-xs text-blue-600 mb-1">Duration</p>
                                                <p className="text-xl font-bold text-blue-900">{optimizationResult.total_duration_minutes} min</p>
                                            </div>
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                <p className="text-xs text-green-600 mb-1">Total Cost</p>
                                                <p className="text-xl font-bold text-green-900">${optimizationResult.total_cost_usd.toFixed(2)}</p>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h3 className="font-semibold text-gray-900 mb-2">Cost Breakdown</h3>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Fuel Cost:</span>
                                                    <span className="font-medium">${optimizationResult.fuel_cost_usd.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Toll Cost:</span>
                                                    <span className="font-medium">${optimizationResult.toll_cost_usd.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                                <AlertCircle className="h-5 w-5 text-yellow-600" />
                                                Key Insights
                                            </h3>
                                            <ul className="space-y-1 text-sm">
                                                {optimizationResult.insights.map((insight, i) => (
                                                    <li key={i} className="text-gray-700">• {insight}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                                Recommendations
                                            </h3>
                                            <ul className="space-y-1 text-sm">
                                                {optimizationResult.recommendations.map((rec, i) => (
                                                    <li key={i} className="text-gray-700">• {rec}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        {optimizationResult.alternative_routes.length > 0 && (
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                <h3 className="font-semibold text-gray-900 mb-3">Alternative Routes</h3>
                                                {optimizationResult.alternative_routes.map((alt, i) => (
                                                    <div key={i} className="bg-white rounded-lg p-3 mb-2">
                                                        <p className="font-medium text-gray-900 mb-2">{alt.description}</p>
                                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                                            <div>
                                                                <span className="text-gray-500">Distance:</span>
                                                                <span className="ml-1 font-medium">{alt.distance_km} km</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">Time:</span>
                                                                <span className="ml-1 font-medium">{alt.duration_minutes} min</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">Cost:</span>
                                                                <span className="ml-1 font-medium">${alt.cost_usd.toFixed(2)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                        <div className="text-center">
                                            <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500">Optimize a route to see results</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Analytics Tab */}
                    {activeTab === 'analytics' && analytics && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-900">Route Analytics</h2>

                            {/* Daily Routes */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Routes (Last 7 Days)</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={analytics.daily_routes}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                                        <YAxis stroke="#6b7280" fontSize={12} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Legend />
                                        <Bar dataKey="completed" fill="#10b981" radius={[8, 8, 0, 0]} name="Completed" />
                                        <Bar dataKey="planned" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Planned" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Cost Trend */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Trend</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={analytics.cost_trend}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                                        <YAxis stroke="#6b7280" fontSize={12} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Legend />
                                        <Line type="monotone" dataKey="total_cost" stroke="#8b5cf6" strokeWidth={2} name="Total Cost ($)" />
                                        <Line type="monotone" dataKey="fuel_cost" stroke="#3b82f6" strokeWidth={2} name="Fuel Cost ($)" />
                                        <Line type="monotone" dataKey="toll_cost" stroke="#f59e0b" strokeWidth={2} name="Toll Cost ($)" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Driver Performance */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver Performance</h3>
                                <div className="space-y-3">
                                    {analytics.driver_stats.map((driver, i) => (
                                        <div key={i} className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="font-medium text-gray-900">{driver.driver_name}</p>
                                                <span className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-full">
                                                    {driver.on_time_percentage.toFixed(1)}% On-Time
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-600">Routes Completed</p>
                                                    <p className="text-lg font-bold text-gray-900">{driver.routes_completed}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">Avg Duration</p>
                                                    <p className="text-lg font-bold text-gray-900">{driver.avg_duration_minutes.toFixed(0)} min</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Optimization Impact */}
                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-purple-600" />
                                    AI Optimization Impact
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <div className="bg-white rounded-lg p-3">
                                        <p className="text-xs text-gray-600 mb-1">Routes Optimized</p>
                                        <p className="text-2xl font-bold text-purple-900">{analytics.optimization_impact.routes_optimized}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-3">
                                        <p className="text-xs text-gray-600 mb-1">Avg Distance Saved</p>
                                        <p className="text-2xl font-bold text-purple-900">{analytics.optimization_impact.avg_distance_saved_km.toFixed(1)} km</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-3">
                                        <p className="text-xs text-gray-600 mb-1">Avg Time Saved</p>
                                        <p className="text-2xl font-bold text-purple-900">{analytics.optimization_impact.avg_time_saved_minutes.toFixed(0)} min</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-3">
                                        <p className="text-xs text-gray-600 mb-1">Avg Cost Saved</p>
                                        <p className="text-2xl font-bold text-purple-900">${analytics.optimization_impact.avg_cost_saved_usd.toFixed(2)}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-3">
                                        <p className="text-xs text-gray-600 mb-1">Total Savings</p>
                                        <p className="text-2xl font-bold text-green-900">${analytics.optimization_impact.total_savings_usd.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Live Tracking Tab */}
                    {activeTab === 'tracking' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">Live Driver Tracking</h2>
                                <div className="flex items-center gap-2">
                                    {trackingLoading && (
                                        <RefreshCw className="h-4 w-4 text-purple-600 animate-spin" />
                                    )}
                                    <span className="text-sm text-gray-500">
                                        Auto-refreshing every 3s
                                    </span>
                                </div>
                            </div>

                            {liveTracking.length === 0 ? (
                                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                                    <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Routes</h3>
                                    <p className="text-gray-600">Start a route and assign a driver to see live tracking</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {liveTracking.map((tracking) => (
                                        <div key={tracking.route_id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                            {/* Live Map */}
                                            <div className="relative h-80">
                                                <LiveMap
                                                    origin={{
                                                        lat: tracking.route?.origin?.lat || 40.7128,
                                                        lng: tracking.route?.origin?.lng || -74.0060,
                                                        address: tracking.route?.origin?.address || 'Origin'
                                                    }}
                                                    destination={{
                                                        lat: tracking.route?.destination?.lat || 40.7589,
                                                        lng: tracking.route?.destination?.lng || -73.9851,
                                                        address: tracking.route?.destination?.address || 'Destination'
                                                    }}
                                                    currentLocation={{
                                                        lat: tracking.current_location.lat,
                                                        lng: tracking.current_location.lng,
                                                        speed_kmh: tracking.current_location.speed_kmh
                                                    }}
                                                    waypoints={tracking.route?.waypoints || []}
                                                />

                                                {/* Status Badge */}
                                                <div className="absolute top-4 right-4 z-[1000]">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-lg ${tracking.status === 'in_progress'
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-gray-500 text-white'
                                                        }`}>
                                                        {tracking.status === 'in_progress' ? 'En Route' : tracking.status}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Tracking Info */}
                                            <div className="p-4 space-y-4">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 mb-1">Route #{tracking.route_id.split('_').pop()}</h3>
                                                    {tracking.driver && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Users className="h-4 w-4" />
                                                            {tracking.driver.name}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Progress Bar */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-medium text-gray-700">Progress</span>
                                                        <span className="text-sm font-bold text-purple-600">{tracking.progress_percentage.toFixed(0)}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                                        <div
                                                            className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-1000"
                                                            style={{ width: `${tracking.progress_percentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                {/* Stats Grid */}
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div className="bg-purple-50 rounded-lg p-3">
                                                        <div className="flex items-center gap-1 mb-1">
                                                            <Clock className="h-3 w-3 text-purple-600" />
                                                            <p className="text-xs text-purple-600">ETA</p>
                                                        </div>
                                                        <p className="text-lg font-bold text-purple-900">{tracking.eta_minutes} min</p>
                                                    </div>
                                                    <div className="bg-blue-50 rounded-lg p-3">
                                                        <div className="flex items-center gap-1 mb-1">
                                                            <Navigation className="h-3 w-3 text-blue-600" />
                                                            <p className="text-xs text-blue-600">Speed</p>
                                                        </div>
                                                        <p className="text-lg font-bold text-blue-900">{tracking.current_location.speed_kmh.toFixed(0)} km/h</p>
                                                    </div>
                                                    <div className="bg-green-50 rounded-lg p-3">
                                                        <div className="flex items-center gap-1 mb-1">
                                                            <MapPin className="h-3 w-3 text-green-600" />
                                                            <p className="text-xs text-green-600">Remaining</p>
                                                        </div>
                                                        <p className="text-lg font-bold text-green-900">{tracking.distance_remaining_km.toFixed(1)} km</p>
                                                    </div>
                                                </div>

                                                {/* Stops Progress */}
                                                {tracking.total_stops > 0 && (
                                                    <div className="bg-gray-50 rounded-lg p-3">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-600">Stops Completed</span>
                                                            <span className="font-bold text-gray-900">
                                                                {tracking.stops_completed} / {tracking.total_stops}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Last Updated */}
                                                <div className="text-xs text-gray-500 text-center">
                                                    Last updated: {new Date(tracking.last_updated).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
