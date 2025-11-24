'use client';

import { useState } from 'react';
import {
    TrendingUp, Calendar, BarChart3, Zap, AlertTriangle,
    ArrowUp, ArrowDown, Minus, Package, DollarSign
} from 'lucide-react';

interface Prediction {
    date: string;
    predicted_demand: number;
    confidence_low: number;
    confidence_high: number;
}

export default function ForecastingPage() {
    const [sku, setSku] = useState('WIDGET-001');
    const [forecastDays, setForecastDays] = useState(30);
    const [model, setModel] = useState('ensemble');
    const [forecast, setForecast] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const generateForecast = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simulated forecast data
        const predictions: Prediction[] = [];
        const baseDate = new Date();

        for (let i = 0; i < forecastDays; i++) {
            const date = new Date(baseDate);
            date.setDate(date.getDate() + i + 1);

            const baseDemand = 45 + Math.sin(i / 7) * 10;
            const trend = i * 0.3;
            const predicted = Math.max(0, baseDemand + trend + (Math.random() - 0.5) * 5);

            predictions.push({
                date: date.toISOString().split('T')[0],
                predicted_demand: Math.round(predicted * 10) / 10,
                confidence_low: Math.round((predicted * 0.85) * 10) / 10,
                confidence_high: Math.round((predicted * 1.15) * 10) / 10
            });
        }

        setForecast({
            sku: sku,
            product_name: 'Premium Widget',
            forecast_period_days: forecastDays,
            model_used: model,
            predictions: predictions,
            total_predicted_demand: Math.round(predictions.reduce((sum, p) => sum + p.predicted_demand, 0)),
            seasonality_detected: true,
            trend: 'increasing',
            confidence_score: 0.85
        });

        setLoading(false);
    };

    const getTrendIcon = (trend: string) => {
        if (trend === 'increasing') return <ArrowUp className="h-5 w-5 text-green-600" />;
        if (trend === 'decreasing') return <ArrowDown className="h-5 w-5 text-red-600" />;
        return <Minus className="h-5 w-5 text-gray-600" />;
    };

    const getTrendColor = (trend: string) => {
        if (trend === 'increasing') return 'text-green-600';
        if (trend === 'decreasing') return 'text-red-600';
        return 'text-gray-600';
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                            <TrendingUp className="h-7 w-7 text-white" />
                        </div>
                        Predictive Demand Forecasting
                    </h1>
                    <p className="text-gray-600 mt-2">ML-powered demand predictions</p>
                </div>
            </div>

            {/* Forecast Configuration */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Forecast Configuration</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                        <input
                            type="text"
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Forecast Days</label>
                        <select
                            value={forecastDays}
                            onChange={(e) => setForecastDays(parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        >
                            <option value="7">7 Days</option>
                            <option value="14">14 Days</option>
                            <option value="30">30 Days</option>
                            <option value="60">60 Days</option>
                            <option value="90">90 Days</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ML Model</label>
                        <select
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        >
                            <option value="ensemble">Ensemble (Best)</option>
                            <option value="lstm">LSTM Neural Network</option>
                            <option value="xgboost">XGBoost</option>
                            <option value="arima">ARIMA</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={generateForecast}
                            disabled={loading}
                            className="w-full px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
                        >
                            {loading ? 'Generating...' : 'Generate Forecast'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Forecast Results */}
            {forecast && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Package className="h-5 w-5 text-purple-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{forecast.total_predicted_demand}</p>
                            <p className="text-sm text-gray-600 mt-1">Total Predicted Demand</p>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <TrendingUp className="h-5 w-5 text-blue-600" />
                                </div>
                                {getTrendIcon(forecast.trend)}
                            </div>
                            <p className={`text-2xl font-bold capitalize ${getTrendColor(forecast.trend)}`}>
                                {forecast.trend}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">Trend Direction</p>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <BarChart3 className="h-5 w-5 text-green-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{(forecast.confidence_score * 100).toFixed(0)}%</p>
                            <p className="text-sm text-gray-600 mt-1">Confidence Score</p>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Calendar className="h-5 w-5 text-orange-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                                {forecast.seasonality_detected ? 'Yes' : 'No'}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">Seasonality Detected</p>
                        </div>
                    </div>

                    {/* Forecast Table */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">
                            {forecast.product_name} - {forecastDays} Day Forecast
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Predicted Demand</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Confidence Range</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {forecast.predictions.slice(0, 14).map((pred: Prediction, idx: number) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-900">{pred.date}</td>
                                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                                {Math.round(pred.predicted_demand)} units
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {Math.round(pred.confidence_low)} - {Math.round(pred.confidence_high)}
                                            </td>
                                            <td className="px-4 py-3">
                                                {pred.predicted_demand > 50 ? (
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                                                        High Demand
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                                        Normal
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {forecast.predictions.length > 14 && (
                            <p className="text-sm text-gray-600 mt-4 text-center">
                                Showing first 14 days of {forecast.predictions.length} day forecast
                            </p>
                        )}
                    </div>

                    {/* Recommendations */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6 mt-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Zap className="h-5 w-5 text-purple-600" />
                            AI Recommendations
                        </h3>
                        <div className="space-y-2">
                            <p className="text-gray-700">
                                • Based on the <span className="font-semibold">{forecast.trend}</span> trend, consider increasing reorder quantities by 15%
                            </p>
                            <p className="text-gray-700">
                                • Seasonality detected - plan for demand spikes during peak periods
                            </p>
                            <p className="text-gray-700">
                                • Recommended safety stock: <span className="font-semibold">{Math.round(forecast.total_predicted_demand * 0.2)} units</span>
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
