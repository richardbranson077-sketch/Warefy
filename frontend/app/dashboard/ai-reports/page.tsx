'use client';

import { useState, useEffect } from 'react';
import {
    Brain,
    Sparkles,
    Download,
    RefreshCw,
    Trash2,
    TrendingUp,
    BarChart3,
    PieChart,
    Table,
    Calendar,
    Search,
    Lightbulb,
    AlertCircle
} from 'lucide-react';
import {
    ResponsiveContainer,
    LineChart,
    BarChart,
    PieChart as RechartsPie,
    Line,
    Bar,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts';
import { aiReportsService, AIReport } from '@/services/ai_reports.service';

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const QUERY_SUGGESTIONS = [
    "What were my top 5 products by revenue last month?",
    "Show me inventory levels for low stock items",
    "Analyze sales trends for the past 30 days",
    "Which products have the highest profit margins?",
    "Show order fulfillment performance this week"
];

export default function AIReportsPage() {
    const [reports, setReports] = useState<AIReport[]>([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedReport, setSelectedReport] = useState<AIReport | null>(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const data = await aiReportsService.getReports();
            setReports(data);
            if (data.length > 0 && !selectedReport) {
                setSelectedReport(data[0]);
            }
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReport = async () => {
        if (!query.trim()) return;

        setGenerating(true);
        try {
            const report = await aiReportsService.generateReport({ query });
            setReports(prev => [report, ...prev]);
            setSelectedReport(report);
            setQuery('');
        } catch (error) {
            console.error('Failed to generate report:', error);
        } finally {
            setGenerating(false);
        }
    };

    const handleRegenerateReport = async (reportId: string) => {
        try {
            const updated = await aiReportsService.regenerateReport(reportId);
            setReports(prev => prev.map(r => r.id === reportId ? updated : r));
            if (selectedReport?.id === reportId) {
                setSelectedReport(updated);
            }
        } catch (error) {
            console.error('Failed to regenerate report:', error);
        }
    };

    const handleDeleteReport = async (reportId: string) => {
        try {
            await aiReportsService.deleteReport(reportId);
            setReports(prev => prev.filter(r => r.id !== reportId));
            if (selectedReport?.id === reportId) {
                setSelectedReport(reports[0] || null);
            }
        } catch (error) {
            console.error('Failed to delete report:', error);
        }
    };

    const handleExportCSV = (report: AIReport) => {
        const headers = ['Label', 'Value'];
        const rows = report.data.labels.map((label, i) => [label, report.data.values[i]]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${report.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderChart = (report: AIReport) => {
        const chartData = report.data.labels.map((label, i) => ({
            name: label,
            value: report.data.values[i]
        }));

        switch (report.chart_type) {
            case 'line':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} />
                        </LineChart>
                    </ResponsiveContainer>
                );

            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'pie':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <RechartsPie>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </RechartsPie>
                    </ResponsiveContainer>
                );

            case 'table':
                return (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Item</th>
                                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {chartData.map((row, i) => (
                                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="px-4 py-3 text-gray-900">{row.name}</td>
                                        <td className="px-4 py-3 text-right text-gray-900 font-medium">{row.value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Brain className="h-8 w-8 text-purple-600" />
                        AI Reports
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Generate intelligent reports with natural language queries
                    </p>
                </div>
            </div>

            {/* Query Input */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-start gap-3">
                    <Search className="h-5 w-5 text-gray-400 mt-3" />
                    <div className="flex-1">
                        <textarea
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleGenerateReport();
                                }
                            }}
                            placeholder="Ask anything... e.g., 'What were my top 5 products last month?'"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                            rows={3}
                        />
                        <div className="mt-3 flex flex-wrap gap-2">
                            {QUERY_SUGGESTIONS.map((suggestion, i) => (
                                <button
                                    key={i}
                                    onClick={() => setQuery(suggestion)}
                                    className="text-xs px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full transition-colors"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={handleGenerateReport}
                        disabled={generating || !query.trim()}
                        className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {generating ? (
                            <RefreshCw className="h-5 w-5 animate-spin" />
                        ) : (
                            <Sparkles className="h-5 w-5" />
                        )}
                        {generating ? 'Generating...' : 'Generate'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Reports List */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Generated Reports</h2>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="text-center py-12">
                            <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-sm">No reports yet</p>
                            <p className="text-gray-400 text-xs mt-1">Generate your first report above</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {reports.map((report) => (
                                <div
                                    key={report.id}
                                    onClick={() => setSelectedReport(report)}
                                    className={`p-3 rounded-lg cursor-pointer transition-all ${selectedReport?.id === report.id
                                            ? 'bg-purple-50 border-2 border-purple-200'
                                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-sm text-gray-900 truncate">{report.title}</h3>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{report.query}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-xs text-gray-400">
                                                    {new Date(report.generated_at).toLocaleDateString()}
                                                </span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${report.model === 'gemini-ai'
                                                        ? 'bg-purple-100 text-purple-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {report.model === 'gemini-ai' ? 'AI' : 'Pattern'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Report Details */}
                <div className="lg:col-span-2 space-y-6">
                    {selectedReport ? (
                        <>
                            {/* Report Header */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-gray-900">{selectedReport.title}</h2>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Generated on {new Date(selectedReport.generated_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleExportCSV(selectedReport)}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            title="Export CSV"
                                        >
                                            <Download className="h-5 w-5 text-gray-600" />
                                        </button>
                                        <button
                                            onClick={() => handleRegenerateReport(selectedReport.id)}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            title="Regenerate"
                                        >
                                            <RefreshCw className="h-5 w-5 text-gray-600" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteReport(selectedReport.id)}
                                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-5 w-5 text-red-600" />
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-gray-700 leading-relaxed">{selectedReport.summary}</p>
                                </div>
                            </div>

                            {/* Visualization */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-purple-600" />
                                    Data Visualization
                                </h3>
                                {renderChart(selectedReport)}
                            </div>

                            {/* Insights & Recommendations */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Insights */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Lightbulb className="h-5 w-5 text-yellow-600" />
                                        Key Insights
                                    </h3>
                                    <ul className="space-y-3">
                                        {selectedReport.insights.map((insight, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                                <Sparkles className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                                                {insight}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Recommendations */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5 text-green-600" />
                                        Recommendations
                                    </h3>
                                    <ul className="space-y-3">
                                        {selectedReport.recommendations.map((rec, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700 bg-green-50 p-3 rounded-lg border border-green-100">
                                                <TrendingUp className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                                {rec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-sm text-center">
                            <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Select a report to view details</p>
                            <p className="text-gray-400 text-sm mt-1">or generate a new one above</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
