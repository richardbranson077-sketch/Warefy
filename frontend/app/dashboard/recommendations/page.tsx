'use client';

import { useState } from 'react';
import { BrainCircuit, ArrowRight, Check, X, Zap, TrendingUp, Package, Truck } from 'lucide-react';

export default function RecommendationsPage() {
    // Mock recommendations
    const [recommendations, setRecommendations] = useState([
        {
            id: 1,
            type: 'inventory',
            title: 'Restock High-Demand Items',
            description: 'Product SKU-123 (Wireless Earbuds) is projected to stock out in 3 days based on current sales velocity.',
            impact: 'High',
            confidence: 98,
            action: 'Order 500 units',
            icon: Package,
            color: 'blue'
        },
        {
            id: 2,
            type: 'logistics',
            title: 'Optimize Route B-205',
            description: 'Traffic congestion detected on I-95. Rerouting could save 45 minutes and 12% fuel.',
            impact: 'Medium',
            confidence: 92,
            action: 'Apply New Route',
            icon: Truck,
            color: 'purple'
        },
        {
            id: 3,
            type: 'pricing',
            title: 'Dynamic Pricing Opportunity',
            description: 'Demand for "Smart Watch Series 5" has increased by 25%. Increasing price by 5% could maximize revenue without hurting conversion.',
            impact: 'High',
            confidence: 89,
            action: 'Update Price',
            icon: TrendingUp,
            color: 'green'
        }
    ]);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                            <BrainCircuit className="h-6 w-6 text-purple-300" />
                        </div>
                        <span className="text-purple-200 font-medium tracking-wide uppercase text-sm">Warefy AI Engine</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">AI Recommendations</h1>
                    <p className="text-indigo-200 max-w-2xl">
                        Our neural networks analyze millions of data points to provide actionable insights for your supply chain optimization.
                    </p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-xl text-green-600">
                        <Zap className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Optimization Score</p>
                        <h3 className="text-2xl font-bold text-gray-900">94/100</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                        <Check className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Actions Taken</p>
                        <h3 className="text-2xl font-bold text-gray-900">1,245</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                        <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Cost Savings</p>
                        <h3 className="text-2xl font-bold text-gray-900">$45.2k</h3>
                    </div>
                </div>
            </div>

            {/* Recommendations Feed */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Priority Actions</h2>
                <div className="grid gap-6">
                    {recommendations.map((rec) => (
                        <div key={rec.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Icon Column */}
                                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${rec.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                                        rec.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                                            'bg-green-50 text-green-600'
                                    }`}>
                                    <rec.icon className="h-6 w-6" />
                                </div>

                                {/* Content Column */}
                                <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {rec.title}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${rec.impact === 'High' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
                                                }`}>
                                                {rec.impact} Impact
                                            </span>
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                {rec.confidence}% Confidence
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 mb-4 leading-relaxed">
                                        {rec.description}
                                    </p>

                                    <div className="flex flex-wrap gap-3">
                                        <button className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                                            {rec.action} <ArrowRight className="ml-2 h-4 w-4" />
                                        </button>
                                        <button className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                                            Dismiss
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
