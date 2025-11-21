'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
    TrendingUp,
    Package,
    Truck,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    DollarSign,
    BarChart3,
    Clock,
    CheckCircle,
    Zap,
    Users,
    MapPin,
    ShoppingCart,
    TrendingDown,
    Calendar,
    Bell,
    Settings
} from 'lucide-react';

export default function DashboardPage() {
    const [timeRange, setTimeRange] = useState('7d');

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
        { id: 1, type: 'order', message: 'New order #1249 received', time: '2 min ago', icon: ShoppingCart, color: 'blue' },
        { id: 2, type: 'delivery', message: 'Route DR-105 completed', time: '15 min ago', icon: CheckCircle, color: 'green' },
        { id: 3, type: 'stock', message: 'Low stock alert for SKU-2841', time: '1 hour ago', icon: AlertTriangle, color: 'orange' },
        { id: 4, type: 'vehicle', message: 'Vehicle VH-042 maintenance due', time: '2 hours ago', icon: Truck, color: 'purple' }
    ];

    const topProducts = [
        { name: 'Premium Widget A', sales: 1248, change: 12.5, trend: 'up' },
        { name: 'Standard Kit B', sales: 987, change: 8.3, trend: 'up' },
        { name: 'Deluxe Package C', sales: 756, change: -3.2, trend: 'down' },
        { name: 'Basic Unit D', sales: 654, change: 15.7, trend: 'up' }
    ];

    const activeRoutes = [
        { id: 'RT-001', vehicle: 'VH-042', destination: 'New York', eta: '2h 15m', status: 'on-time', progress: 65 },
        { id: 'RT-002', vehicle: 'VH-031', destination: 'Chicago', eta: '4h 30m', status: 'on-time', progress: 45 },
        { id: 'RT-003', vehicle: 'VH-018', destination: 'Boston', eta: '1h 05m', status: 'delayed', progress: 85 }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Dashboard Overview
                    </h1>
                    <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your supply chain today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                        <option value="24h">Last 24 Hours</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                    </select>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition">
                        <Calendar className="h-4 w-4" />
                        Custom Range
                    </button>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Inventory */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <Package className="h-6 w-6 text-blue-600" />
                        </div>
                        <span className="flex items-center text-green-600 text-sm font-semibold">
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            5.2%
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        {stats.totalInventory.toLocaleString()}
                    </h3>
                    <p className="text-sm text-gray-600">Total Inventory</p>
                </div>

                {/* Total Orders */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <ShoppingCart className="h-6 w-6 text-purple-600" />
                        </div>
                        <span className="flex items-center text-green-600 text-sm font-semibold">
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            12.5%
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        {stats.totalOrders.toLocaleString()}
                    </h3>
                    <p className="text-sm text-gray-600">Total Orders</p>
                </div>

                {/* Revenue */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-green-100 p-3 rounded-lg">
                            <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                        <span className="flex items-center text-green-600 text-sm font-semibold">
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            8.1%
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        ${(stats.revenue / 1000).toFixed(0)}K
                    </h3>
                    <p className="text-sm text-gray-600">Monthly Revenue</p>
                </div>

                {/* Delivery Rate */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-orange-100 p-3 rounded-lg">
                            <Truck className="h-6 w-6 text-orange-600" />
                        </div>
                        <span className="flex items-center text-green-600 text-sm font-semibold">
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            2.3%
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        {stats.deliveryRate}%
                    </h3>
                    <p className="text-sm text-gray-600">On-Time Delivery</p>
                </div>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-700 text-sm font-medium mb-1">Active Routes</p>
                            <p className="text-3xl font-bold text-blue-900">{stats.activeRoutes}</p>
                        </div>
                        <Activity className="h-12 w-12 text-blue-600 opacity-40" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-700 text-sm font-medium mb-1">Efficiency Score</p>
                            <p className="text-3xl font-bold text-green-900">{stats.efficiency}%</p>
                        </div>
                        <Zap className="h-12 w-12 text-green-600 opacity-40" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-700 text-sm font-medium mb-1">Avg Delivery Time</p>
                            <p className="text-3xl font-bold text-orange-900">{stats.avgDeliveryTime}</p>
                        </div>
                        <Clock className="h-12 w-12 text-orange-600 opacity-40" />
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Routes */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Active Routes</h2>
                        <button className="text-blue-600 text-sm font-medium hover:text-blue-700">View All</button>
                    </div>
                    <div className="space-y-4">
                        {activeRoutes.map((route) => (
                            <div key={route.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 p-2 rounded-lg">
                                            <Truck className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{route.id}</p>
                                            <p className="text-sm text-gray-600">{route.vehicle} • {route.destination}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">ETA: {route.eta}</p>
                                        <span className={`text-xs px-2 py-1 rounded-full ${route.status === 'on-time'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {route.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${route.status === 'on-time' ? 'bg-green-500' : 'bg-orange-500'
                                            }`}
                                        style={{ width: `${route.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                        <Bell className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="space-y-4">
                        {recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3">
                                <div className={`bg-${activity.color}-100 p-2 rounded-lg flex-shrink-0`}>
                                    <activity.icon className={`h-4 w-4 text-${activity.color}-600`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900 font-medium">{activity.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900">Top Performing Products</h2>
                    <button className="text-blue-600 text-sm font-medium hover:text-blue-700">View Report</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {topProducts.map((product, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                                <span className={`flex items-center text-xs font-semibold ${product.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {product.trend === 'up' ? (
                                        <ArrowUpRight className="h-3 w-3 mr-0.5" />
                                    ) : (
                                        <ArrowDownRight className="h-3 w-3 mr-0.5" />
                                    )}
                                    {Math.abs(product.change)}%
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{product.sales}</p>
                            <p className="text-xs text-gray-600 mt-1">Units sold</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-6 text-left transition group">
                    <Package className="h-8 w-8 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-lg mb-1">Add Inventory</h3>
                    <p className="text-sm text-blue-100">Update stock levels</p>
                </button>

                <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl p-6 text-left transition group">
                    <Truck className="h-8 w-8 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-lg mb-1">Create Route</h3>
                    <p className="text-sm text-purple-100">Optimize delivery path</p>
                </button>

                <button className="bg-green-600 hover:bg-green-700 text-white rounded-xl p-6 text-left transition group">
                    <BarChart3 className="h-8 w-8 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-lg mb-1">View Analytics</h3>
                    <p className="text-sm text-green-100">Detailed insights</p>
                </button>
            </div>
        </div>
    );
}
