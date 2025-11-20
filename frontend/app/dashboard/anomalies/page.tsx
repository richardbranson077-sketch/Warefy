'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, AlertOctagon, Search, Filter, CheckCircle, XCircle, ArrowRight, Activity } from 'lucide-react';
import { anomalies as anomaliesApi } from '@/lib/api';

export default function AnomaliesPage() {
    const [anomalies, setAnomalies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(false);

    const fetchAnomalies = async () => {
        try {
            setLoading(true);
            const data = await anomaliesApi.getRecent(50);
            if (data && data.length > 0) {
                const mappedAnomalies = data.map((a: any) => ({
                    id: a.id,
                    severity: a.severity || 'medium',
                    title: a.anomaly_type ? a.anomaly_type.replace('_', ' ').toUpperCase() : 'Unknown Issue',
                    description: a.description,
                    detectedAt: new Date(a.detected_at).toLocaleString(),
                    status: a.resolved ? 'Resolved' : 'Open',
                    metric: a.entity_type
                }));
                setAnomalies(mappedAnomalies);
            } else {
                // Keep mock data if API returns empty (for demo purposes)
                setAnomalies([
                    {
                        id: 1,
                        severity: 'critical',
                        title: 'Sudden Demand Spike',
                        description: 'Product SKU-998 experienced a 400% increase in orders within 2 hours. Potential viral trend or bot activity.',
                        detectedAt: '10 mins ago',
                        status: 'Open',
                        metric: 'Order Volume'
                    },
                    {
                        id: 2,
                        severity: 'warning',
                        title: 'Inventory Discrepancy',
                        description: 'Warehouse B reported 50 units of SKU-123, but system shows 45. Manual count recommended.',
                        detectedAt: '2 hours ago',
                        status: 'Investigating',
                        metric: 'Stock Count'
                    }
                ]);
            }
        } catch (error) {
            console.error("Failed to fetch anomalies:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnomalies();
    }, []);

    const runScan = async () => {
        try {
            setScanning(true);
            // Run both detection algorithms
            await Promise.all([
                anomaliesApi.detectDemand({ days: 30 }),
                anomaliesApi.detectInventory({})
            ]);
            // Refresh list
            await fetchAnomalies();
        } catch (error) {
            console.error("Scan failed:", error);
        } finally {
            setScanning(false);
        }
    };

    const handleResolve = async (id: number) => {
        try {
            await anomaliesApi.resolve(id);
            // Optimistic update
            setAnomalies(prev => prev.map(a =>
                a.id === id ? { ...a, status: 'Resolved' } : a
            ));
        } catch (error) {
            console.error("Failed to resolve:", error);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Anomaly Detection</h1>
                    <p className="text-gray-500 mt-1">Real-time monitoring of irregularities in your supply chain</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium flex items-center shadow-sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </button>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium shadow-lg shadow-red-500/30 flex items-center">
                        <Activity className="h-4 w-4 mr-2" />
                        Run Scan
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Active Anomalies</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">12</h3>
                    <div className="mt-2 text-xs font-medium text-red-600 bg-red-50 inline-block px-2 py-1 rounded-lg">
                        +3 since yesterday
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Critical Issues</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">2</h3>
                    <div className="mt-2 text-xs font-medium text-orange-600 bg-orange-50 inline-block px-2 py-1 rounded-lg">
                        Needs attention
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Avg Resolution Time</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">4.2h</h3>
                    <div className="mt-2 text-xs font-medium text-green-600 bg-green-50 inline-block px-2 py-1 rounded-lg">
                        -15% improvement
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">System Health</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">98.5%</h3>
                    <div className="mt-2 text-xs font-medium text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded-lg">
                        Operational
                    </div>
                </div>
            </div>

            {/* Anomalies List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h3 className="text-lg font-bold text-gray-900">Detected Issues</h3>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search anomalies..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="divide-y divide-gray-100">
                    {anomalies.map((anomaly) => (
                        <div key={anomaly.id} className="p-6 hover:bg-gray-50 transition-colors group">
                            <div className="flex items-start gap-4">
                                <div className={`flex-shrink-0 mt-1 ${anomaly.severity === 'critical' ? 'text-red-500' :
                                    anomaly.severity === 'warning' ? 'text-orange-500' :
                                        'text-blue-500'
                                    }`}>
                                    {anomaly.severity === 'critical' ? <AlertOctagon className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
                                </div>

                                <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                                        <div>
                                            <h4 className="text-base font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                                                {anomaly.title}
                                            </h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Detected {anomaly.detectedAt} • Metric: <span className="font-medium text-gray-700">{anomaly.metric}</span>
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${anomaly.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                            anomaly.severity === 'warning' ? 'bg-orange-100 text-orange-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                            {anomaly.severity}
                                        </span>
                                    </div>

                                    <p className="text-gray-600 text-sm mb-4 leading-relaxed max-w-3xl">
                                        {anomaly.description}
                                    </p>

                                    <div className="flex items-center gap-3">
                                        <button className="text-sm font-medium text-gray-900 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                                            Investigate
                                        </button>
                                        <button className="text-sm font-medium text-gray-500 hover:text-gray-700 px-4 py-2 transition-colors">
                                            Ignore
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
