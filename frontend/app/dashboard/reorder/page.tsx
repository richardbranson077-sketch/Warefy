'use client';

import { useState, useEffect } from 'react';
import {
    getReorderSuggestions,
    getSupplierPerformance,
    getStockoutRiskAnalysis,
    getAIReorderInsight,
    ReorderSuggestion,
    StockoutRiskAnalysis
} from '@/services/reorder.service';
import { LoadingSpinner } from '@/components/LoadingStates';
import { ErrorAlert } from '@/components/ErrorStates';
import {
    Package,
    AlertCircle,
    ChevronDown,
    RefreshCw,
    Brain,
    Truck,
    CheckCircle,
    AlertTriangle,
    ArrowRight,
    Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReorderPage() {
    const [suggestions, setSuggestions] = useState<ReorderSuggestion[]>([]);
    const [supplierPerf, setSupplierPerf] = useState<any[]>([]);
    const [riskAnalysis, setRiskAnalysis] = useState<StockoutRiskAnalysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [insightLoading, setInsightLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [suggData, perfData, riskData] = await Promise.all([
                getReorderSuggestions(),
                getSupplierPerformance(),
                getStockoutRiskAnalysis()
            ]);
            setSuggestions(suggData);
            setSupplierPerf(perfData);
            setRiskAnalysis(riskData);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch reorder data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleGetInsight = async (sku: string) => {
        setSelectedItem(sku);
        setInsightLoading(true);
        try {
            // Mock data for demo if needed, but calling real endpoint
            const insight = await getAIReorderInsight(sku, 50, 5, 7);
            setAiInsight(insight.insight);
        } catch (err) {
            setAiInsight("Could not generate insight at this time.");
        } finally {
            setInsightLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorAlert message={error} />;

    return (
        <div className="p-6 bg-gray-900 min-h-screen text-gray-100 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
                        <Zap className="h-8 w-8 text-yellow-400" />
                        Smart Reorder Command Center
                    </h1>
                    <p className="text-gray-400 mt-1">AI-driven inventory replenishment and supplier management</p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition border border-gray-700"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh Data
                </button>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700 p-6 rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm text-gray-400">Pending Reorders</p>
                            <h3 className="text-3xl font-bold text-white mt-1">{suggestions.length}</h3>
                        </div>
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Package className="h-6 w-6 text-blue-400" />
                        </div>
                    </div>
                    <div className="flex items-center text-sm text-blue-400">
                        <ArrowRight className="h-4 w-4 mr-1" />
                        {suggestions.filter(s => s.urgency === 'critical').length} Critical Items
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur border border-gray-700 p-6 rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm text-gray-400">Stockout Risk (7d)</p>
                            <h3 className="text-3xl font-bold text-white mt-1">
                                {riskAnalysis?.critical_risk.length || 0}
                            </h3>
                        </div>
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <AlertTriangle className="h-6 w-6 text-red-400" />
                        </div>
                    </div>
                    <div className="text-sm text-red-400">
                        Immediate attention needed
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur border border-gray-700 p-6 rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm text-gray-400">Supplier Health</p>
                            <h3 className="text-3xl font-bold text-white mt-1">94%</h3>
                        </div>
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <Truck className="h-6 w-6 text-green-400" />
                        </div>
                    </div>
                    <div className="text-sm text-green-400">
                        +2.5% vs last month
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur border border-gray-700 p-6 rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm text-gray-400">AI Optimization</p>
                            <h3 className="text-3xl font-bold text-white mt-1">$12.4k</h3>
                        </div>
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Brain className="h-6 w-6 text-purple-400" />
                        </div>
                    </div>
                    <div className="text-sm text-purple-400">
                        Projected savings this month
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Reorder List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-white">Priority Reorder Suggestions</h2>
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                                AI Prioritized
                            </span>
                        </div>
                        <div className="divide-y divide-gray-700">
                            {suggestions.map((item) => (
                                <motion.div
                                    key={item.sku}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className={`p-6 hover:bg-gray-750 transition cursor-pointer ${selectedItem === item.sku ? 'bg-gray-750 border-l-4 border-blue-500' : ''}`}
                                    onClick={() => handleGetInsight(item.sku)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-medium text-white text-lg">{item.product_name}</h3>
                                                {item.urgency === 'critical' && (
                                                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded uppercase font-bold tracking-wider">
                                                        Critical
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-400 mt-1">SKU: {item.sku} • Supplier: {item.supplier}</p>
                                            <div className="flex items-center gap-4 mt-3 text-sm">
                                                <span className="text-gray-300">Current: <span className="text-white font-mono">{item.current_stock}</span></span>
                                                <span className="text-gray-300">Reorder Point: <span className="text-white font-mono">{item.reorder_point}</span></span>
                                                <span className="text-blue-400 font-medium">Suggested: +{item.recommended_quantity}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-white">${item.estimated_cost.toLocaleString()}</p>
                                            <p className="text-xs text-gray-500 mt-1">Est. Cost</p>
                                            <button className="mt-3 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition">
                                                Approve PO
                                            </button>
                                        </div>
                                    </div>

                                    {/* AI Insight Expansion */}
                                    {selectedItem === item.sku && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            className="mt-4 pt-4 border-t border-gray-700"
                                        >
                                            <div className="flex gap-3">
                                                <div className="mt-1">
                                                    <Brain className="h-5 w-5 text-purple-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-semibold text-purple-400 mb-1">Gemini AI Insight</h4>
                                                    {insightLoading ? (
                                                        <div className="h-4 w-3/4 bg-gray-700 animate-pulse rounded"></div>
                                                    ) : (
                                                        <p className="text-sm text-gray-300 leading-relaxed">
                                                            {aiInsight}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                            {suggestions.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    No items require reordering at this time.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Risk & Suppliers */}
                <div className="space-y-6">
                    {/* Stockout Risk Heatmap */}
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-400" />
                            Stockout Risk Heatmap
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-red-900/20 border border-red-900/30 rounded-lg">
                                <span className="text-red-400 text-sm font-medium">Critical (0-3 days)</span>
                                <span className="text-white font-bold">{riskAnalysis?.critical_risk.length || 0} items</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-orange-900/20 border border-orange-900/30 rounded-lg">
                                <span className="text-orange-400 text-sm font-medium">High (4-7 days)</span>
                                <span className="text-white font-bold">{riskAnalysis?.high_risk.length || 0} items</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-yellow-900/20 border border-yellow-900/30 rounded-lg">
                                <span className="text-yellow-400 text-sm font-medium">Medium (8-14 days)</span>
                                <span className="text-white font-bold">{riskAnalysis?.medium_risk.length || 0} items</span>
                            </div>
                        </div>
                    </div>

                    {/* Top Suppliers */}
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Truck className="h-5 w-5 text-blue-400" />
                            Top Supplier Performance
                        </h3>
                        <div className="space-y-4">
                            {supplierPerf.slice(0, 3).map((supplier) => (
                                <div key={supplier.supplier} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white font-medium">{supplier.supplier}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500 rounded-full"
                                                    style={{ width: `${supplier.on_time_percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-400">{Math.round(supplier.on_time_percentage)}% On-Time</span>
                                        </div>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs font-bold ${supplier.rating === 'excellent' ? 'bg-green-500/20 text-green-400' :
                                        supplier.rating === 'good' ? 'bg-blue-500/20 text-blue-400' :
                                            'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                        {supplier.rating.toUpperCase()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
