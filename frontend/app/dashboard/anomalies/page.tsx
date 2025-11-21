'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, AlertOctagon, Search, Filter, CheckCircle, XCircle, ArrowRight, Activity } from 'lucide-react';
import { anomalies as anomaliesApi } from '@/lib/api';

interface Anomaly {
    id: number;
    severity: 'critical' | 'warning' | 'medium' | 'low';
    title: string;
    description: string;
    detectedAt: string;
    status: 'Resolved' | 'Open' | 'Investigating';
    metric: string;
}

export default function AnomaliesPage() {
    const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
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
                    <h1 className="text-3xl font-bold text-white">Anomaly Detection</h1>
                    <p className="text-gray-400 mt-1">Real-time monitoring of irregularities in your supply chain</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 font-medium flex items-center shadow-sm transition-colors">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </button>
                    <button
                        onClick={runScan}
                        disabled={scanning}
                        className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-500 font-medium shadow-lg shadow-red-500/30 flex items-center transition-all disabled:opacity-50 border border-red-500/50"
                    >
                        <Activity className={`h-4 w-4 mr-2 ${scanning ? 'animate-spin' : ''}`} />
                        {scanning ? 'Scanning...' : 'Run Scan'}
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card rounded-2xl p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertOctagon className="h-16 w-16 text-red-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-400 relative z-10">Active Anomalies</p>
                    <h3 className="text-3xl font-bold text-white mt-2 relative z-10">12</h3>
                    <div className="mt-2 text-xs font-medium text-red-400 bg-red-500/10 inline-block px-2 py-1 rounded-lg border border-red-500/20 relative z-10">
                        +3 since yesterday
                    </div>
                </div>
                <div className="glass-card rounded-2xl p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertTriangle className="h-16 w-16 text-orange-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-400 relative z-10">Critical Issues</p>
                    <h3 className="text-3xl font-bold text-white mt-2 relative z-10">2</h3>
                    <div className="mt-2 text-xs font-medium text-orange-400 bg-orange-500/10 inline-block px-2 py-1 rounded-lg border border-orange-500/20 relative z-10">
                        Needs attention
                    </div>
                </div>
                <div className="glass-card rounded-2xl p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-400 relative z-10">Avg Resolution Time</p>
                    <h3 className="text-3xl font-bold text-white mt-2 relative z-10">4.2h</h3>
                    <div className="mt-2 text-xs font-medium text-green-400 bg-green-500/10 inline-block px-2 py-1 rounded-lg border border-green-500/20 relative z-10">
                        -15% improvement
                    </div>
                </div>
                <div className="glass-card rounded-2xl p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity className="h-16 w-16 text-blue-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-400 relative z-10">System Health</p>
                    <h3 className="text-3xl font-bold text-white mt-2 relative z-10">98.5%</h3>
                    <div className="mt-2 text-xs font-medium text-blue-400 bg-blue-500/10 inline-block px-2 py-1 rounded-lg border border-blue-500/20 relative z-10">
                        Operational
                    </div>
                </div>
            </div>

            {/* Anomalies List */}
            <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-900/50 backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-white">Detected Issues</h3>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search anomalies..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-500"
                        />
                    </div>
                </div>

                <div className="divide-y divide-white/10">
                    {anomalies.map((anomaly) => (
                        <div key={anomaly.id} className="p-6 hover:bg-white/5 transition-colors group">
                            <div className="flex items-start gap-4">
                                <div className={`flex-shrink-0 mt-1 ${anomaly.severity === 'critical' ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                                    anomaly.severity === 'warning' ? 'text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]' :
                                        'text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                                    }`}>
                                    {anomaly.severity === 'critical' ? <AlertOctagon className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
                                </div>

                                <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                                        <div>
                                            <h4 className="text-base font-bold text-white group-hover:text-red-400 transition-colors">
                                                {anomaly.title}
                                            </h4>
                                            <p className="text-sm text-gray-400 mt-1">
                                                Detected {anomaly.detectedAt} • Metric: <span className="font-medium text-gray-300">{anomaly.metric}</span>
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide border ${anomaly.severity === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                            anomaly.severity === 'warning' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>
                                            {anomaly.severity}
                                        </span>
                                    </div>

                                    <p className="text-gray-400 text-sm mb-4 leading-relaxed max-w-3xl">
                                        {anomaly.description}
                                    </p>

                                    <div className="flex items-center gap-3">
                                        <button className="text-sm font-medium text-white bg-white/5 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">
                                            Investigate
                                        </button>
                                        <button
                                            onClick={() => handleResolve(anomaly.id)}
                                            className="text-sm font-medium text-gray-500 hover:text-gray-300 px-4 py-2 transition-colors"
                                        >
                                            Resolve
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
