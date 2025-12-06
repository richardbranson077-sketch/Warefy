'use client';

import { useState, useEffect } from 'react';
import {
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    RefreshCw,
    ArrowRight,
    Zap,
    Box,
    Truck,
    Wrench,
    Shield,
    DollarSign,
    Sparkles
} from 'lucide-react';
import { recommendationsService, Recommendation } from '@/services/recommendations.service';
import { useAICommand } from '@/hooks/useAICommand';

export default function RecommendationsPage() {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    // Removed unused sendMessage
    const { executeCommand } = useAICommand();

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        try {
            const data = await recommendationsService.getAll();
            setRecommendations(data);
        } catch (error) {
            console.error("Failed to fetch recommendations:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const data = await recommendationsService.generate();
            setRecommendations(data);
        } catch (error) {
            console.error("Failed to generate recommendations:", error);
        } finally {
            setGenerating(false);
        }
    };

    const handleAction = async (id: string, action: string, title: string) => {
        try {
            const response = await recommendationsService.executeAction(id, action);

            // Show success message (using simple alert for now, could be toast)
            alert(response.message || `Action '${action}' completed!`);

            // Remove the item from the list to show it's been handled
            setRecommendations(prev => prev.filter(rec => rec.id !== id));

        } catch (error) {
            console.error("Failed to execute action:", error);
            alert("Failed to execute action. Please try again.");
        }
    };

    // Add router for navigation
    const router = require('next/navigation').useRouter();

    const askAI = (rec: Recommendation) => {
        const prompt = `Why did you recommend "${rec.title}"? ${rec.description}`;
        router.push(`/dashboard/ai-command?q=${encodeURIComponent(prompt)}`);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'inventory': return <Box className="h-5 w-5" />;
            case 'logistics': return <Truck className="h-5 w-5" />;
            case 'maintenance': return <Wrench className="h-5 w-5" />;
            case 'safety': return <Shield className="h-5 w-5" />;
            case 'cost': return <DollarSign className="h-5 w-5" />;
            default: return <Sparkles className="h-5 w-5" />;
        }
    };

    const getSeverityStyles = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-50 text-red-700 border-red-200';
            case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
            case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'low': return 'bg-blue-50 text-blue-700 border-blue-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Sparkles className="h-8 w-8 text-violet-600" />
                        AI Insights
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Real-time optimization suggestions powered by Gemini AI
                    </p>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-lg shadow-md transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {generating ? (
                        <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : (
                        <Zap className="h-5 w-5 fill-current" />
                    )}
                    {generating ? 'Analyzing Data...' : 'Generate Insights'}
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-lg text-green-600">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Potential Savings</p>
                            <p className="text-2xl font-bold text-gray-900">$12,450</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                            <CheckCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Optimizations Applied</p>
                            <p className="text-2xl font-bold text-gray-900">24</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Critical Alerts</p>
                            <p className="text-2xl font-bold text-gray-900">3</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommendations Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {recommendations.map((rec) => (
                        <div
                            key={rec.id}
                            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:border-violet-200"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${getSeverityStyles(rec.severity).split(' ')[0]} ${getSeverityStyles(rec.severity).split(' ')[1]}`}>
                                        {getTypeIcon(rec.type)}
                                    </div>
                                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getSeverityStyles(rec.severity)}`}>
                                        {rec.severity}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {new Date(rec.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                {rec.title}
                            </h3>
                            <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                                {rec.description}
                            </p>

                            <div className="flex items-center gap-2 mb-6 text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-100">
                                <TrendingUp className="h-4 w-4" />
                                <span className="font-medium">Impact: {rec.impact}</span>
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => handleAction(rec.id, 'apply', rec.title)}
                                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    Apply Fix
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => askAI(rec)}
                                    className="px-4 py-2 rounded-lg font-medium text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors border border-gray-200"
                                >
                                    Ask AI Why
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
