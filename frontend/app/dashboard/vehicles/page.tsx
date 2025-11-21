'use client';

import { useState, useEffect } from 'react';
import {
    Truck,
    Battery,
    AlertCircle,
    CheckCircle,
    MapPin,
    Fuel,
    Wrench,
    Search,
    Activity,
    Plus,
    Download,
    RefreshCw,
    Settings,
    Eye,
    Edit,
    Trash2,
    Calendar,
    Clock,
    TrendingUp,
    TrendingDown,
    Radio,
    AlertTriangle,
    Users,
    DollarSign,
    BarChart3,
    Navigation,
    Gauge,
    X,
    Check
} from 'lucide-react';
import { vehicles as vehiclesApi } from '@/lib/api';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

interface Vehicle {
    id: number;
    vehicleId: string;
    type: string;
    make: string;
    model: string;
    year: number;
    driver: string;
    status: 'active' | 'idle' | 'maintenance' | 'out-of-service';
    fuel: number;
    location: string;
    latitude: number;
    longitude: number;
    lastMaintenance: string;
    nextMaintenance: string;
    mileage: number;
    health: number;
    capacity: number;
    temperature?: number;
    speed?: number;
    engineHours: number;
    alerts: string[];
}

const STATUS_COLORS = {
    active: '#10b981',
    idle: '#3b82f6',
    maintenance: '#f59e0b',
    'out-of-service': '#ef4444'
};

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export default function FleetPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'id' | 'fuel' | 'health' | 'mileage'>('id');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // New vehicle form
    const [newVehicle, setNewVehicle] = useState({
        vehicleId: '',
        type: 'Truck',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        capacity: 0
    });

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const data = await vehiclesApi.getAll();
            if (data && data.length > 0) {
                const mappedVehicles = data.map((v: any, index: number) => ({
                    id: v.id || index + 1,
                    vehicleId: v.vehicle_id || `VH-${String(index + 1).padStart(3, '0')}`,
                    type: v.vehicle_type || 'Truck',
                    make: v.make || 'Ford',
                    model: v.model || 'F-150',
                    year: v.year || 2022,
                    driver: v.driver_id ? `Driver #${v.driver_id}` : 'Unassigned',
                    status: v.status || 'idle',
                    fuel: v.fuel_level || Math.floor(Math.random() * 40) + 60,
                    location: v.current_location || 'Warehouse',
                    latitude: v.current_latitude || 40.7128,
                    longitude: v.current_longitude || -74.006,
                    lastMaintenance: v.last_maintenance ? formatDate(v.last_maintenance) : '30 days ago',
                    nextMaintenance: calculateNextMaintenance(v.last_maintenance),
                    mileage: v.mileage || Math.floor(Math.random() * 50000) + 10000,
                    health: calculateHealth(v),
                    capacity: v.capacity || 1500,
                    temperature: v.temperature,
                    speed: v.current_speed || 0,
                    engineHours: v.engine_hours || Math.floor(Math.random() * 2000) + 500,
                    alerts: generateAlerts(v)
                }));
                setVehicles(mappedVehicles);
            } else {
                generateMockVehicles();
            }
        } catch (error) {
            console.error('Failed to fetch vehicles:', error);
            generateMockVehicles();
        } finally {
            setLoading(false);
        }
    };

    const generateMockVehicles = () => {
        const mockVehicles: Vehicle[] = [
            {
                id: 1,
                vehicleId: 'VH-042',
                type: 'Heavy Truck',
                make: 'Freightliner',
                model: 'Cascadia',
                year: 2022,
                driver: 'Mike Johnson',
                status: 'active',
                fuel: 78,
                location: 'Route NY-101, Mile 45',
                latitude: 40.7589,
                longitude: -73.9851,
                lastMaintenance: '15 days ago',
                nextMaintenance: 'In 15 days',
                mileage: 45230,
                health: 94,
                capacity: 2500,
                temperature: 72,
                speed: 55,
                engineHours: 1245,
                alerts: []
            },
            {
                id: 2,
                vehicleId: 'VH-031',
                type: 'Delivery Van',
                make: 'Mercedes',
                model: 'Sprinter',
                year: 2023,
                driver: 'Sarah Williams',
                status: 'active',
                fuel: 92,
                location: 'Downtown Area',
                latitude: 40.7614,
                longitude: -73.9776,
                lastMaintenance: '8 days ago',
                nextMaintenance: 'In 22 days',
                mileage: 28450,
                health: 98,
                capacity: 1200,
                temperature: 68,
                speed: 35,
                engineHours: 845,
                alerts: []
            },
            {
                id: 3,
                vehicleId: 'VH-018',
                type: 'Box Truck',
                make: 'Isuzu',
                model: 'NPR',
                year: 2021,
                driver: 'David Chen',
                status: 'idle',
                fuel: 45,
                location: 'Warehouse LA-003',
                latitude: 34.0522,
                longitude: -118.2437,
                lastMaintenance: '3 days ago',
                nextMaintenance: 'In 27 days',
                mileage: 32890,
                health: 88,
                capacity: 1800,
                temperature: 75,
                speed: 0,
                engineHours: 1023,
                alerts: ['Low Fuel']
            },
            {
                id: 4,
                vehicleId: 'VH-025',
                type: 'Refrigerated Truck',
                make: 'Hino',
                model: '268A',
                year: 2022,
                driver: 'Emily Rodriguez',
                status: 'active',
                fuel: 67,
                location: 'Interstate 95 North',
                latitude: 40.7282,
                longitude: -73.7949,
                lastMaintenance: '45 days ago',
                nextMaintenance: 'Overdue',
                mileage: 52100,
                health: 76,
                capacity: 2000,
                temperature: 38,
                speed: 62,
                engineHours: 1567,
                alerts: ['Maintenance Due', 'Check Engine']
            },
            {
                id: 5,
                vehicleId: 'VH-009',
                type: 'Cargo Van',
                make: 'Ford',
                model: 'Transit',
                year: 2023,
                driver: 'Unassigned',
                status: 'idle',
                fuel: 88,
                location: 'Warehouse NY-001',
                latitude: 40.7128,
                longitude: -74.006,
                lastMaintenance: '12 days ago',
                nextMaintenance: 'In 18 days',
                mileage: 18670,
                health: 96,
                capacity: 1000,
                speed: 0,
                engineHours: 567,
                alerts: []
            },
            {
                id: 6,
                vehicleId: 'VH-056',
                type: 'Heavy Truck',
                make: 'Peterbilt',
                model: '579',
                year: 2020,
                driver: 'James Taylor',
                status: 'maintenance',
                fuel: 34,
                location: 'Service Center',
                latitude: 40.6782,
                longitude: -73.9442,
                lastMaintenance: '2 days ago',
                nextMaintenance: 'In Progress',
                mileage: 78450,
                health: 65,
                capacity: 3000,
                speed: 0,
                engineHours: 2245,
                alerts: ['In Maintenance']
            },
            {
                id: 7,
                vehicleId: 'VH-013',
                type: 'Flatbed Truck',
                make: 'Kenworth',
                model: 'T680',
                year: 2021,
                driver: 'Robert Martinez',
                status: 'active',
                fuel: 71,
                location: 'Highway 1, California',
                latitude: 37.7749,
                longitude: -122.4194,
                lastMaintenance: '20 days ago',
                nextMaintenance: 'In 10 days',
                mileage: 61230,
                health: 91,
                capacity: 2800,
                speed: 58,
                engineHours: 1834,
                alerts: []
            },
            {
                id: 8,
                vehicleId: 'VH-067',
                type: 'Delivery Van',
                make: 'Ram',
                model: 'ProMaster',
                year: 2023,
                driver: 'Lisa Anderson',
                status: 'active',
                fuel: 85,
                location: 'Residential Zone',
                latitude: 40.7831,
                longitude: -73.9712,
                lastMaintenance: '5 days ago',
                nextMaintenance: 'In 25 days',
                mileage: 15890,
                health: 99,
                capacity: 950,
                speed: 28,
                engineHours: 478,
                alerts: []
            }
        ];
        setVehicles(mockVehicles);
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        return `${days} days ago`;
    };

    const calculateNextMaintenance = (lastMaintenance: string): string => {
        if (!lastMaintenance) return 'Schedule needed';
        const last = new Date(lastMaintenance);
        const next = new Date(last.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
        const now = new Date();
        const diff = next.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days < 0) return 'Overdue';
        if (days === 0) return 'Today';
        return `In ${days} days`;
    };

    const calculateHealth = (vehicle: any): number => {
        let health = 100;
        if (vehicle.mileage > 70000) health -= 15;
        else if (vehicle.mileage > 50000) health -= 10;
        if (vehicle.fuel_level < 30) health -= 5;
        return Math.max(health, 60);
    };

    const generateAlerts = (vehicle: any): string[] => {
        const alerts: string[] = [];
        if (vehicle.fuel_level < 30) alerts.push('Low Fuel');
        if (vehicle.status === 'maintenance') alerts.push('In Maintenance');
        if (vehicle.mileage > 60000) alerts.push('High Mileage');
        return alerts;
    };

    const handleScheduleMaintenance = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setShowMaintenanceModal(true);
    };

    const handleViewDetails = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setShowDetailsModal(true);
    };

    const handleAddVehicle = () => {
        alert('Vehicle added successfully! (Demo mode)');
        setShowAddVehicleModal(false);
        setNewVehicle({
            vehicleId: '',
            type: 'Truck',
            make: '',
            model: '',
            year: new Date().getFullYear(),
            capacity: 0
        });
    };

    // Filter and sort
    const filteredVehicles = vehicles.filter(v => {
        const matchesStatus = filterStatus === 'all' || v.status === filterStatus;
        const matchesType = filterType === 'all' || v.type === filterType;
        const matchesSearch = v.vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.location.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesType && matchesSearch;
    });

    const sortedVehicles = [...filteredVehicles].sort((a, b) => {
        switch (sortBy) {
            case 'fuel': return b.fuel - a.fuel;
            case 'health': return b.health - a.health;
            case 'mileage': return a.mileage - b.mileage;
            default: return a.id - b.id;
        }
    });

    // Stats
    const stats = {
        total: vehicles.length,
        active: vehicles.filter(v => v.status === 'active').length,
        idle: vehicles.filter(v => v.status === 'idle').length,
        maintenance: vehicles.filter(v => v.status === 'maintenance').length,
        avgFuel: Math.round(vehicles.reduce((sum, v) => sum + v.fuel, 0) / vehicles.length),
        avgHealth: Math.round(vehicles.reduce((sum, v) => sum + v.health, 0) / vehicles.length),
        lowFuel: vehicles.filter(v => v.fuel < 30).length,
        alerts: vehicles.reduce((sum, v) => sum + v.alerts.length, 0)
    };

    // Chart data
    const statusData = [
        { name: 'Active', value: stats.active },
        { name: 'Idle', value: stats.idle },
        { name: 'Maintenance', value: stats.maintenance },
        { name: 'Out of Service', value: vehicles.filter(v => v.status === 'out-of-service').length }
    ];

    const fuelData = vehicles.map(v => ({
        name: v.vehicleId,
        fuel: v.fuel
    })).slice(0, 8);

    const healthData = vehicles.map(v => ({
        name: v.vehicleId,
        health: v.health
    })).slice(0, 8);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'green';
            case 'idle': return 'blue';
            case 'maintenance': return 'orange';
            default: return 'red';
        }
    };

    const getHealthColor = (health: number) => {
        if (health >= 90) return 'green';
        if (health >= 75) return 'blue';
        if (health >= 60) return 'orange';
        return 'red';
    };

    const getFuelColor = (fuel: number) => {
        if (fuel >= 70) return 'green';
        if (fuel >= 40) return 'orange';
        return 'red';
    };

    const vehicleTypes = ['all', ...Array.from(new Set(vehicles.map(v => v.type)))];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Fleet Management</h1>
                    <p className="text-gray-600 mt-1">Monitor and manage your entire vehicle fleet</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                    >
                        {viewMode === 'grid' ? 'List View' : 'Grid View'}
                    </button>
                    <button
                        onClick={fetchVehicles}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </button>
                    <button
                        onClick={() => setShowAddVehicleModal(true)}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition flex items-center gap-2"
                    >
                        <Plus className="h-5 w-5" />
                        Add Vehicle
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-gray-600">Total Fleet</p>
                        <Truck className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-gray-600">Active</p>
                        <Activity className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-gray-600">Idle</p>
                        <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{stats.idle}</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-gray-600">Maintenance</p>
                        <Wrench className="h-4 w-4 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-orange-600">{stats.maintenance}</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-gray-600">Avg Fuel</p>
                        <Fuel className="h-4 w-4 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.avgFuel}%</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-gray-600">Avg Health</p>
                        <Battery className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.avgHealth}%</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-gray-600">Low Fuel</p>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <p className="text-2xl font-bold text-red-600">{stats.lowFuel}</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-gray-600">Alerts</p>
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-orange-600">{stats.alerts}</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Fleet Status</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={70}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Fuel Levels</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={fuelData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '10px' }} />
                            <YAxis stroke="#6b7280" style={{ fontSize: '10px' }} />
                            <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
                            <Bar dataKey="fuel" fill="#8b5cf6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Vehicle Health</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={healthData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '10px' }} />
                            <YAxis stroke="#6b7280" style={{ fontSize: '10px' }} />
                            <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
                            <Bar dataKey="health" fill="#10b981" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="relative md:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by ID, driver, or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="idle">Idle</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="out-of-service">Out of Service</option>
                    </select>

                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                        {vehicleTypes.map(type => (
                            <option key={type} value={type}>
                                {type === 'all' ? 'All Types' : type}
                            </option>
                        ))}
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                        <option value="id">Sort by ID</option>
                        <option value="fuel">Sort by Fuel</option>
                        <option value="health">Sort by Health</option>
                        <option value="mileage">Sort by Mileage</option>
                    </select>
                </div>
            </div>

            {/* Vehicles Grid/List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-3'}>
                {loading ? (
                    <div className="col-span-full bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-2" />
                        <p className="text-gray-600">Loading fleet...</p>
                    </div>
                ) : sortedVehicles.length === 0 ? (
                    <div className="col-span-full bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <Truck className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-900 font-medium">No vehicles found</p>
                        <p className="text-gray-600 text-sm mt-1">Try adjusting your filters</p>
                    </div>
                ) : (
                    sortedVehicles.map((vehicle) => {
                        const statusColor = getStatusColor(vehicle.status);
                        const healthColor = getHealthColor(vehicle.health);
                        const fuelColor = getFuelColor(vehicle.fuel);

                        return (
                            <div
                                key={vehicle.id}
                                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer"
                                onClick={() => handleViewDetails(vehicle)}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-lg ${statusColor === 'green' ? 'bg-green-100' :
                                                statusColor === 'blue' ? 'bg-blue-100' :
                                                    statusColor === 'orange' ? 'bg-orange-100' :
                                                        'bg-red-100'
                                            }`}>
                                            <Truck className={`h-6 w-6 ${statusColor === 'green' ? 'text-green-600' :
                                                    statusColor === 'blue' ? 'text-blue-600' :
                                                        statusColor === 'orange' ? 'text-orange-600' :
                                                            'text-red-600'
                                                }`} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{vehicle.vehicleId}</h3>
                                            <p className="text-sm text-gray-600">{vehicle.make} {vehicle.model}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor === 'green' ? 'bg-green-100 text-green-700' :
                                            statusColor === 'blue' ? 'bg-blue-100 text-blue-700' :
                                                statusColor === 'orange' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-red-100 text-red-700'
                                        }`}>
                                        {vehicle.status}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Users className="h-4 w-4" />
                                        <span>{vehicle.driver}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <MapPin className="h-4 w-4" />
                                        <span className="truncate">{vehicle.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Gauge className="h-4 w-4" />
                                        <span>{vehicle.mileage.toLocaleString()} miles</span>
                                    </div>
                                </div>

                                {/* Fuel */}
                                <div className="mb-3">
                                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                                        <span className="flex items-center gap-1">
                                            <Fuel className="h-3 w-3" />
                                            Fuel
                                        </span>
                                        <span className={`font-semibold ${fuelColor === 'green' ? 'text-green-600' :
                                                fuelColor === 'orange' ? 'text-orange-600' :
                                                    'text-red-600'
                                            }`}>{vehicle.fuel}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${fuelColor === 'green' ? 'bg-green-600' :
                                                    fuelColor === 'orange' ? 'bg-orange-600' :
                                                        'bg-red-600'
                                                }`}
                                            style={{ width: `${vehicle.fuel}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Health */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                                        <span className="flex items-center gap-1">
                                            <Battery className="h-3 w-3" />
                                            Health
                                        </span>
                                        <span className={`font-semibold ${healthColor === 'green' ? 'text-green-600' :
                                                healthColor === 'blue' ? 'text-blue-600' :
                                                    healthColor === 'orange' ? 'text-orange-600' :
                                                        'text-red-600'
                                            }`}>{vehicle.health}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${healthColor === 'green' ? 'bg-green-600' :
                                                    healthColor === 'blue' ? 'bg-blue-600' :
                                                        healthColor === 'orange' ? 'bg-orange-600' :
                                                            'bg-red-600'
                                                }`}
                                            style={{ width: `${vehicle.health}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Alerts */}
                                {vehicle.alerts.length > 0 && (
                                    <div className="mb-3">
                                        {vehicle.alerts.map((alert, index) => (
                                            <div key={index} className="flex items-center gap-2 px-2 py-1 bg-orange-50 rounded text-xs text-orange-700 mb-1">
                                                <AlertTriangle className="h-3 w-3" />
                                                <span>{alert}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 pt-3 border-t border-gray-200">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleScheduleMaintenance(vehicle);
                                        }}
                                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs transition flex items-center justify-center gap-1"
                                    >
                                        <Wrench className="h-3 w-3" />
                                        Maintenance
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewDetails(vehicle);
                                        }}
                                        className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-xs transition"
                                    >
                                        <Eye className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedVehicle && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Vehicle Details - {selectedVehicle.vehicleId}</h2>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="p-1 hover:bg-gray-100 rounded transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Make & Model</p>
                                    <p className="text-lg font-bold text-gray-900">{selectedVehicle.make} {selectedVehicle.model}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Year</p>
                                    <p className="text-lg font-bold text-gray-900">{selectedVehicle.year}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Type</p>
                                    <p className="text-lg font-bold text-gray-900">{selectedVehicle.type}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Capacity</p>
                                    <p className="text-lg font-bold text-gray-900">{selectedVehicle.capacity} kg</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Mileage</p>
                                    <p className="text-lg font-bold text-gray-900">{selectedVehicle.mileage.toLocaleString()} mi</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Engine Hours</p>
                                    <p className="text-lg font-bold text-gray-900">{selectedVehicle.engineHours}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                    <p className="text-sm text-green-700 mb-2">Fuel Level</p>
                                    <p className="text-3xl font-bold text-green-900">{selectedVehicle.fuel}%</p>
                                    <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${selectedVehicle.fuel}%` }}></div>
                                    </div>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-sm text-blue-700 mb-2">Health Score</p>
                                    <p className="text-3xl font-bold text-blue-900">{selectedVehicle.health}%</p>
                                    <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${selectedVehicle.health}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-2">Current Location</p>
                                <p className="text-gray-900 font-medium">{selectedVehicle.location}</p>
                                <p className="text-sm text-gray-600 mt-1">Lat: {selectedVehicle.latitude.toFixed(4)}, Lon: {selectedVehicle.longitude.toFixed(4)}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                                    <p className="text-sm text-orange-700 mb-1">Last Maintenance</p>
                                    <p className="text-orange-900 font-semibold">{selectedVehicle.lastMaintenance}</p>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                    <p className="text-sm text-purple-700 mb-1">Next Maintenance</p>
                                    <p className="text-purple-900 font-semibold">{selectedVehicle.nextMaintenance}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-600 mb-2">Assigned Driver</p>
                                <p className="text-lg font-semibold text-gray-900">{selectedVehicle.driver}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Maintenance Modal */}
            {showMaintenanceModal && selectedVehicle && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Schedule Maintenance</h2>
                            <p className="text-sm text-gray-600 mt-1">{selectedVehicle.vehicleId}</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Type</label>
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option>Oil Change</option>
                                    <option>Tire Rotation</option>
                                    <option>Brake Service</option>
                                    <option>General Inspection</option>
                                    <option>Engine Service</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Date</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                                <textarea
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Additional notes..."
                                ></textarea>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => setShowMaintenanceModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    alert('Maintenance scheduled! (Demo mode)');
                                    setShowMaintenanceModal(false);
                                }}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                            >
                                Schedule
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Vehicle Modal */}
            {showAddVehicleModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Add New Vehicle</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle ID</label>
                                    <input
                                        type="text"
                                        value={newVehicle.vehicleId}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, vehicleId: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="VH-XXX"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                                    <select
                                        value={newVehicle.type}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option>Truck</option>
                                        <option>Van</option>
                                        <option>Box Truck</option>
                                        <option>Flatbed</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Make</label>
                                    <input
                                        type="text"
                                        value={newVehicle.make}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Ford"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                                    <input
                                        type="text"
                                        value={newVehicle.model}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="F-150"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                                    <input
                                        type="number"
                                        value={newVehicle.year}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, year: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Capacity (kg)</label>
                                    <input
                                        type="number"
                                        value={newVehicle.capacity}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, capacity: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => setShowAddVehicleModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddVehicle}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                            >
                                Add Vehicle
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
