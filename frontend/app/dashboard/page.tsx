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
    CheckCircle,
    Zap,
    Cpu,
    Globe
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">
                        Command <span className="text-gradient">Center</span>
                    </h1>
                    <p className="text-gray-400 mt-2 text-lg">Real-time supply chain intelligence & orchestration</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                        System Operational
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                        v2.4.0-AI
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Inventory Card */}
                <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Package className="h-24 w-24 text-blue-500" />
                    </div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="bg-blue-500/20 p-3 rounded-xl text-blue-400 border border-blue-500/20">
                            <Package className="h-6 w-6" />
                        </div>
                        <span className="flex items-center text-green-400 text-sm font-bold bg-green-500/10 px-2 py-1 rounded-lg border border-green-500/20">
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            5.2%
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-1 relative z-10">
                        {stats.totalInventory.toLocaleString()}
                    </h3>
                    <p className="text-sm text-gray-400 font-medium relative z-10">Total Inventory</p>
                </div>

                {/* Active Routes Card */}
                <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Globe className="h-24 w-24 text-purple-500" />
                    </div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="bg-purple-500/20 p-3 rounded-xl text-purple-400 border border-purple-500/20">
                            <Truck className="h-6 w-6" />
                        </div>
                        <span className="flex items-center text-green-400 text-sm font-bold bg-green-500/10 px-2 py-1 rounded-lg border border-green-500/20">
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            12.5%
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-1 relative z-10">
                        {stats.activeRoutes}
                    </h3>
                    <p className="text-sm text-gray-400 font-medium relative z-10">Active Routes</p>
                </div>

                {/* Revenue Card */}
                <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign className="h-24 w-24 text-emerald-500" />
                    </div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="bg-emerald-500/20 p-3 rounded-xl text-emerald-400 border border-emerald-500/20">
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <span className="flex items-center text-green-400 text-sm font-bold bg-green-500/10 px-2 py-1 rounded-lg border border-green-500/20">
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            8.1%
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-1 relative z-10">
                        ${stats.revenue.toLocaleString()}
                    </h3>
                    <p className="text-sm text-gray-400 font-medium relative z-10">Revenue (MTD)</p>
                </div>

                {/* Efficiency Card */}
                <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap className="h-24 w-24 text-amber-500" />
                    </div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="bg-amber-500/20 p-3 rounded-xl text-amber-400 border border-amber-500/20">
                            <Activity className="h-6 w-6" />
                        </div>
                        <span className="flex items-center text-green-400 text-sm font-bold bg-green-500/10 px-2 py-1 rounded-lg border border-green-500/20">
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            2.3%
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-1 relative z-10">
                        {stats.efficiency}%
                    </h3>
                    <p className="text-sm text-gray-400 font-medium relative z-10">Efficiency Score</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Performance Chart */}
                <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-blue-400" />
                            <h3 className="text-lg font-bold text-white">Performance Analytics</h3>
                        </div>
                        <select className="bg-gray-900/50 border border-gray-700 text-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                            <option>This Year</option>
                        </select>
                    </div>
                    <div className="h-80 flex items-center justify-center bg-gray-900/50 rounded-xl border border-white/5 relative overflow-hidden">
                        {/* Grid Background Effect */}
                        <div className="absolute inset-0" style={{
                            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
                            backgroundSize: '40px 40px'
                        }}></div>

                        <div className="text-center relative z-10">
                            <div className="bg-gray-800/50 p-4 rounded-full inline-block mb-3 border border-white/5">
                                <Cpu className="h-8 w-8 text-blue-400 animate-pulse" />
                            </div>
                            <p className="text-gray-400 text-sm font-medium">AI Model Processing Data...</p>
                            <p className="text-xs text-gray-600 mt-1">Visualizations will appear here</p>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="glass-panel rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-purple-400" />
                        Live Activity Feed
                    </h3>
                    <div className="space-y-6">
                        {[
                            { type: 'success', message: 'Inventory updated for Warehouse A', time: '5 min ago', bg: 'bg-green-500', text: 'text-green-500', border: 'border-green-500/30', icon: CheckCircle },
                            { type: 'warning', message: 'Low stock alert for SKU-1234', time: '15 min ago', bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500/30', icon: AlertTriangle },
                            { type: 'info', message: 'Route optimization completed', time: '1 hour ago', bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500/30', icon: Cpu },
                            { type: 'success', message: 'Delivery completed - Route 5', time: '2 hours ago', bg: 'bg-green-500', text: 'text-green-500', border: 'border-green-500/30', icon: Truck }
                        ].map((activity, index) => (
                            <div key={index} className="flex gap-4 group">
                                <div className="relative">
                                    <div className={`w-2 h-full absolute left-1/2 -translate-x-1/2 bg-gray-800 -z-10 ${index === 3 ? 'hidden' : ''}`}></div>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.bg} bg-opacity-20 border ${activity.border}`}>
                                        <activity.icon className={`h-4 w-4 ${activity.text}`} />
                                    </div>
                                </div>
                                <div className="pb-2">
                                    <p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{activity.message}</p>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {activity.time}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-2.5 text-sm font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
                        View Full Log
                    </button>
                </div>
            </div>

            {/* Alert Banner */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center gap-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-50"></div>
                <div className="p-3 bg-red-500/20 rounded-xl text-red-400 flex-shrink-0 relative z-10 border border-red-500/20">
                    <AlertTriangle className="h-6 w-6 animate-pulse" />
                </div>
                <div className="relative z-10 flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">Critical Attention Required</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                        AI has detected <span className="font-bold text-red-400">{stats.pendingAnomalies} anomalies</span> and <span className="font-bold text-amber-400">{stats.lowStockItems} low stock items</span>. Immediate intervention recommended.
                    </p>
                </div>
                <button className="relative z-10 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-500/20 flex items-center gap-2">
                    Resolve Issues
                    <ArrowUpRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
