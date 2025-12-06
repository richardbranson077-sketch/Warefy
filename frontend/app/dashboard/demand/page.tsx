'use client';

import { useState, useEffect } from 'react';
import {
    TrendingUp,
    Sparkles,
    Calendar,
    BarChart3,
    AlertTriangle,
    CheckCircle,
    RefreshCw,
    Zap,
    Target,
    Package,
    Download,
    Sliders,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import {
    ComposedChart,
    Line,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { demandService, ForecastResult } from '@/services/demand.service';

interface Product {
    sku: string;
    name: string;
    category: string;
    current_stock: number;
    sales_count: number;
}

export default function DemandForecastingPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedSku, setSelectedSku] = useState<string>('');
    const [forecast, setForecast] = useState<ForecastResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [forecasting, setForecasting] = useState(false);
    const [forecastDays, setForecastDays] = useState(30);

    // Scenario State
    const [promotionActive, setPromotionActive] = useState(false);
    const [priceChange, setPriceChange] = useState(0);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await demandService.getProducts();
            setProducts(data);
            if (data.length > 0) {
                setSelectedSku(data[0].sku);
                generateForecast(data[0].sku, forecastDays);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateForecast = async (sku: string, days: number) => {
        setForecasting(true);
        try {
            const data = await demandService.getForecast(sku, {
                days,
                scenario: {
                    promotion: promotionActive,
                    price_change: priceChange
                }
            });
            setForecast(data);
        } catch (error) {
            console.error('Failed to generate forecast:', error);
        } finally {
            setForecasting(false);
        }
    };

    const handleProductChange = (sku: string) => {
        setSelectedSku(sku);
        generateForecast(sku, forecastDays);
    };

    const handleDaysChange = (days: number) => {
        setForecastDays(days);
        if (selectedSku) {
            generateForecast(selectedSku, days);
        }
    };

    const handleExport = () => {
        if (!forecast) return;

        const headers = ['Date', 'Predicted Demand', 'Confidence Low', 'Confidence High'];
        const rows = forecast.predictions.map(p => [
            p.date,
            p.quantity,
            p.confidence_low,
            p.confidence_high
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `forecast_${selectedSku}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const selectedProduct = products.find(p => p.sku === selectedSku);

    const getTrendIcon = (trend: string) => {
        if (trend === 'increasing') return <TrendingUp className="h-5 w-5 text-green-600" />;
        if (trend === 'decreasing') return <TrendingUp className="h-5 w-5 text-red-600 rotate-180" />;
        return <TrendingUp className="h-5 w-5 text-gray-600 rotate-90" />;
    };

    const getTrendColor = (trend: string) => {
        switch (trend) {
            case 'increasing': return 'text-green-600 bg-green-50 border-green-200';
            case 'decreasing': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <TrendingUp className="h-8 w-8 text-purple-600" />
                        Demand Forecasting
                    </h1>
                    <p className="text-gray-600 mt-1">
                        AI-powered demand predictions with scenario analysis
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        disabled={!forecast || forecasting}
                        className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        <Download className="h-4 w-4" />
                        Export CSV
                    </button>
                    <button
                        onClick={() => selectedSku && generateForecast(selectedSku, forecastDays)}
                        disabled={forecasting}
                        className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg shadow-md transition-all flex items-center gap-2 disabled:opacity-70"
                    >
                        {forecasting ? (
                            <RefreshCw className="h-5 w-5 animate-spin" />
                        ) : (
                            <Sparkles className="h-5 w-5" />
                        )}
                        {forecasting ? 'Analyzing...' : 'Regenerate Forecast'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Controls & Scenario Analysis */}
                <div className="space-y-6">
                    {/* Product & Period Selection */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Target className="h-5 w-5 text-purple-600" />
                            Configuration
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Product
                                </label>
                                <select
                                    value={selectedSku}
                                    onChange={(e) => handleProductChange(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                >
                                    {products.map((product) => (
                                        <option key={product.sku} value={product.sku}>
                                            {product.name} ({product.sku})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Forecast Period
                                </label>
                                <select
                                    value={forecastDays}
                                    onChange={(e) => handleDaysChange(Number(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                >
                                    <option value={7}>7 Days</option>
                                    <option value={14}>14 Days</option>
                                    <option value={30}>30 Days</option>
                                    <option value={60}>60 Days</option>
                                    <option value={90}>90 Days</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Scenario Analysis Panel */}
                    <div className="bg-white rounded-xl border border-purple-200 p-6 shadow-sm bg-gradient-to-br from-white to-purple-50">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Sliders className="h-5 w-5 text-purple-600" />
                            Scenario Analysis
                        </h3>

                        <div className="space-y-6">
                            {/* Promotion Toggle */}
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${promotionActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                        <Zap className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Run Promotion</p>
                                        <p className="text-xs text-gray-500">Simulate marketing campaign</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={promotionActive}
                                        onChange={(e) => setPromotionActive(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>

                            {/* Price Change Slider */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-700">Price Adjustment</label>
                                    <span className={`text-sm font-bold ${priceChange > 0 ? 'text-green-600' : priceChange < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                        {priceChange > 0 ? '+' : ''}{priceChange}%
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="-50"
                                    max="50"
                                    step="5"
                                    value={priceChange}
                                    onChange={(e) => setPriceChange(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>-50%</span>
                                    <span>0%</span>
                                    <span>+50%</span>
                                </div>
                            </div>

                            <button
                                onClick={() => selectedSku && generateForecast(selectedSku, forecastDays)}
                                className="w-full py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium rounded-lg transition-colors text-sm"
                            >
                                Apply Scenario
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Charts & Insights */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stats Grid */}
                    {forecast && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <p className="text-xs text-gray-500 uppercase">Accuracy (MAPE)</p>
                                <p className="text-xl font-bold text-gray-900 mt-1">
                                    {forecast.mape ? `${forecast.mape}%` : 'N/A'}
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <p className="text-xs text-gray-500 uppercase">Seasonality</p>
                                <p className="text-xl font-bold text-gray-900 mt-1">
                                    {forecast.seasonality_score ? `${forecast.seasonality_score}/100` : 'N/A'}
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <p className="text-xs text-gray-500 uppercase">Trend</p>
                                <div className="flex items-center gap-2 mt-1">
                                    {getTrendIcon(forecast.trend || 'stable')}
                                    <span className="text-lg font-bold capitalize">{forecast.trend}</span>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <p className="text-xs text-gray-500 uppercase">Avg Demand</p>
                                <p className="text-xl font-bold text-gray-900 mt-1">
                                    {Math.round(forecast.predictions.reduce((sum, p) => sum + p.quantity, 0) / forecast.predictions.length)}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Main Chart */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <BarChart3 className="h-6 w-6 text-purple-600" />
                            Forecast Visualization
                        </h2>

                        {forecasting ? (
                            <div className="flex items-center justify-center h-96">
                                <div className="text-center">
                                    <RefreshCw className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
                                    <p className="text-gray-600">Generating AI forecast...</p>
                                </div>
                            </div>
                        ) : forecast ? (
                            <div className="h-96 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={forecast.predictions}>
                                        <defs>
                                            <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            stroke="#9ca3af"
                                            fontSize={12}
                                        />
                                        <YAxis stroke="#9ca3af" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            labelFormatter={(date) => new Date(date).toLocaleDateString()}
                                        />
                                        <Legend />

                                        {/* Confidence Interval Area */}
                                        <Area
                                            type="monotone"
                                            dataKey="confidence_high"
                                            stroke="none"
                                            fill="url(#colorConfidence)"
                                            name="Confidence Range"
                                        />

                                        {/* Main Forecast Line */}
                                        <Line
                                            type="monotone"
                                            dataKey="quantity"
                                            stroke="#7c3aed"
                                            strokeWidth={3}
                                            dot={{ r: 4, fill: '#7c3aed' }}
                                            activeDot={{ r: 6 }}
                                            name="Predicted Demand"
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-96 text-gray-500">
                                Select a product to view forecast
                            </div>
                        )}
                    </div>

                    {/* AI Insights Panel */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-purple-600" />
                            AI Insights
                        </h2>

                        {forecast?.insights ? (
                            <div className="space-y-6">
                                {/* Seasonality */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Seasonality Analysis
                                    </h3>
                                    <p className="text-sm text-gray-600 leading-relaxed bg-blue-50 p-3 rounded-lg border border-blue-100">
                                        {forecast.insights.seasonality}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Risks */}
                                    {forecast.insights.risks && forecast.insights.risks.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                                                Risk Alerts
                                            </h3>
                                            <ul className="space-y-2">
                                                {forecast.insights.risks.map((risk, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-sm text-orange-700 bg-orange-50 p-2 rounded-lg border border-orange-100">
                                                        <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                                        {risk}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Recommendations */}
                                    {forecast.insights.recommendations && forecast.insights.recommendations.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                Recommendations
                                            </h3>
                                            <ul className="space-y-2">
                                                {forecast.insights.recommendations.map((rec, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-sm text-green-700 bg-green-50 p-2 rounded-lg border border-green-100">
                                                        <Zap className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                                        {rec}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p>AI insights will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
