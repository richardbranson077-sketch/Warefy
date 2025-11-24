'use client';

import { useState } from 'react';
import { useReports } from '@/hooks/useReports';
import { LoadingSpinner } from '@/components/LoadingStates';
import { ErrorAlert } from '@/components/ErrorStates';
import {
    FileText,
    Download,
    Calendar,
    BarChart3,
    TrendingUp,
    RefreshCw,
    Eye
} from 'lucide-react';

export default function ReportsPage() {
    const { data: reports, loading, error, refetch } = useReports();

    const [reportType, setReportType] = useState('all');

    const filteredReports = (reports || []).filter(report => {
        if (reportType === 'all') return true;
        return report.type === reportType;
    });

    const stats = {
        total: reports?.length || 0,
        inventory: reports?.filter(r => r.type === 'inventory').length || 0,
        sales: reports?.filter(r => r.type === 'sales').length || 0,
        performance: reports?.filter(r => r.type === 'performance').length || 0
    };

    return (
        <>
            {loading && <LoadingSpinner />}
            {error && <ErrorAlert message={error} />}
            {!loading && !error && (
                <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <BarChart3 className="h-8 w-8 text-emerald-400" />
                                Reports & Analytics
                            </h1>
                            <p className="text-gray-400 mt-1">Generate and view reports</p>
                        </div>
                        <button
                            onClick={() => refetch()}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Total Reports</p>
                                <FileText className="h-5 w-5 text-emerald-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Inventory</p>
                                <BarChart3 className="h-5 w-5 text-blue-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.inventory}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Sales</p>
                                <TrendingUp className="h-5 w-5 text-green-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.sales}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Performance</p>
                                <Calendar className="h-5 w-5 text-purple-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.performance}</p>
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                        >
                            <option value="all">All Report Types</option>
                            <option value="inventory">Inventory Reports</option>
                            <option value="sales">Sales Reports</option>
                            <option value="performance">Performance Reports</option>
                        </select>
                    </div>

                    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-750 border-b border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Report Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Type</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Generated</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {filteredReports.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                                            No reports found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReports.map((report) => (
                                        <tr key={report.id} className="hover:bg-gray-750 transition">
                                            <td className="px-4 py-3 text-sm font-medium">{report.name}</td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 bg-emerald-400/10 text-emerald-400 rounded-full text-xs">
                                                    {report.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-400">
                                                {new Date(report.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <button className="p-1 hover:bg-gray-700 rounded transition">
                                                        <Eye className="h-4 w-4 text-gray-400" />
                                                    </button>
                                                    <button className="p-1 hover:bg-gray-700 rounded transition">
                                                        <Download className="h-4 w-4 text-gray-400" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
}
