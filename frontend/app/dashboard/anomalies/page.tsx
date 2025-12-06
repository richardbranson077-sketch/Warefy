'use client';

import { useState, useEffect, useMemo } from 'react';
import { anomaliesService, Anomaly, AnomalyAnalysis } from '@/services/anomalies.service';
import { LoadingSpinner } from '@/components/LoadingStates';
import { ErrorAlert } from '@/components/ErrorStates';
import {
    AlertTriangle,
    Shield,
    RefreshCw,
    CheckCircle,
    BrainCircuit,
    X,
    Activity,
    ArrowRight,
    Filter,
    Search
} from 'lucide-react';

export default function AnomaliesPage() {
    const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [analyzing, setAnalyzing] = useState<number | null>(null);
    const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnomalyAnalysis | null>(null);
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);

    // Filters
    const [severityFilter, setSeverityFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const fetchAnomalies = async () => {
        setLoading(true);
        try {
            const data = await anomaliesService.getAll({});
            setAnomalies(data);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Failed to load anomalies');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnomalies();
    }, []);

    // Client-side filtering
    const filteredAnomalies = useMemo(() => {
        return anomalies.filter(anomaly => {
            if (severityFilter !== 'all' && anomaly.severity !== severityFilter) return false;
            if (statusFilter === 'resolved' && !anomaly.resolved) return false;
            if (statusFilter === 'open' && anomaly.resolved) return false;
            return true;
        });
    }, [anomalies, severityFilter, statusFilter]);

    const handleDetect = async () => {
        setLoading(true);
        try {
            await anomaliesService.detectAnomalies();
            await fetchAnomalies();
        } catch (err) {
            console.error(err);
            setError('Failed to run detection');
            setLoading(false);
        }
    };

    const handleResolve = async (id: number) => {
        try {
            await anomaliesService.resolve(id);
            // Optimistic update
            setAnomalies(anomalies.map(a =>
                a.id === id ? { ...a, status: 'resolved' as const } : a
            ));
        } catch (err) {
            console.error(err);
            alert('Failed to resolve anomaly');
        }
    };

    const handleAnalyze = async (anomaly: Anomaly) => {
        setSelectedAnomaly(anomaly);
        setAnalyzing(anomaly.id);
        setShowAnalysisModal(true);
        setAnalysisResult(null);

        try {
            const result = await anomaliesService.analyze(anomaly.id);
            setAnalysisResult(result);
        } catch (err) {
            console.error(err);
            setAnalysisResult({
                root_cause: "Failed to generate analysis.",
                impact: "Unknown",
                recommendations: ["Check system logs manually"]
            });
        } finally {
            setAnalyzing(null);
        }
    };

    const stats = {
        total: anomalies.length,
        critical: anomalies.filter(a => a.severity === 'critical').length,
        high: anomalies.filter(a => a.severity === 'high').length,
        resolved: anomalies.filter(a => a.resolved).length
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        }
    };

    return (
        <div className="p-6 bg-gray-900 min-h-screen text-gray-100 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Activity className="h-8 w-8 text-blue-400" />
                        Anomaly Command Center
                    </h1>
                    <p className="text-gray-400 mt-1">AI-powered threat detection and resolution</p>
                </div>
                <button
                    onClick={handleDetect}
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Scan System
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-400">Total Issues</p>
                        <Activity className="h-5 w-5 text-blue-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-400">Critical</p>
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                    </div>
                    <p className="text-3xl font-bold text-red-400">{stats.critical}</p>
                </div>
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-400">High Priority</p>
                        <AlertTriangle className="h-5 w-5 text-orange-400" />
                    </div>
                    <p className="text-3xl font-bold text-orange-400">{stats.high}</p>
                </div>
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-400">Resolved</p>
                        <CheckCircle className="h-5 w-5 text-green-400" />
                    </div>
                    <p className="text-3xl font-bold text-green-400">{stats.resolved}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 bg-gray-800 p-4 rounded-xl border border-gray-700">
                <div className="flex items-center gap-2 text-gray-400">
                    <Filter className="h-4 w-4" />
                    <span className="text-sm font-medium">Filters:</span>
                </div>
                <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value="all">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value="all">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="resolved">Resolved</option>
                </select>
            </div>

            {/* Main Content */}
            {loading && !anomalies.length ? (
                <LoadingSpinner />
            ) : error ? (
                <ErrorAlert message={error} />
            ) : (
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-700">
                        <h2 className="text-xl font-bold text-white">Detected Issues</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-900/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Severity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Detected</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {filteredAnomalies.map((anomaly) => (
                                    <tr key={anomaly.id} className="hover:bg-gray-700/50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(anomaly.severity)} uppercase`}>
                                                {anomaly.severity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">
                                            {anomaly.anomalyType.replace('_', ' ')}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white">
                                            {anomaly.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                            {new Date(anomaly.detectedAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${anomaly.resolved
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                {anomaly.resolved ? 'Resolved' : 'Open'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleAnalyze(anomaly)}
                                                    className="p-2 text-purple-400 hover:bg-purple-500/10 rounded-lg transition"
                                                    title="Analyze with AI"
                                                >
                                                    <BrainCircuit className="h-4 w-4" />
                                                </button>
                                                {!anomaly.resolved && (
                                                    <button
                                                        onClick={() => handleResolve(anomaly.id)}
                                                        className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition"
                                                        title="Resolve"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {anomalies.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                            <Shield className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                                            <p className="text-lg font-medium">No active anomalies detected</p>
                                            <p className="text-sm">Your system is running smoothly.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Analysis Modal */}
            {showAnalysisModal && selectedAnomaly && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-6 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 z-10">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <BrainCircuit className="h-6 w-6 text-purple-400" />
                                AI Analysis
                            </h3>
                            <button
                                onClick={() => setShowAnalysisModal(false)}
                                className="text-gray-400 hover:text-white transition"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                                <h4 className="text-sm font-medium text-gray-400 mb-1">Anomaly Detected</h4>
                                <p className="text-lg text-white">{selectedAnomaly.description}</p>
                            </div>

                            {analyzing === selectedAnomaly.id ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <div className="relative">
                                        <div className="h-12 w-12 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <BrainCircuit className="h-6 w-6 text-purple-400 animate-pulse" />
                                        </div>
                                    </div>
                                    <p className="text-purple-400 animate-pulse">Analyzing patterns & generating insights...</p>
                                </div>
                            ) : analysisResult ? (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="space-y-2">
                                        <h4 className="text-red-400 font-semibold flex items-center gap-2">
                                            <Activity className="h-4 w-4" />
                                            Root Cause
                                        </h4>
                                        <p className="text-gray-300 bg-red-500/5 p-3 rounded-lg border border-red-500/10">
                                            {analysisResult.root_cause}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="text-orange-400 font-semibold flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4" />
                                            Potential Impact
                                        </h4>
                                        <p className="text-gray-300 bg-orange-500/5 p-3 rounded-lg border border-orange-500/10">
                                            {analysisResult.impact}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="text-green-400 font-semibold flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4" />
                                            Recommended Actions
                                        </h4>
                                        <ul className="space-y-2">
                                            {analysisResult.recommendations.map((rec, i) => (
                                                <li key={i} className="flex items-start gap-3 bg-green-500/5 p-3 rounded-lg border border-green-500/10">
                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold mt-0.5">
                                                        {i + 1}
                                                    </span>
                                                    <span className="text-gray-300">{rec}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    Failed to load analysis. Please try again.
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-700 bg-gray-800/50 sticky bottom-0 flex justify-end gap-3">
                            <button
                                onClick={() => setShowAnalysisModal(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white transition"
                            >
                                Close
                            </button>
                            {!selectedAnomaly.resolved && (
                                <button
                                    onClick={() => {
                                        handleResolve(selectedAnomaly.id);
                                        setShowAnalysisModal(false);
                                    }}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center gap-2"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    Resolve Issue
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
