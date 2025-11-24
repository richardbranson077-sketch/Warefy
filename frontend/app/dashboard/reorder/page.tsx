'use client';

import { useState, useEffect } from 'react';
import {
    Package, TrendingDown, AlertTriangle, DollarSign, Clock,
    RefreshCw, Download, Zap, CheckCircle, XCircle, ArrowUpRight,
    Calendar, BarChart3, ShoppingCart, Truck, Target
} from 'lucide-react';

interface ReorderRecommendation {
    sku: string;
    product_name: string;
    current_stock: number;
    reorder_point: number;
    recommended_quantity: number;
    urgency: string;
    reason: string;
    supplier: string;
    estimated_cost: number;
}

interface SupplierPerformance {
    supplier: string;
    total_orders: number;
    on_time_deliveries: number;
    late_deliveries: number;
    on_time_percentage: number;
    average_lead_time_days: number;
    total_spend: number;
    rating: string;
}

export default function ReorderPage() {
    const [activeTab, setActiveTab] = useState<'recommendations' | 'suppliers' | 'analytics'>('recommendations');
    const [recommendations, setRecommendations] = useState<ReorderRecommendation[]>([]);
    const [suppliers, setSuppliers] = useState<SupplierPerformance[]>([]);
    const [loading, setLoading] = useState(false);
    const [autoReorderEnabled, setAutoReorderEnabled] = useState(false);

    const urgencyColors = {
        critical: 'bg-red-100 text-red-700 border-red-300',
        high: 'bg-orange-100 text-orange-700 border-orange-300',
        medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        low: 'bg-blue-100 text-blue-700 border-blue-300'
    };

    const ratingColors = {
        excellent: 'text-green-600',
        good: 'text-blue-600',
        fair: 'text-yellow-600',
        poor: 'text-red-600'
    };

    useEffect(() => {
        loadRecommendations();
        loadSuppliers();
    }, []);

    const loadRecommendations = async () => {
        setLoading(true);
        // Simulated data
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockData: ReorderRecommendation[] = [
            {
                sku: 'PALLET-001',
                product_name: 'Standard Pallet',
                current_stock: 5,
                reorder_point: 20,
                recommended_quantity: 50,
                urgency: 'critical',
                reason: 'Will stockout in 2 days at current demand',
                supplier: 'Pallet Supply Co',
                estimated_cost: 2500.00
            },
            {
                sku: 'BATTERY-AA',
                product_name: 'AA Batteries (Pack of 100)',
                current_stock: 12,
                reorder_point: 30,
                recommended_quantity: 100,
                urgency: 'high',
                reason: 'Below reorder point (12/30)',
                supplier: 'Battery World',
                estimated_cost: 1200.00
            },
            {
                sku: 'TAPE-PACK',
                product_name: 'Packing Tape Roll',
                current_stock: 45,
                reorder_point: 50,
                recommended_quantity: 75,
                urgency: 'medium',
                reason: 'Approaching reorder point',
                supplier: 'Office Supplies Inc',
                estimated_cost: 375.00
            }
        ];

        setRecommendations(mockData);
        setLoading(false);
    };

    const loadSuppliers = async () => {
        const mockSuppliers: SupplierPerformance[] = [
            {
                supplier: 'Pallet Supply Co',
                total_orders: 24,
                on_time_deliveries: 23,
                late_deliveries: 1,
                on_time_percentage: 95.8,
                average_lead_time_days: 5.2,
                total_spend: 45000,
                rating: 'excellent'
            },
            {
                supplier: 'Battery World',
                total_orders: 18,
                on_time_deliveries: 15,
                late_deliveries: 3,
                on_time_percentage: 83.3,
                average_lead_time_days: 7.5,
                total_spend: 28000,
                rating: 'good'
            },
            {
                supplier: 'Office Supplies Inc',
                total_orders: 32,
                on_time_deliveries: 30,
                late_deliveries: 2,
                on_time_percentage: 93.8,
                average_lead_time_days: 4.8,
                total_spend: 15000,
                rating: 'excellent'
            }
        ];

        setSuppliers(mockSuppliers);
    };

    const generatePO = () => {
        alert('Purchase Order generated! In production, this would create a PO and send it to the supplier.');
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                            <Zap className="h-7 w-7 text-white" />
                        </div>
                        Smart Reorder Automation
                    </h1>
                    <p className="text-gray-600 mt-2">AI-powered inventory replenishment</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setAutoReorderEnabled(!autoReorderEnabled)}
                        className={`px-5 py-2.5 border rounded-lg transition flex items-center gap-2 ${autoReorderEnabled
                                ? 'bg-green-50 border-green-300 text-green-700'
                                : 'bg-white border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        <Zap className={`h-5 w-5 ${autoReorderEnabled ? 'animate-pulse' : ''}`} />
                        Auto-Reorder {autoReorderEnabled ? 'ON' : 'OFF'}
                    </button>
                    <button
                        onClick={generatePO}
                        className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm transition flex items-center gap-2"
                    >
                        <ShoppingCart className="h-5 w-5" />
                        Generate PO
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <span className="text-sm font-medium text-red-600">Critical</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">1</p>
                    <p className="text-sm text-gray-600 mt-1">Items Need Immediate Reorder</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <TrendingDown className="h-5 w-5 text-orange-600" />
                        </div>
                        <span className="text-sm font-medium text-orange-600">High</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">1</p>
                    <p className="text-sm text-gray-600 mt-1">Below Reorder Point</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-green-600">Savings</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">$4,075</p>
                    <p className="text-sm text-gray-600 mt-1">Estimated PO Cost</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Clock className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-blue-600">Avg Lead Time</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">5.8</p>
                    <p className="text-sm text-gray-600 mt-1">Days</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="border-b border-gray-200">
                    <div className="flex gap-1 p-2">
                        {[
                            { id: 'recommendations', label: 'Reorder Recommendations', icon: Package },
                            { id: 'suppliers', label: 'Supplier Performance', icon: Truck },
                            { id: 'analytics', label: 'Stockout Analytics', icon: BarChart3 }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition ${activeTab === tab.id
                                        ? 'bg-green-50 text-green-600'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recommendations Tab */}
                {activeTab === 'recommendations' && (
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {recommendations.length} Items Need Reordering
                            </h3>
                            <button
                                onClick={loadRecommendations}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition flex items-center gap-2"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>

                        <div className="space-y-3">
                            {recommendations.map((rec, index) => (
                                <div
                                    key={index}
                                    className="bg-gray-50 border-2 border-gray-200 rounded-xl p-5 hover:border-green-400 transition"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="font-semibold text-gray-900">{rec.product_name}</h4>
                                                <span className={`px-2 py-1 text-xs font-medium rounded border ${urgencyColors[rec.urgency as keyof typeof urgencyColors]}`}>
                                                    {rec.urgency.toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3">{rec.reason}</p>
                                            <div className="grid grid-cols-4 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-500">Current Stock</p>
                                                    <p className="text-lg font-bold text-red-600">{rec.current_stock}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Reorder Point</p>
                                                    <p className="text-lg font-bold text-gray-900">{rec.reorder_point}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Recommended Qty</p>
                                                    <p className="text-lg font-bold text-green-600">{rec.recommended_quantity}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Estimated Cost</p>
                                                    <p className="text-lg font-bold text-gray-900">${rec.estimated_cost.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-300">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Truck className="h-4 w-4" />
                                            Supplier: <span className="font-medium">{rec.supplier}</span>
                                        </div>
                                        <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition">
                                            Add to PO
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Suppliers Tab */}
                {activeTab === 'suppliers' && (
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Supplier Performance Metrics</h3>
                        <div className="space-y-4">
                            {suppliers.map((supplier, index) => (
                                <div key={index} className="bg-white border border-gray-200 rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 text-lg">{supplier.supplier}</h4>
                                            <p className={`text-sm font-medium ${ratingColors[supplier.rating as keyof typeof ratingColors]}`}>
                                                {supplier.rating.toUpperCase()} RATING
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-gray-900">{supplier.on_time_percentage.toFixed(1)}%</p>
                                            <p className="text-sm text-gray-600">On-Time Delivery</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-5 gap-4 pt-4 border-t border-gray-200">
                                        <div>
                                            <p className="text-xs text-gray-600">Total Orders</p>
                                            <p className="text-lg font-semibold text-gray-900">{supplier.total_orders}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600">On-Time</p>
                                            <p className="text-lg font-semibold text-green-600">{supplier.on_time_deliveries}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600">Late</p>
                                            <p className="text-lg font-semibold text-red-600">{supplier.late_deliveries}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600">Avg Lead Time</p>
                                            <p className="text-lg font-semibold text-gray-900">{supplier.average_lead_time_days.toFixed(1)} days</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600">Total Spend</p>
                                            <p className="text-lg font-semibold text-gray-900">${supplier.total_spend.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">30-Day Stockout Risk Analysis</h3>
                        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-8 text-center mb-6">
                            <Target className="h-16 w-16 text-orange-600 mx-auto mb-4" />
                            <h4 className="text-2xl font-bold text-gray-900 mb-2">Risk Analysis Dashboard</h4>
                            <p className="text-gray-600">Predictive analytics coming soon</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
