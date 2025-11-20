'use client';

import { useEffect, useState } from 'react';
import {
    TrendingUp,
    Package,
    Truck,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    DollarSign
} from 'lucide-react';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalInventory: 12543,
        lowStockItems: 12,
        activeRoutes: 5,
        pendingAnomalies: 3,
        revenue: 452000,
        efficiency: 94.5
    });

    const StatCard = ({ title, value, icon: Icon, trend, color, prefix = '' }) => (
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                {trend && (
                    <span className={`flex items-center text-sm font-semibold ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trend > 0 ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{prefix}{value.toLocaleString()}</h3>
            <p className="text-sm text-gray-500">{title}</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500 mt-1">Real-time insights into your supply chain operations</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Inventory"
                    value={stats.totalInventory}
                    icon={Package}
                    trend={5.2}
                    color="bg-gradient-to-br from-blue-500 to-blue-600"
                />
                <StatCard
                    title="Active Routes"
                    value={stats.activeRoutes}
                    icon={Truck}
                    trend={12.5}
                    color="bg-gradient-to-br from-purple-500 to-purple-600"
                />
                <StatCard
                    title="Revenue (MTD)"
                    value={stats.revenue}
                    icon={DollarSign}
                    trend={8.1}
                    color="bg-gradient-to-br from-green-500 to-green-600"
                    prefix="$"
                />
                <StatCard
                    title="Efficiency Score"
                    value={stats.efficiency}
                    icon={Activity}
                    trend={2.3}
                    color="bg-gradient-to-br from-orange-500 to-orange-600"
                    prefix=""
                />
            </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <p className="text-gray-400">Chart visualization</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {[
                            { type: 'success', message: 'Inventory updated for Warehouse A', time: '5 min ago' },
                            { type: 'warning', message: 'Low stock alert for SKU-1234', time: '15 min ago' },
                            { type: 'info', message: 'Route optimization completed', time: '1 hour ago' },
                            { type: 'success', message: 'Delivery completed - Route 5', time: '2 hours ago' }
                        ].map((activity, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'success' ? 'bg-green-500' :
                                        activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                                    }`}></div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-900">{activity.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Alerts */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-lg font-semibold text-yellow-900 mb-1">Attention Required</h3>
                        <p className="text-yellow-700">You have {stats.pendingAnomalies} pending anomalies and {stats.lowStockItems} low stock items that need review.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
