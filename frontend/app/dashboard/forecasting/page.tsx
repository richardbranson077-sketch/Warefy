'use client';

import { useState, useEffect } from 'react';
import {
    TrendingUp,
    BarChart3,
    Calendar,
    RefreshCw,
    Brain,
    Zap,
    AlertTriangle,
    Settings,
    Download
} from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';
import { demandService, ForecastResult } from '@/services/demand.service';

export default function ForecastingPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [selectedSKU, setSelectedSKU] = useState<string>('');
    const [forecastDays, setForecastDays] = useState<number>(30);
    const [selectedModel, setSelectedModel] = useState<'gemini' | 'prophet' | 'lstm'>('gemini');
    const [scenario, setScenario] = useState({ promotion: false, price_change: 0 });
    const [forecast, setForecast] = useState<ForecastResult | null>(null);
    const [historical, setHistorical] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await demandService.getProducts();
            setProducts(data);
            if (data.length > 0) {
                setSelectedSKU(data[0].sku);
            }
        } catch (err) {
            console.error('Failed to load products:', err);
        }
    };

    const generateForecast = async () => {
        if (!selectedSKU) return;

        setLoading(true);
        setError('');

        try {
            // Load historical data
            const hist = await demandService.getHistorical(selectedSKU);
            setHistorical(hist);

            // Generate forecast
            const result = await demandService.getForecast(selectedSKU, {
                days: forecastDays,
                model: selectedModel,
                scenario: scenario.promotion || scenario.price_change !== 0 ? scenario : undefined
            });

            setForecast(result);
        } catch (err: any) {
            setError(err.message || 'Failed to generate forecast');
        } finally {
            setLoading(false);
        }
    };

    const chartData = () => {
        if (!forecast || !historical) return [];

        const historicalData = historical.sales_history.slice(-30).map((item: any) => ({
            date: item.date,
            actual: item.quantity,
            type: 'historical'
        }));

        const forecastData = forecast.predictions.map((item: any) => ({
            date: item.date,
            predicted: item.quantity,
            lower: item.confidence_low,
            upper: item.confidence_high,
            type: 'forecast'
        }));

        return [...historicalData, ...forecastData];
    };

    const exportCSV = () => {
        if (!forecast) return;

        const headers = ['Date', 'Predicted Quantity', 'Confidence Low', 'Confidence High'];
        const rows = forecast.predictions.map(p => [
            p.date,
            p.quantity,
            p.confidence_low || '',
            p.confidence_high || ''
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `forecast_${selectedSKU}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <TrendingUp className="h-8 w-8 text-purple-600" />
                        ML Demand Forecasting
                    </h1>
                    <p className="text-gray-600 mt-1">AI-powered predictions using Gemini, Prophet, and LSTM</p>
                </div>
                <button
                    onClick={exportCSV}
                    disabled={!forecast}
                    className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                    <Download className="h-4 w-4" />
                    Export CSV
                </button>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {/* Product Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                        <select
                            value={selectedSKU}
                            onChange={(e) => setSelectedSKU(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            {products.map(p => (
                                <option key={p.sku} value={p.sku}>{p.name} ({p.sku})</option>
                            ))}
                        </select>
                    </div>

                    {/* Model Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Brain className="inline h-4 w-4 mr-1" />
                            Model
                        </label>
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value as any)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="gemini">Gemini AI</option>
                            <option value="prophet">Prophet (Facebook)</option>
                            <option value="lstm">LSTM Neural Network</option>
                        </select>
                    </div>

                    {/* Forecast Days */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Forecast Days</label>
                        <input
                            type="number"
                            value={forecastDays}
                            onChange={(e) => setForecastDays(parseInt(e.target.value))}
                            min={7}
                            max={90}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    {/* Generate Button */}
                    <div className="flex items-end">
                        <button
                            onClick={generateForecast}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                        >
                            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                            Generate Forecast
                        </button>
                    </div>
                </div>

                {/* Scenario Controls */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Settings className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Scenario Analysis</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="promotion"
                                checked={scenario.promotion}
                                onChange={(e) => setScenario({ ...scenario, promotion: e.target.checked })}
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label htmlFor="promotion" className="ml-2 text-sm text-gray-700">
                                Promotion Active (+30% demand)
                            </label>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">
                                Price Change: {scenario.price_change > 0 ? '+' : ''}{scenario.price_change}%
                            </label>
                            <input
                                type="range"
                                min="-50"
                                max="50"
                                value={scenario.price_change}
                                onChange={(e) => setScenario({ ...scenario, price_change: parseInt(e.target.value) })}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Metrics Cards */}
            {forecast && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-500">Model</p>
                            <Brain className="h-5 w-5 text-purple-400" />
                        </div>
                        <p className="text-2xl font-bold capitalize">{forecast.model}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-500">Accuracy</p>
                            <TrendingUp className="h-5 w-5 text-green-400" />
                        </div>
                        <p className="text-2xl font-bold">{forecast.accuracy_estimate}%</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-500">Trend</p>
                            <BarChart3 className="h-5 w-5 text-blue-400" />
                        </div>
                        <p className="text-2xl font-bold capitalize">{forecast.trend}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-500">MAPE</p>
                            <Calendar className="h-5 w-5 text-orange-400" />
                        </div>
                        <p className="text-2xl font-bold">{forecast.mape?.toFixed(1)}%</p>
                    </div>
                </div>
            )}

            {/* Chart */}
            {forecast && historical && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Historical vs Forecast</h3>
                    <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="actual"
                                    stroke="#8884d8"
                                    fill="#8884d8"
                                    fillOpacity={0.6}
                                    name="Historical"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="predicted"
                                    stroke="#82ca9d"
                                    fill="#82ca9d"
                                    fillOpacity={0.6}
                                    name="Forecast"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="upper"
                                    stroke="#ffc658"
                                    fill="none"
                                    strokeDasharray="5 5"
                                    name="Upper Bound"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="lower"
                                    stroke="#ff8042"
                                    fill="none"
                                    strokeDasharray="5 5"
                                    name="Lower Bound"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* AI Insights */}
            {forecast?.insights && (
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                        <Brain className="h-5 w-5 mr-2" />
                        AI Insights
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-sm font-bold text-purple-800 uppercase tracking-wider mb-3 flex items-center">
                                <Zap className="h-4 w-4 mr-2" />
                                Seasonality
                            </h4>
                            <p className="text-purple-700 text-sm">{forecast.insights.seasonality}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-purple-800 uppercase tracking-wider mb-3 flex items-center">
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Risks
                            </h4>
                            <ul className="space-y-2">
                                {forecast.insights.risks.map((risk, idx) => (
                                    <li key={idx} className="flex items-start text-purple-700 text-sm">
                                        <span className="mr-2">•</span>
                                        {risk}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="md:col-span-2">
                            <h4 className="text-sm font-bold text-purple-800 uppercase tracking-wider mb-3 flex items-center">
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Recommendations
                            </h4>
                            <ul className="space-y-2">
                                {forecast.insights.recommendations.map((rec, idx) => (
                                    <li key={idx} className="flex items-start text-purple-700 text-sm">
                                        <span className="mr-2">•</span>
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
