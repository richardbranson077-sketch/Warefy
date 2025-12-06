'use client';

import { useState, useEffect } from 'react';
import {
    BarChart3,
    Calendar,
    ChevronDown,
    StickyNote,
    Filter,
    RefreshCw,
    TrendingUp,
    Brain,
    Zap,
    AlertTriangle,
    CheckCircle2,
    Circle,
    Activity
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { reportingService, ReportData, AIInsightsResponse } from '@/services/reporting.service';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function ReportingPage() {
    const [loading, setLoading] = useState(false);
    const [reportType, setReportType] = useState('sales_performance');
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [aiInsights, setAiInsights] = useState<AIInsightsResponse | null>(null);
    const [aiLoading, setAiLoading] = useState(false);

    const generateReport = async () => {
        setLoading(true);
        setAiInsights(null);
        try {
            // Ensure end date covers the full day
            const endDate = new Date(dateRange.end);
            endDate.setHours(23, 59, 59, 999);

            const data = await reportingService.generateReport(
                reportType,
                new Date(dateRange.start),
                endDate
            );
            setReportData(data);

            // Auto-generate AI insights
            generateInsights(data);
        } catch (error) {
            console.error("Failed to generate report:", error);
        } finally {
            setLoading(false);
        }
    };

    const generateInsights = async (data: ReportData) => {
        setAiLoading(true);
        try {
            const insights = await reportingService.generateAIInsights(
                data.report_type,
                data.summary,
                data.data
            );
            setAiInsights(insights);
        } catch (error) {
            console.error("Failed to generate AI insights:", error);
        } finally {
            setAiLoading(false);
        }
    };

    useEffect(() => {
        generateReport();
    }, [reportType]); // Auto-refresh on type change

    const renderCharts = () => {
        if (!reportData) return null;

        if (reportType === 'sales_performance') {
            return (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                        Revenue Trend
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={reportData.summary.chart_data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="revenue" fill="#3b82f6" name="Revenue ($)" />
                                <Bar dataKey="orders" fill="#10b981" name="Orders" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            );
        }

        if (reportType === 'inventory_valuation') {
            const pieData = Object.entries(reportData.summary.category_breakdown || {}).map(([name, stats]: [string, any]) => ({
                name,
                value: stats.value
            }));

            return (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Circle className="w-5 h-5 mr-2 text-purple-600" />
                        Inventory Value by Category
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            );
        }

        if (reportType === 'order_fulfillment') {
            const pieData = Object.entries(reportData.summary.status_breakdown || {}).map(([name, value]) => ({
                name,
                value
            }));

            return (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
                        Order Status Breakdown
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            );
        }

        return null;
    };

    const renderSummaryCards = () => {
        if (!reportData) return null;

        const cards = [];
        const s = reportData.summary;

        if (reportType === 'sales_performance') {
            cards.push(
                { label: 'Total Revenue', value: `$${s.total_revenue?.toLocaleString()}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Total Orders', value: s.total_orders, icon: StickyNote, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Avg Order Value', value: `$${s.average_order_value}`, icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50' }
            );
        } else if (reportType === 'inventory_valuation') {
            cards.push(
                { label: 'Total Value', value: `$${s.total_inventory_value?.toLocaleString()}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Total Items', value: s.total_items_count?.toLocaleString(), icon: StickyNote, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Categories', value: Object.keys(s.category_breakdown || {}).length, icon: Circle, color: 'text-purple-600', bg: 'bg-purple-50' }
            );
        } else if (reportType === 'low_stock') {
            cards.push(
                { label: 'Low Stock Items', value: s.total_low_stock_items, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
                { label: 'Critical (Out of Stock)', value: s.critical_items, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' }
            );
        } else if (reportType === 'order_fulfillment') {
            cards.push(
                { label: 'Total Orders', value: s.total_orders, icon: StickyNote, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Fulfillment Rate', value: s.fulfillment_rate, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' }
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {cards.map((card, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center">
                        <div className={`p-3 rounded-lg ${card.bg} mr-4`}>
                            <card.icon className={`w-6 h-6 ${card.color}`} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{card.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const handleExport = () => {
        if (!reportData || !reportData.data.length) return;

        const headers = Object.keys(reportData.data[0]);
        const csvContent = [
            headers.join(','),
            ...reportData.data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Advanced Reporting</h1>
                    <p className="text-gray-600 mt-1">Generate comprehensive business intelligence reports</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={generateReport}
                        disabled={loading}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                        Refresh Data
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={!reportData}
                        className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                    >
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                    <div className="relative">
                        <StickyNote className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
                        >
                            <option value="sales_performance">Sales Performance</option>
                            <option value="inventory_valuation">Inventory Valuation</option>
                            <option value="low_stock">Low Stock Alerts</option>
                            <option value="order_fulfillment">Order Fulfillment</option>
                        </select>
                    </div>
                </div>

                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>
                </div>

                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* AI Insights Panel */}
            <div className="mb-8">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-indigo-900 flex items-center">
                            <Brain className="w-5 h-5 mr-2 text-indigo-600" />
                            AI Executive Summary
                        </h3>
                        {aiLoading && (
                            <span className="text-sm text-indigo-600 flex items-center">
                                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                Analyzing...
                            </span>
                        )}
                    </div>

                    {aiInsights ? (
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-bold text-indigo-800 uppercase tracking-wider mb-3 flex items-center">
                                    <Zap className="w-4 h-4 mr-2" />
                                    Key Observations
                                </h4>
                                <ul className="space-y-2">
                                    {aiInsights.insights.map((insight, idx) => (
                                        <li key={idx} className="flex items-start text-indigo-700 text-sm">
                                            <span className="mr-2">•</span>
                                            {insight}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-indigo-800 uppercase tracking-wider mb-3 flex items-center">
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Recommendations
                                </h4>
                                <ul className="space-y-2">
                                    {aiInsights.recommendations.map((rec, idx) => (
                                        <li key={idx} className="flex items-start text-indigo-700 text-sm">
                                            <span className="mr-2">•</span>
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-indigo-400">
                            {aiLoading ? "Gemini is analyzing your data..." : "Generate a report to see AI insights."}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            {renderSummaryCards()}
            {renderCharts()}

            {/* Data Table */}
            {reportData && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900">Detailed Data</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium">
                                <tr>
                                    {Object.keys(reportData.data[0] || {}).map((key) => (
                                        <th key={key} className="px-6 py-3 capitalize">{key.replace(/_/g, ' ')}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {reportData.data.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        {Object.values(row).map((val: any, i) => (
                                            <td key={i} className="px-6 py-3 text-gray-700">
                                                {typeof val === 'number' && !Number.isInteger(val) ? val.toFixed(2) : val}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {reportData.data.length === 0 && (
                            <div className="p-8 text-center text-gray-500">No data available for this period.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
