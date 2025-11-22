'use client';

import { useEffect, useState } from 'react';
import { reports } from '@/lib/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
    FileText, TrendingUp, AlertTriangle, Download, Brain, Sparkles, Target,
    DollarSign, Package, ShoppingCart, Users, Calendar, Filter, RefreshCw,
    Eye, Settings, Share2, Printer, Mail, Clock, Activity, BarChart3,
    TrendingDown, ArrowUpRight, ArrowDownRight, Zap
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AIReportsPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
    const [reportType, setReportType] = useState<'overview' | 'sales' | 'inventory' | 'performance'>('overview');

    useEffect(() => {
        fetchStats();
    }, [timeRange]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await reports.getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
            setStats(generateMockData());
        } finally {
            setLoading(false);
        }
    };

    const generateMockData = () => ({
        total_revenue: 145680,
        total_orders: 1247,
        low_stock_count: 8,
        avg_order_value: 116.82,
        revenue_growth: 12.5,
        order_growth: 8.3,
        sales_trend: Array.from({ length: 7 }, (_, i) => ({
            date: `Day ${i + 1}`,
            amount: 15000 + Math.random() * 10000,
            orders: 150 + Math.random() * 50
        })),
        top_items: [
            { name: 'Premium Widget', value: 245, revenue: 24500 },
            { name: 'Smart Gadget', value: 189, revenue: 18900 },
            { name: 'Eco Container', value: 156, revenue: 15600 },
            { name: 'Pro Tool Kit', value: 134, revenue: 13400 },
            { name: 'Deluxe Package', value: 98, revenue: 9800 }
        ],
        order_status_distribution: [
            { name: 'Completed', value: 856 },
            { name: 'Processing', value: 234 },
            { name: 'Shipped', value: 98 },
            { name: 'Pending', value: 59 }
        ],
        performance_metrics: [
            { metric: 'Delivery Speed', value: 92 },
            { metric: 'Accuracy', value: 98 },
            { metric: 'Customer Satisfaction', value: 95 },
            { metric: 'Efficiency', value: 88 },
            { metric: 'Cost Optimization', value: 85 }
        ]
    });

    if (loading) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading AI insights...</p>
                </div>
            </div>
        );
    }

    const salesTrend = stats?.sales_trend || [];
    const topItems = stats?.top_items || [];
    const statusDist = stats?.order_status_distribution || [];
    const performanceMetrics = stats?.performance_metrics || [];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <Brain className="h-7 w-7 text-white" />
                        </div>
                        AI Reports & Analytics
                    </h1>
                    <p className="text-gray-600 mt-2">Comprehensive insights powered by machine learning</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                        <Share2 className="h-5 w-5" />
                        Share
                    </button>
                    <button className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                        <Printer className="h-5 w-5" />
                        Print
                    </button>
                    <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition flex items-center gap-2">
                        <Download className="h-5 w-5" />
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Time Range & Report Type */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
                        <div className="flex gap-2">
                            {[
                                { id: '7d', label: 'Last 7 Days' },
                                { id: '30d', label: 'Last 30 Days' },
                                { id: '90d', label: 'Last 90 Days' }
                            ].map(range => (
                                <button
                                    key={range.id}
                                    onClick={() => setTimeRange(range.id as any)}
                                    className={`px-4 py-2 rounded-lg font-medium transition ${timeRange === range.id
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value as any)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        >
                            <option value="overview">Overview</option>
                            <option value="sales">Sales Analysis</option>
                            <option value="inventory">Inventory Report</option>
                            <option value="performance">Performance Metrics</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* AI Executive Summary */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 mb-6 shadow-lg text-white">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/20 rounded-lg">
                        <Sparkles className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                            AI Executive Summary
                        </h2>
                        <div className="space-y-2 text-indigo-100">
                            <p>✅ Revenue has <strong>increased by {stats?.revenue_growth}%</strong> compared to the previous period</p>
                            <p>📦 Inventory health is <strong>{stats?.low_stock_count > 10 ? 'critical' : 'optimal'}</strong> with {stats?.low_stock_count} items needing restock</p>
                            <p>🎯 Top performing product: <strong>{topItems[0]?.name}</strong> with {topItems[0]?.value} units sold</p>
                            <p>💡 <strong>Recommendation:</strong> Increase stock levels for top 3 performers to prevent stockouts and maintain momentum</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <span className="flex items-center text-sm font-medium text-green-600">
                            <ArrowUpRight className="h-4 w-4" />
                            {stats?.revenue_growth}%
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">${stats?.total_revenue?.toLocaleString()}</p>
                    <p className="text-sm text-gray-600 mt-1">Total Revenue</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <ShoppingCart className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="flex items-center text-sm font-medium text-blue-600">
                            <ArrowUpRight className="h-4 w-4" />
                            {stats?.order_growth}%
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats?.total_orders?.toLocaleString()}</p>
                    <p className="text-sm text-gray-600 mt-1">Total Orders</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Activity className="h-5 w-5 text-purple-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">${stats?.avg_order_value?.toFixed(2)}</p>
                    <p className="text-sm text-gray-600 mt-1">Avg Order Value</p>
                </div>

                <div className={`rounded-xl border p-6 shadow-sm ${stats?.low_stock_count > 10 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
                    }`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className={`p-2 rounded-lg ${stats?.low_stock_count > 10 ? 'bg-red-100' : 'bg-orange-100'
                            }`}>
                            <AlertTriangle className={`h-5 w-5 ${stats?.low_stock_count > 10 ? 'text-red-600' : 'text-orange-600'
                                }`} />
                        </div>
                    </div>
                    <p className={`text-2xl font-bold ${stats?.low_stock_count > 10 ? 'text-red-600' : 'text-gray-900'
                        }`}>{stats?.low_stock_count}</p>
                    <p className="text-sm text-gray-600 mt-1">Low Stock Alerts</p>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Revenue Trend */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        Revenue & Orders Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={salesTrend}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                            <Legend />
                            <Area type="monotone" dataKey="amount" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue ($)" />
                            <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} name="Orders" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Order Status Distribution */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        Order Status Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={statusDist}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                label
                            >
                                {statusDist.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Selling Products */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Package className="h-5 w-5 text-purple-600" />
                        Top Selling Products
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topItems} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                            <XAxis type="number" stroke="#6b7280" fontSize={12} />
                            <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={12} width={120} />
                            <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                            <Bar dataKey="value" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Performance Radar */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Target className="h-5 w-5 text-indigo-600" />
                        Performance Metrics
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={performanceMetrics}>
                            <PolarGrid stroke="#e5e7eb" />
                            <PolarAngleAxis dataKey="metric" stroke="#6b7280" fontSize={11} />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6b7280" fontSize={10} />
                            <Radar name="Performance" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                            <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
