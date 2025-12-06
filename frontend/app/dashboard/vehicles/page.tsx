'use client';

import { useState, useEffect } from 'react';
import {
    Truck,
    Wrench,
    Fuel,
    BarChart3,
    Plus,
    Search,
    Filter,
    MoreVertical,
    AlertTriangle,
    CheckCircle,
    MapPin,
    User,
    Calendar,
    ArrowRight,
    Zap,
    TrendingUp,
    Activity,
    Thermometer,
    Battery,
    Disc,
    Droplets
} from 'lucide-react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import {
    vehiclesService,
    Vehicle,
    MaintenancePrediction,
    FuelOptimization,
    FleetAnalytics,
    VehicleHealth
} from '@/services/vehicles.service';

export default function VehiclesPage() {
    const [activeTab, setActiveTab] = useState<'fleet' | 'maintenance' | 'fuel' | 'performance'>('fleet');
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [analytics, setAnalytics] = useState<FleetAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

    // AI Data States
    const [maintenancePrediction, setMaintenancePrediction] = useState<MaintenancePrediction | null>(null);
    const [fuelOptimization, setFuelOptimization] = useState<FuelOptimization | null>(null);
    const [vehicleHealth, setVehicleHealth] = useState<VehicleHealth | null>(null);
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [vehiclesData, analyticsData] = await Promise.all([
                vehiclesService.getVehicles(),
                vehiclesService.getFleetAnalytics()
            ]);
            setVehicles(vehiclesData);
            setAnalytics(analyticsData);
            if (vehiclesData.length > 0) {
                setSelectedVehicle(vehiclesData[0]);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVehicleSelect = async (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setAiLoading(true);
        setMaintenancePrediction(null);
        setFuelOptimization(null);
        setVehicleHealth(null);

        try {
            // Fetch AI insights based on active tab
            if (activeTab === 'maintenance') {
                const prediction = await vehiclesService.predictMaintenance(vehicle.id);
                setMaintenancePrediction(prediction);
            } else if (activeTab === 'fuel') {
                const optimization = await vehiclesService.optimizeFuel(vehicle.id);
                setFuelOptimization(optimization);
            } else if (activeTab === 'performance') {
                const health = await vehiclesService.getVehicleHealth(vehicle.id);
                setVehicleHealth(health);
            }
        } catch (error) {
            console.error('Failed to fetch AI insights:', error);
        } finally {
            setAiLoading(false);
        }
    };

    // Effect to fetch AI data when tab changes
    useEffect(() => {
        if (selectedVehicle) {
            handleVehicleSelect(selectedVehicle);
        }
    }, [activeTab]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available': return 'bg-green-100 text-green-800';
            case 'in_use': return 'bg-blue-100 text-blue-800';
            case 'maintenance': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getHealthColor = (score: number) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 75) return 'text-blue-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [newVehicle, setNewVehicle] = useState({
        vehicle_number: '',
        vehicle_type: 'van',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        capacity_kg: 0,
        fuel_type: 'diesel',
        license_plate: ''
    });

    const handleAddVehicle = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            console.log('Submitting vehicle:', newVehicle);
            const createdVehicle = await vehiclesService.createVehicle(newVehicle as any);
            console.log('Vehicle created:', createdVehicle);

            setVehicles([...vehicles, createdVehicle]);
            setIsAddModalOpen(false);
            // Reset form
            setNewVehicle({
                vehicle_number: '',
                vehicle_type: 'van',
                make: '',
                model: '',
                year: new Date().getFullYear(),
                capacity_kg: 0,
                fuel_type: 'diesel',
                license_plate: ''
            });
        } catch (error: any) {
            console.error('Failed to create vehicle:', error);
            setSubmitError(error.response?.data?.detail || 'Failed to create vehicle. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Fleet Management</h1>
                    <p className="text-gray-500">AI-powered vehicle tracking and maintenance</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Filter
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 shadow-lg shadow-purple-200"
                    >
                        <Plus className="h-4 w-4" />
                        Add Vehicle
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-500 text-sm">Total Fleet</span>
                            <Truck className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{analytics.summary.total_vehicles}</div>
                        <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3" />
                            +2 this month
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-500 text-sm">Active Vehicles</span>
                            <Activity className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{analytics.summary.in_use}</div>
                        <div className="text-xs text-gray-500 mt-1">
                            {((analytics.summary.in_use / analytics.summary.total_vehicles) * 100).toFixed(0)}% utilization
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-500 text-sm">Avg Health Score</span>
                            <HeartPulseIcon score={analytics.summary.avg_health_score} />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{analytics.summary.avg_health_score.toFixed(0)}</div>
                        <div className={`text-xs mt-1 ${getHealthColor(analytics.summary.avg_health_score)}`}>
                            {analytics.summary.avg_health_score >= 80 ? 'Excellent condition' : 'Attention needed'}
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-500 text-sm">Maintenance</span>
                            <Wrench className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{analytics.summary.maintenance}</div>
                        <div className="text-xs text-orange-600 mt-1">
                            Vehicles in service
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Vehicle List - Left Column */}
                <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[800px]">
                    <div className="p-4 border-b border-gray-200">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search vehicles..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {vehicles.map((vehicle) => (
                            <div
                                key={vehicle.id}
                                onClick={() => handleVehicleSelect(vehicle)}
                                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedVehicle?.id === vehicle.id ? 'bg-purple-50 border-l-4 border-l-purple-600' : ''
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{vehicle.make} {vehicle.model}</h3>
                                        <p className="text-sm text-gray-500">{vehicle.vehicle_number} • {vehicle.license_plate}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                                        {vehicle.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {vehicle.location}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Activity className="h-3 w-3" />
                                        {vehicle.health_score}% Health
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detail View - Right Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tabs */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-1">
                        <div className="flex gap-1">
                            {[
                                { id: 'fleet', label: 'Overview', icon: Truck },
                                { id: 'maintenance', label: 'AI Maintenance', icon: Wrench },
                                { id: 'fuel', label: 'Fuel Analytics', icon: Fuel },
                                { id: 'performance', label: 'Performance', icon: BarChart3 }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 min-h-[600px]">
                        {selectedVehicle ? (
                            <>
                                {activeTab === 'fleet' && (
                                    <div className="space-y-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900 mb-1">
                                                    {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})
                                                </h2>
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">
                                                        VIN: {selectedVehicle.id.split('_')[1] || 'N/A'}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{selectedVehicle.fuel_type.toUpperCase()}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-3xl font-bold text-gray-900">
                                                    {selectedVehicle.current_mileage.toLocaleString()}
                                                    <span className="text-sm font-normal text-gray-500 ml-1">km</span>
                                                </div>
                                                <div className="text-sm text-gray-500">Odometer Reading</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <div className="text-sm text-gray-500 mb-1">Assigned Driver</div>
                                                {selectedVehicle.assigned_driver ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                                                            {selectedVehicle.assigned_driver.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900">{selectedVehicle.assigned_driver.name}</div>
                                                            <div className="text-xs text-gray-500">Since {new Date(selectedVehicle.assigned_driver.assigned_at).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-gray-400">
                                                        <User className="h-5 w-5" />
                                                        <span>No driver assigned</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <div className="text-sm text-gray-500 mb-1">Last Maintenance</div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-5 w-5 text-gray-400" />
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            {new Date(selectedVehicle.last_maintenance_date).toLocaleDateString()}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {(selectedVehicle.current_mileage - selectedVehicle.last_maintenance_mileage).toLocaleString()} km ago
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Actions */}
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors">
                                                    <User className="h-5 w-5 mx-auto mb-2 text-purple-600" />
                                                    <span className="text-sm font-medium text-gray-700">Assign Driver</span>
                                                </button>
                                                <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors">
                                                    <Wrench className="h-5 w-5 mx-auto mb-2 text-blue-600" />
                                                    <span className="text-sm font-medium text-gray-700">Schedule Service</span>
                                                </button>
                                                <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors">
                                                    <MapPin className="h-5 w-5 mx-auto mb-2 text-green-600" />
                                                    <span className="text-sm font-medium text-gray-700">View Map</span>
                                                </button>
                                                <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors">
                                                    <MoreVertical className="h-5 w-5 mx-auto mb-2 text-gray-600" />
                                                    <span className="text-sm font-medium text-gray-700">More</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'maintenance' && (
                                    <div className="space-y-6">
                                        {aiLoading ? (
                                            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                                <Zap className="h-8 w-8 text-purple-600 animate-pulse mb-4" />
                                                <p>Gemini AI is analyzing vehicle patterns...</p>
                                            </div>
                                        ) : maintenancePrediction ? (
                                            <>
                                                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-100">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div>
                                                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                                <Zap className="h-5 w-5 text-purple-600" />
                                                                AI Maintenance Prediction
                                                            </h3>
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                Based on usage patterns and mileage analysis
                                                            </p>
                                                        </div>
                                                        <div className="bg-white px-3 py-1 rounded-full text-sm font-medium text-purple-700 shadow-sm border border-purple-100">
                                                            {maintenancePrediction.confidence_score}% Confidence
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                                        <div className="bg-white p-4 rounded-lg shadow-sm">
                                                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Next Service</div>
                                                            <div className="font-bold text-gray-900">{maintenancePrediction.next_maintenance_date}</div>
                                                            <div className="text-xs text-purple-600 mt-1">{maintenancePrediction.next_maintenance_type}</div>
                                                        </div>
                                                        <div className="bg-white p-4 rounded-lg shadow-sm">
                                                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Est. Cost</div>
                                                            <div className="font-bold text-gray-900">${maintenancePrediction.estimated_cost_usd}</div>
                                                            <div className="text-xs text-gray-500 mt-1">Parts & Labor</div>
                                                        </div>
                                                        <div className="bg-white p-4 rounded-lg shadow-sm">
                                                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Urgency</div>
                                                            <div className={`font-bold capitalize ${maintenancePrediction.urgency === 'critical' ? 'text-red-600' :
                                                                maintenancePrediction.urgency === 'high' ? 'text-orange-600' :
                                                                    'text-green-600'
                                                                }`}>
                                                                {maintenancePrediction.urgency}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {maintenancePrediction.critical_issues.length > 0 && (
                                                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                                                            <h4 className="font-semibold text-red-800 flex items-center gap-2 mb-2">
                                                                <AlertTriangle className="h-4 w-4" />
                                                                Critical Attention Needed
                                                            </h4>
                                                            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                                                                {maintenancePrediction.critical_issues.map((issue, i) => (
                                                                    <li key={i}>{issue}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 mb-3">AI Recommendations</h4>
                                                        <div className="space-y-2">
                                                            {maintenancePrediction.recommendations.map((rec, i) => (
                                                                <div key={i} className="flex items-start gap-3 bg-white p-3 rounded-lg border border-gray-100">
                                                                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                                                    <span className="text-gray-700 text-sm">{rec}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : null}
                                    </div>
                                )}

                                {activeTab === 'fuel' && (
                                    <div className="space-y-6">
                                        {aiLoading ? (
                                            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                                <Zap className="h-8 w-8 text-purple-600 animate-pulse mb-4" />
                                                <p>Analyzing fuel consumption patterns...</p>
                                            </div>
                                        ) : fuelOptimization ? (
                                            <>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Fuel className="h-5 w-5 text-blue-600" />
                                                            <h3 className="font-bold text-blue-900">Efficiency Rating</h3>
                                                        </div>
                                                        <div className="text-3xl font-bold text-blue-900 capitalize mb-1">
                                                            {fuelOptimization.current_efficiency_rating}
                                                        </div>
                                                        <p className="text-sm text-blue-700">
                                                            {selectedVehicle.fuel_efficiency_kmpl} km/L average
                                                        </p>
                                                    </div>
                                                    <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <DollarSignIcon className="h-5 w-5 text-green-600" />
                                                            <h3 className="font-bold text-green-900">Potential Savings</h3>
                                                        </div>
                                                        <div className="text-3xl font-bold text-green-900 mb-1">
                                                            ${fuelOptimization.estimated_monthly_savings_usd}/mo
                                                        </div>
                                                        <p className="text-sm text-green-700">
                                                            {fuelOptimization.potential_savings_percent}% improvement possible
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="bg-white border border-gray-200 rounded-xl p-6">
                                                    <h3 className="font-bold text-gray-900 mb-4">Optimization Tips</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Vehicle Recommendations</h4>
                                                            <ul className="space-y-3">
                                                                {fuelOptimization.optimization_recommendations.map((rec, i) => (
                                                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                                                        <span className="bg-purple-100 text-purple-700 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">{i + 1}</span>
                                                                        {rec}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Driving Habits</h4>
                                                            <ul className="space-y-3">
                                                                {fuelOptimization.driving_tips.map((tip, i) => (
                                                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                                                        <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">{i + 1}</span>
                                                                        {tip}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : null}
                                    </div>
                                )}

                                {activeTab === 'performance' && (
                                    <div className="space-y-6">
                                        {aiLoading ? (
                                            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                                <Activity className="h-8 w-8 text-purple-600 animate-pulse mb-4" />
                                                <p>Running diagnostics...</p>
                                            </div>
                                        ) : vehicleHealth ? (
                                            <>
                                                <div className="bg-white border border-gray-200 rounded-xl p-6">
                                                    <div className="flex items-center justify-between mb-6">
                                                        <h3 className="font-bold text-gray-900">Real-Time Health Diagnostics</h3>
                                                        <div className="text-sm text-gray-500">
                                                            Last updated: {new Date(vehicleHealth.last_updated).toLocaleTimeString()}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {Object.entries(vehicleHealth.diagnostics).map(([key, data]) => (
                                                            <div key={key} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                                                <div className={`p-3 rounded-full ${data.score >= 90 ? 'bg-green-100 text-green-600' :
                                                                    data.score >= 75 ? 'bg-blue-100 text-blue-600' :
                                                                        'bg-orange-100 text-orange-600'
                                                                    }`}>
                                                                    {getIconForSystem(key)}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex justify-between mb-1">
                                                                        <span className="font-medium capitalize text-gray-900">{key}</span>
                                                                        <span className={`text-sm font-bold ${data.score >= 90 ? 'text-green-600' :
                                                                            data.score >= 75 ? 'text-blue-600' :
                                                                                'text-orange-600'
                                                                            }`}>{data.score}%</span>
                                                                    </div>
                                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                                        <div
                                                                            className={`h-2 rounded-full ${data.score >= 90 ? 'bg-green-500' :
                                                                                data.score >= 75 ? 'bg-blue-500' :
                                                                                    'bg-orange-500'
                                                                                }`}
                                                                            style={{ width: `${data.score}%` }}
                                                                        />
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 mt-1 capitalize">
                                                                        Status: {data.status}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        ) : null}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <Truck className="h-16 w-16 mb-4 opacity-20" />
                                <p>Select a vehicle to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Vehicle Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Add New Vehicle</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <Plus className="h-6 w-6 rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleAddVehicle} className="space-y-4">
                            {submitError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    {submitError}
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        value={newVehicle.vehicle_number}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, vehicle_number: e.target.value })}
                                        placeholder="V001"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        value={newVehicle.license_plate}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, license_plate: e.target.value })}
                                        placeholder="ABC-1234"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        value={newVehicle.make}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                                        placeholder="Ford"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        value={newVehicle.model}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                                        placeholder="Transit"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        value={newVehicle.vehicle_type}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, vehicle_type: e.target.value as any })}
                                    >
                                        <option value="van">Van</option>
                                        <option value="truck">Truck</option>
                                        <option value="car">Car</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        value={newVehicle.year}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, year: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (kg)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        value={newVehicle.capacity_kg}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, capacity_kg: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        value={newVehicle.fuel_type}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, fuel_type: e.target.value as any })}
                                    >
                                        <option value="diesel">Diesel</option>
                                        <option value="gasoline">Gasoline</option>
                                        <option value="electric">Electric</option>
                                        <option value="hybrid">Hybrid</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-lg shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Adding...
                                        </>
                                    ) : (
                                        'Add Vehicle'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper Components
function HeartPulseIcon({ score }: { score: number }) {
    const color = score >= 90 ? 'text-green-600' : score >= 75 ? 'text-blue-600' : 'text-red-600';
    return <Activity className={`h-5 w-5 ${color}`} />;
}

function DollarSignIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
    );
}

function getIconForSystem(system: string) {
    switch (system) {
        case 'engine': return <Zap className="h-5 w-5" />;
        case 'transmission': return <Activity className="h-5 w-5" />;
        case 'brakes': return <Disc className="h-5 w-5" />;
        case 'tires': return <Disc className="h-5 w-5" />;
        case 'battery': return <Battery className="h-5 w-5" />;
        default: return <Wrench className="h-5 w-5" />;
    }
}
