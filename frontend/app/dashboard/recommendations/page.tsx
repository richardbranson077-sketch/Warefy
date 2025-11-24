'use client';

import { useState } from 'react';
import { useAIRecommendations } from '@/hooks/useAIRecommendations';
import { LoadingSpinner } from '@/components/LoadingStates';
import { ErrorAlert } from '@/components/ErrorStates';
import { Lightbulb, TrendingUp, Star, RefreshCw } from 'lucide-react';

export default function AIRecommendationsPage() {
    const { data: recommendations, loading, error, refetch } = useAIRecommendations();
    
    const stats = {
        total: recommendations?.length || 0,
        highPriority: recommendations?.filter(r => r.priority === 'high').length || 0,
        implemented: recommendations?.filter(r => r.status === 'implemented').length || 0
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
                                <Lightbulb className="h-8 w-8 text-yellow-400" />
                                AI Recommendations
                            </h1>
                            <p className="text-gray-400 mt-1">Smart optimization suggestions</p>
                        </div>
                        <button onClick={() => refetch()} className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition">
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Total Recommendations</p>
                                <Lightbulb className="h-5 w-5 text-yellow-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">High Priority</p>
                                <Star className="h-5 w-5 text-red-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.highPriority}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Implemented</p>
                                <TrendingUp className="h-5 w-5 text-green-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.implemented}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {recommendations?.length === 0 ? (
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
                                <Lightbulb className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400">No recommendations available</p>
                            </div>
                        ) : (
                            recommendations?.map((rec) => (
                                <div key={rec.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold mb-2">{rec.title}</h3>
                                            <p className="text-gray-400 mb-4">{rec.description}</p>
                                            <div className="flex gap-2">
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    rec.priority === 'high' ? 'bg-red-400/10 text-red-400' :
                                                    rec.priority === 'medium' ? 'bg-yellow-400/10 text-yellow-400' :
                                                    'bg-green-400/10 text-green-400'
                                                }`}>
                                                    {rec.priority}
                                                </span>
                                                <span className="px-2 py-1 bg-blue-400/10 text-blue-400 rounded-full text-xs">
                                                    {rec.category}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
