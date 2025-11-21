'use client';

import { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, TrendingUp, AlertTriangle, Package, Zap, RefreshCw, BrainCircuit, Check } from 'lucide-react';
import { aiRecommendations } from '@/lib/api';

interface Recommendation {
    id: number;
    title: string;
    description: string;
    impact: 'High' | 'Medium' | 'Low';
    confidence: number;
    action: string;
    icon: any;
    color: string;
}

export default function RecommendationsPage() {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            // In a real app, we might pass specific context data here
            const data = await aiRecommendations.get({});
            if (data && data.length > 0) {
                setRecommendations(data);
            } else {
                // Fallback mock data
                setRecommendations([
                    {
                        id: 1,
                        title: 'Reallocate Inventory to West Coast',
                        description: 'Demand for "Smart Thermostat X1" is rising by 45% in California. Moving 500 units from Texas warehouse will prevent stockouts and reduce shipping time by 1.2 days.',
                        impact: 'High',
                        confidence: 94,
                        action: 'Approve Transfer',
                        icon: Package,
                        color: 'blue'
                    },
                    {
                        id: 2,
                        title: 'Switch Carrier for Route 104',
                        description: 'Current carrier "FastShip" has a 15% delay rate on this route. "SpeedyLogistics" offers 98% on-time delivery for only 2% higher cost.',
                        impact: 'Medium',
                        confidence: 88,
                        action: 'Update Carrier',
                        icon: TrendingUp,
                        color: 'purple'
                    },
                    {
                        id: 3,
                        title: 'Preventative Maintenance for Truck-05',
                        description: 'Telematics data indicates early signs of transmission strain. Scheduling maintenance now will prevent a potential breakdown next week.',
                        impact: 'High',
                        confidence: 92,
                        action: 'Schedule Service',
                        icon: AlertTriangle,
                        color: 'orange'
                    }
                ]);
            }
        } catch (error) {
            console.error("Failed to fetch recommendations:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const generateInsights = async () => {
        try {
            setGenerating(true);
            // Simulate AI processing time
            await new Promise(resolve => setTimeout(resolve, 2000));
            await fetchRecommendations();
        } catch (error) {
            console.error("Generation failed:", error);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-900/80 to-purple-900/80 backdrop-blur-xl rounded-2xl p-8 text-white shadow-xl relative overflow-hidden border border-white/10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                                    <BrainCircuit className="h-6 w-6 text-purple-300" />
                                </div>
                                <span className="text-purple-200 font-medium tracking-wide uppercase text-sm flex items-center gap-2">
                                    <Sparkles className="h-3 w-3" />
                                    Warefy AI Engine
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold mb-2 text-white">AI Recommendations</h1>
                            <p className="text-indigo-200 max-w-2xl">
                                Our neural networks analyze millions of data points to provide actionable insights for your supply chain optimization.
                            </p>
                        </div>
                        <button
                            onClick={generateInsights}
                            disabled={generating}
                            className="px-6 py-3 bg-white text-indigo-900 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg shadow-white/10 flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            <RefreshCw className={`h-5 w-5 ${generating ? 'animate-spin' : ''}`} />
                            {generating ? 'Analyzing...' : 'Refresh Insights'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card rounded-2xl p-6 flex items-center gap-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="p-3 bg-green-500/20 rounded-xl text-green-400 border border-green-500/20 relative z-10">
                        <Zap className="h-6 w-6" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm text-gray-400 font-medium">Optimization Score</p>
                        <h3 className="text-2xl font-bold text-white">94/100</h3>
                    </div>
                </div>
                <div className="glass-card rounded-2xl p-6 flex items-center gap-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400 border border-blue-500/20 relative z-10">
                        <Check className="h-6 w-6" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm text-gray-400 font-medium">Actions Taken</p>
                        <h3 className="text-2xl font-bold text-white">1,245</h3>
                    </div>
                </div>
                <div className="glass-card rounded-2xl p-6 flex items-center gap-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400 border border-purple-500/20 relative z-10">
                        <TrendingUp className="h-6 w-6" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm text-gray-400 font-medium">Cost Savings</p>
                        <h3 className="text-2xl font-bold text-white">$45.2k</h3>
                    </div>
                </div>
            </div>

            {/* Recommendations Feed */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-400" />
                    Priority Actions
                </h2>
                <div className="grid gap-6">
                    {recommendations.map((rec) => (
                        <div key={rec.id} className="glass-panel rounded-2xl p-6 hover:bg-white/5 transition-all group border border-white/10">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Icon Column */}
                                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border ${rec.color === 'blue' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                    rec.color === 'purple' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                        'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                    }`}>
                                    <rec.icon className="h-6 w-6" />
                                </div>

                                {/* Content Column */}
                                <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                                        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                                            {rec.title}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${rec.impact === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                }`}>
                                                {rec.impact} Impact
                                            </span>
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-gray-300 border border-white/10">
                                                {rec.confidence}% Confidence
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-gray-400 mb-4 leading-relaxed">
                                        {rec.description}
                                    </p>

                                    <div className="flex flex-wrap gap-3">
                                        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">
                                            {rec.action} <ArrowRight className="ml-2 h-4 w-4" />
                                        </button>
                                        <button className="px-4 py-2 border border-white/10 text-gray-400 rounded-lg text-sm font-medium hover:bg-white/5 hover:text-white transition-colors">
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
