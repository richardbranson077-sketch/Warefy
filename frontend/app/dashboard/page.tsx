'use client';

import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import {
    Moon,
    Zap as Sun,
    Bell,
    Package,
    Truck,
    CheckCircle,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    BarChart3,
    Calendar,
    Clock,
    Zap,
    Activity,
    TrendingUp
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function DashboardPage() {
    const [timeRange, setTimeRange] = useState('7d');
    const [darkMode, setDarkMode] = useState(false);

    const stats = {
        totalInventory: 12543,
        lowStockItems: 12,
        activeRoutes: 5,
        totalOrders: 1248,
        revenue: 452000,
        efficiency: 94.5,
        deliveryRate: 98.2,
        avgDeliveryTime: '2.3 days'
    };

    const recentActivities = [
        { id: 1, message: 'New order #1249 received', time: '2 min ago', icon: Package, color: 'blue' },
        { id: 2, message: 'Route DR-105 completed', time: '15 min ago', icon: CheckCircle, color: 'green' },
        { id: 3, message: 'Low stock alert for SKU-2841', time: '1 hour ago', icon: AlertTriangle, color: 'orange' },
        { id: 4, message: 'Vehicle VH-042 maintenance due', time: '2 hours ago', icon: Truck, color: 'purple' }
    ];

    const topProducts = [
        { name: 'Premium Widget A', sales: 1248, change: 12.5, trend: 'up' },
        { name: 'Standard Kit B', sales: 987, change: 8.3, trend: 'up' },
        { name: 'Deluxe Package C', sales: 756, change: -3.2, trend: 'down' },
        { name: 'Basic Unit D', sales: 654, change: 15.7, trend: 'up' }
    ];

    const salesHistory = [
        { date: '2025-10-01', sales: 200 },
        { date: '2025-10-08', sales: 340 },
        { date: '2025-10-15', sales: 280 },
        { date: '2025-10-22', sales: 410 },
        { date: '2025-10-29', sales: 370 }
    ];

    const activeRoutes = [
        { id: 'RT-001', vehicle: 'VH-042', destination: 'New York', eta: '2h 15m', status: 'on-time', progress: 65 },
        { id: 'RT-002', vehicle: 'VH-031', destination: 'Chicago', eta: '4h 30m', status: 'on-time', progress: 45 },
        { id: 'RT-003', vehicle: 'VH-018', destination: 'Boston', eta: '1h 05m', status: 'delayed', progress: 85 }
    ];

    return (
        <div className={darkMode ? 'dark bg-gray-900 min-h-screen text-gray-100' : 'bg-gray-50 min-h-screen text-gray-900'}>
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl font-bold">Warehouse Dashboard</h1>
                <div className="flex items-center space-x-3">
                    <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition">
                        {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition">
                        <Bell className="h-5 w-5" />
                    </button>
                    <Image src="/avatar.png" alt="User" width={32} height={32} className="rounded-full" />
                </div>
            </header>

            {/* Controls */}
            <section className="flex items-center justify-between p-4">
                <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 focus:outline-none"
                >
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                </select>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
                    <Calendar className="h-4 w-4" /> Custom Range
                </button>
            </section>

            {/* Summary Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 shadow-sm hover:shadow-md transition backdrop-blur-lg bg-opacity-70">
                    <div className="flex items-center justify-between">
                        <Package className="h-6 w-6 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Total Inventory</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-blue-900">{stats.totalInventory.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 shadow-sm hover:shadow-md transition backdrop-blur-lg bg-opacity-70">
                    <div className="flex items-center justify-between">
                        <Package className="h-6 w-6 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">Total Orders</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-purple-900">{stats.totalOrders.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 shadow-sm hover:shadow-md transition backdrop-blur-lg bg-opacity-70">
                    <div className="flex items-center justify-between">
                        <DollarSign className="h-6 w-6 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Revenue</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-green-900">${(stats.revenue / 1000).toFixed(0)}K</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 shadow-sm hover:shadow-md transition backdrop-blur-lg bg-opacity-70">
                    <div className="flex items-center justify-between">
                        <Truck className="h-6 w-6 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">Delivery Rate</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-orange-900">{stats.deliveryRate}%</p>
                </div>
            </section>

            {/* Secondary Stats */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-700 text-sm font-medium mb-1">Active Routes</p>
                            <p className="text-3xl font-bold text-blue-900">{stats.activeRoutes}</p>
                        </div>
                        <Activity className="h-12 w-12 text-blue-600 opacity-40" />
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <Package className="h-6 w-6 text-purple-600" />
                        </div>
                        <span className="flex items-center text-green-600 text-sm font-semibold">
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            12.5%
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalOrders.toLocaleString()}</h3>
                    <p className="text-sm text-gray-600">Total Orders</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-700 text-sm font-medium mb-1">Efficiency</p>
                            <p className="text-3xl font-bold text-green-900">{stats.efficiency}%</p>
                        </div>
                        <Zap className="h-12 w-12 text-green-600 opacity-40" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-700 text-sm font-medium mb-1">Avg Delivery Time</p>
                            <p className="text-3xl font-bold text-orange-900">{stats.avgDeliveryTime}</p>
                        </div>
                        <Clock className="h-12 w-12 text-orange-600 opacity-40" />
                    </div>
                </div>
            </section>

            {/* Charts */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
                    <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Sales Over Time</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={salesHistory}>
                            <XAxis dataKey="date" stroke={darkMode ? '#fff' : '#333'} />
                            <YAxis stroke={darkMode ? '#fff' : '#333'} />
                            <Tooltip />
                            <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
                    <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Top Products</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={topProducts}>
                            <XAxis dataKey="name" stroke={darkMode ? '#fff' : '#333'} />
                            <YAxis stroke={darkMode ? '#fff' : '#333'} />
                            <Tooltip />
                            <Bar dataKey="sales" fill="#10b981" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* Main Grid */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
                {/* Active Routes */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Active Routes</h2>
                        <button className="text-blue-600 hover:underline">View All</button>
                    </div>
                    {activeRoutes.map((route) => (
                        <div key={route.id} className="border-b border-gray-200 dark:border-gray-700 py-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Truck className="h-5 w-5 text-blue-600" />
                                    <span className="font-medium text-gray-800 dark:text-gray-200">{route.id}</span>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{route.vehicle} • {route.destination}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">ETA: {route.eta}</p>
                                    <span className={`px-2 py-1 rounded-full text-xs ${route.status === 'on-time' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>{route.status === 'delayed' ? 'Delayed' : 'On‑Time'}</span>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div className={`h-2 rounded-full ${route.status === 'on-time' ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${route.progress}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Recent Activity</h2>
                        <Bell className="h-5 w-5 text-gray-400" />
                    </div>
                    <ul className="space-y-2">
                        {recentActivities.map((act) => (
                            <li key={act.id} className="flex items-start space-x-2">
                                <div className={`bg-${act.color}-100 p-2 rounded-lg`}> <act.icon className={`h-4 w-4 text-${act.color}-600`} /> </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{act.message}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{act.time}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Quick Actions */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                <Link href="/dashboard/inventory" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-6 text-left transition group block">
                    <Package className="h-8 w-8 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-lg mb-1">Add Inventory</h3>
                    <p className="text-sm text-blue-100">Update stock levels</p>
                </Link>
                <Link href="/dashboard/routes" className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl p-6 text-left transition group block">
                    <Truck className="h-8 w-8 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-lg mb-1">Create Route</h3>
                    <p className="text-sm text-purple-100">Optimize delivery path</p>
                </Link>
                <Link href="/dashboard/ai-reports" className="bg-green-600 hover:bg-green-700 text-white rounded-xl p-6 text-left transition group block">
                    <BarChart3 className="h-8 w-8 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-lg mb-1">View Analytics</h3>
                    <p className="text-sm text-green-100">Detailed insights</p>
                </Link>
            </section>
        </div>
    );
}
