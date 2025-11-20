'use client';

import { useEffect, useState } from 'react';
import {
    TrendingUp,
    AlertTriangle,
    Package,
    Truck,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { inventory, anomalies, routes } from '../lib/api';

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalInventory: 0,
        lowStockItems: 0,
        activeRoutes: 0,
        pendingAnomalies: 0,
        revenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // In a real app, these would be parallel fetches or a single dashboard endpoint
                // For now using mock data or simple API calls
                setStats({
                    totalInventory: 12543,
                    lowStockItems: 12,
                    activeRoutes: 5,
                    pendingAnomalies: 3,
                    revenue: 452000
                });
                setLoading(false);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const StatCard = ({ title, value, icon: Icon, trend, color }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
            </div>
            {trend && (
                <div className="mt-4 flex items-center text-sm">
                    <span className={`flex items-center font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trend > 0 ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
                        {Math.abs(trend)}%
                    </span>
                    <span className="text-gray-500 ml-2">vs last month</span>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500 mt-1">Real-time insights into your supply chain operations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Inventory"
                    value={stats.totalInventory.toLocaleString()}
                    icon={Package}
                    trend={5.2}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Active Routes"
                    value={stats.activeRoutes}
                    icon={Truck}
                    trend={12.5}
                    color="bg-indigo-500"
                />
                <StatCard
                    title="Revenue (MTD)"
                    value={`$${stats.revenue.toLocaleString()}`}
                    icon={TrendingUp}
                    trend={8.1}
                    color="bg-green-500"
                />
                <StatCard
                    title="Pending Anomalies"
                    value={stats.pendingAnomalies}
                    icon={AlertTriangle}
                    trend={-2.4}
                    color="bg-orange-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Placeholder for charts */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-80">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Demand Forecast vs Actual</h3>
                    <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        Chart Component Placeholder
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-80">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Distribution</h3>
                    <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        Heatmap Component Placeholder
                    </div>
                </div>
            </div>
        </div>
    );
}
