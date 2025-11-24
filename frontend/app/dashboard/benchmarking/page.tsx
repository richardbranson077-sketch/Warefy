'use client';

import { useState, useEffect } from 'react';
import {
    TrendingUp, Award, Target, BarChart3, Users,
    CheckCircle, AlertCircle, ArrowUp, ArrowDown, Zap
} from 'lucide-react';

interface BenchmarkMetric {
    metric_name: string;
    your_value: number;
    industry_average: number;
    top_quartile: number;
    percentile: number;
    status: string;
}

export default function BenchmarkingPage() {
    const [industry, setIndustry] = useState('ecommerce');
    const [metrics, setMetrics] = useState<BenchmarkMetric[]>([]);
    const [performanceScore, setPerformanceScore] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadBenchmarks();
    }, [industry]);

    const loadBenchmarks = async () => {
        setLoading(true);
        // Simulated data
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockMetrics: BenchmarkMetric[] = [
            { metric_name: 'Order Accuracy', your_value: 98.2, industry_average: 98.5, top_quartile: 99.5, percentile: 60, status: 'good' },
            { metric_name: 'Pick Rate Per Hour', your_value: 135, industry_average: 120, top_quartile: 180, percentile: 70, status: 'good' },
            { metric_name: 'Cost Per Order', your_value: 2.85, industry_average: 3.50, top_quartile: 2.20, percentile: 90, status: 'excellent' },
            { metric_name: 'On Time Shipment', your_value: 96.5, industry_average: 95.0, top_quartile: 98.5, percentile: 70, status: 'good' },
            { metric_name: 'Inventory Turnover', your_value: 9.5, industry_average: 8.0, top_quartile: 12.0, percentile: 70, status: 'good' },
            { metric_name: 'Return Rate', your_value: 18.5, industry_average: 20.0, top_quartile: 12.0, percentile: 60, status: 'good' }
        ];

        setMetrics(mockMetrics);

        setPerformanceScore({
            overall_score: 78,
            category_scores: {
                accuracy: 85,
                efficiency: 82,
                cost: 95,
                reliability: 75,
                inventory: 78,
                quality: 68
            },
            strengths: ['Cost Management', 'Efficiency'],
            improvement_areas: ['Quality', 'Reliability']
        });

        setLoading(false);
    };

    const getStatusColor = (status: string) => {
        if (status === 'excellent') return 'bg-green-100 text-green-700 border-green-300';
        if (status === 'good') return 'bg-blue-100 text-blue-700 border-blue-300';
        return 'bg-orange-100 text-orange-700 border-orange-300';
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-blue-600';
        return 'text-orange-600';
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                            <Target className="h-7 w-7 text-white" />
                        </div>
                        Performance Benchmarking
                    </h1>
                    <p className="text-gray-600 mt-2">Compare against industry standards</p>
                </div>
                <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value="ecommerce">E-commerce</option>
                    <option value="3pl">3PL</option>
                    <option value="retail">Retail</option>
                </select>
            </div>

            {/* Performance Score */}
            {performanceScore && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 mb-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Overall Performance Score</h2>
                            <p className="text-blue-100">Based on 6 key metrics</p>
                        </div>
                        <div className="text-center">
                            <div className="text-6xl font-bold">{performanceScore.overall_score}</div>
                            <div className="text-blue-100">out of 100</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-blue-400">
                        {Object.entries(performanceScore.category_scores).map(([category, score]: [string, any]) => (
                            <div key={category} className="text-center">
                                <div className="text-2xl font-bold">{score}</div>
                                <div className="text-sm text-blue-100 capitalize">{category}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Strengths & Improvements */}
            {performanceScore && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            Your Strengths
                        </h3>
                        <div className="space-y-2">
                            {performanceScore.strengths.map((strength: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-2 text-green-700">
                                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                    {strength}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-orange-600" />
                            Improvement Areas
                        </h3>
                        <div className="space-y-2">
                            {performanceScore.improvement_areas.map((area: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-2 text-orange-700">
                                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                                    {area}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Metrics Comparison */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Industry Benchmark Comparison</h2>
                <div className="space-y-4">
                    {metrics.map((metric, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h4 className="font-semibold text-gray-900">{metric.metric_name}</h4>
                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded border mt-1 ${getStatusColor(metric.status)}`}>
                                        {metric.status.toUpperCase()}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-900">{metric.your_value}</div>
                                    <div className="text-sm text-gray-600">Your Performance</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-200">
                                <div>
                                    <p className="text-xs text-gray-600">Industry Average</p>
                                    <p className="text-lg font-semibold text-gray-900">{metric.industry_average}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Top Quartile</p>
                                    <p className="text-lg font-semibold text-gray-900">{metric.top_quartile}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Your Percentile</p>
                                    <p className={`text-lg font-semibold ${getScoreColor(metric.percentile)}`}>
                                        {metric.percentile}th
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Best Practices */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Zap className="h-6 w-6 text-yellow-600" />
                    Recommended Best Practices
                </h2>
                <div className="space-y-3">
                    {[
                        'Implement barcode scanning to improve order accuracy to 99%+',
                        'Optimize warehouse layout using ABC analysis to increase pick rate by 20%',
                        'Analyze return reasons and implement quality control measures'
                    ].map((practice, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                            <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                {idx + 1}
                            </div>
                            <p className="text-gray-700">{practice}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
