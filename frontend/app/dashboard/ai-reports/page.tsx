'use client';

import { useEffect, useState } from 'react';
import { reports } from '@/lib/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { FileText, TrendingUp, AlertTriangle, Download, Brain } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AIReportsPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await reports.getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-6 text-gray-400">Loading reports...</div>;
    }

    // Fallback for empty data to avoid chart errors
    const salesTrend = stats?.sales_trend?.length ? stats.sales_trend : [{ date: 'No Data', amount: 0 }];
    const topItems = stats?.top_items?.length ? stats.top_items : [{ name: 'No Data', value: 0 }];
    const statusDist = stats?.order_status_distribution?.length ? stats.order_status_distribution : [{ name: 'No Data', value: 1 }];

    return (
        <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="h-6 w-6 text-blue-400" />
                        AI Reports & Analytics
                    </h1>
                    <p className="text-gray-400 mt-1">Deep insights into your supply chain performance</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow-lg shadow-blue-900/20">
                    <Download className="h-4 w-4" /> Export PDF
                </button>
            </div>

            {/* AI Insights Banner */}
            <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 rounded-xl p-6 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Brain className="h-32 w-32 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-400" /> AI Executive Summary
                </h2>
                <p className="text-gray-300 max-w-3xl leading-relaxed">
                    Based on the last 7 days of activity, revenue has {stats?.total_revenue > 0 ? 'increased' : 'remained stable'}.
                    Inventory health is {stats?.low_stock_count > 0 ? 'critical' : 'optimal'}, with {stats?.low_stock_count} items needing restock.
                    Top performing SKU is <strong>{topItems[0]?.name}</strong>. Recommendation: Increase stock levels for top performers to prevent stockouts.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Sales Trend */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-400" /> Revenue Trend (Last 7 Days)
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                                <YAxis stroke="#9CA3AF" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                                    itemStyle={{ color: '#10B981' }}
                                />
                                <Line type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Order Status Distribution */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-400" /> Order Status Breakdown
                    </h3>
                    <div className="h-64 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusDist}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusDist.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Selling Items */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-purple-400" /> Top Selling Products
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topItems} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                                <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                                <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={12} width={100} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                                    cursor={{ fill: '#374151', opacity: 0.4 }}
                                />
                                <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg flex flex-col justify-center items-center text-center">
                        <div className="p-3 bg-green-500/10 rounded-full mb-3">
                            <TrendingUp className="h-6 w-6 text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-white">${stats?.total_revenue?.toLocaleString() || '0'}</div>
                        <div className="text-sm text-gray-400">Total Revenue</div>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg flex flex-col justify-center items-center text-center">
                        <div className="p-3 bg-blue-500/10 rounded-full mb-3">
                            <FileText className="h-6 w-6 text-blue-400" />
                        </div>
                        <div className="text-3xl font-bold text-white">{stats?.total_orders?.toLocaleString() || '0'}</div>
                        <div className="text-sm text-gray-400">Total Orders</div>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg flex flex-col justify-center items-center text-center col-span-2">
                        <div className="p-3 bg-red-500/10 rounded-full mb-3">
                            <AlertTriangle className="h-6 w-6 text-red-400" />
                        </div>
                        <div className="text-3xl font-bold text-white">{stats?.low_stock_count || '0'}</div>
                        <div className="text-sm text-gray-400">Low Stock Alerts</div>
                        <div className="text-xs text-red-400 mt-1">Immediate attention required</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
