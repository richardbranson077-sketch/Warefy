'use client';

import { useState } from 'react';
import {
    TrendingUp,
    Package,
    Truck,
    AlertTriangle,
    ArrowUpRight,
    Activity,
    DollarSign,
    BarChart3,
    Clock,
    CheckCircle
} from 'lucide-react';

export default function DashboardPage() {
    const [stats] = useState({
        totalInventory: 12543,
        lowStockItems: 12,
        activeRoutes: 5,
        pendingAnomalies: 3,
        revenue: 452000,
        efficiency: 94.5
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500 mt-1">Real-time insights into your supply chain operations</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Inventory Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl text-white shadow-lg shadow-blue-500/30">
                            <Package className="h-6 w-6" />
                        </div>
                        <span className="flex items-center text-green-600 text-sm font-bold bg-green-50 px-2 py-1 rounded-lg">
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            5.2%
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                        {stats.totalInventory.toLocaleString()}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">Total Inventory</p>
                </div>

                {/* Active Routes Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl text-white shadow-lg shadow-purple-500/30">
                            <Truck className="h-6 w-6" />
                        </div>
                        <span className="flex items-center text-green-600 text-sm font-bold bg-green-50 px-2 py-1 rounded-lg">
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            12.5%
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                        {stats.activeRoutes}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">Active Routes</p>
                </div>

                {/* Revenue Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl text-white shadow-lg shadow-green-500/30">
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <span className="flex items-center text-green-600 text-sm font-bold bg-green-50 px-2 py-1 rounded-lg">
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            8.1%
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                        ${stats.revenue.toLocaleString()}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">Revenue (MTD)</p>
                </div>

                {/* Efficiency Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl text-white shadow-lg shadow-orange-500/30">
                            <Activity className="h-6 w-6" />
                        </div>
                        <span className="flex items-center text-green-600 text-sm font-bold bg-green-50 px-2 py-1 rounded-lg">
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            2.3%
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                        {stats.efficiency}%
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">Efficiency Score</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Performance Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Performance Trends</h3>
                        <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                            <option>This Year</option>
                        </select>
                    </div>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <div className="text-center">
                            <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm font-medium">Chart Visualization Area</p>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>
                    <div className="space-y-6">
                        {[
                            { type: 'success', message: 'Inventory updated for Warehouse A', time: '5 min ago', color: 'bg-green-500' },
                            { type: 'warning', message: 'Low stock alert for SKU-1234', time: '15 min ago', color: 'bg-orange-500' },
                            { type: 'info', message: 'Route optimization completed', time: '1 hour ago', color: 'bg-blue-500' },
                            { type: 'success', message: 'Delivery completed - Route 5', time: '2 hours ago', color: 'bg-green-500' }
                        ].map((activity, index) => (
                            <div key={index} className="flex gap-4">
                                <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${activity.color}`}></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {activity.time}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        View All Activity
                    </button>
                </div>
            </div>

            {/* Alert Banner */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-600 flex-shrink-0">
                    <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-amber-900 mb-1">Attention Required</h3>
                    <p className="text-amber-800 text-sm leading-relaxed">
                        You have <span className="font-bold">{stats.pendingAnomalies} pending anomalies</span> and <span className="font-bold">{stats.lowStockItems} low stock items</span> that need immediate review to prevent supply chain disruptions.
                    </p>
                </div>
                <button className="ml-auto px-4 py-2 bg-white border border-amber-200 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-50 transition-colors shadow-sm whitespace-nowrap">
                    Review Issues
                </button>
            </div>
        </div>
    );
}
