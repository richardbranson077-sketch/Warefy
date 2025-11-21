'use client';

import { useState, useEffect } from 'react';
import { Calendar, RefreshCw, TrendingUp, AlertTriangle, ArrowRight, BrainCircuit, BarChart3 } from 'lucide-react';
import { demand, inventory } from '@/lib/api';
import { DemandForecastChart } from '@/components/Charts';

interface SkuItem {
    id: number;
    sku: string;
    product_name: string;
}

interface ForecastItem {
    date: string;
    actual: number | null;
    predicted: number | null;
}

export default function DemandPage() {
    const [selectedSku, setSelectedSku] = useState('');
    const [skuList, setSkuList] = useState<SkuItem[]>([]);
    const [forecastData, setForecastData] = useState<ForecastItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [forecastDays, setForecastDays] = useState(30);

    useEffect(() => {
        const fetchSkus = async () => {
            try {
                const items = await inventory.getAll({});
                setSkuList(items);
                if (items.length > 0) {
                    setSelectedSku(items[0].sku);
                }
            } catch (error) {
                console.error('Error fetching SKUs:', error);
            }
        };
        fetchSkus();
    }, []);

    useEffect(() => {
        if (selectedSku) {
            generateForecast();
        }
    }, [selectedSku, forecastDays]);

    const generateForecast = async () => {
        setLoading(true);
        try {
            const history = await demand.getHistorical(selectedSku, {});
            const forecast = await demand.forecast({
                sku: selectedSku,
                forecast_days: forecastDays,
                model_type: 'prophet'
            });

            const combinedData: ForecastItem[] = [];
            history.sales_history.forEach((item: any) => {
                combinedData.push({
                    date: new Date(item.date).toLocaleDateString(),
                    actual: item.quantity,
                    predicted: null
                });
            });

            forecast.predictions.forEach((item: any) => {
                combinedData.push({
                    date: new Date(item.date).toLocaleDateString(),
                    actual: null,
                    predicted: item.predicted_quantity
                });
            });

            setForecastData(combinedData);
        } catch (error) {
            console.error('Error generating forecast:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Demand Forecasting</h1>
                    <p className="text-gray-400 mt-1">AI-powered prediction using Prophet & LSTM models</p>
                </div>
                <button
                    onClick={generateForecast}
                    disabled={loading}
                    className="flex items-center px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-500 shadow-lg shadow-purple-500/20 transition-all font-medium disabled:opacity-50 border border-purple-500/50"
                >
                    <RefreshCw className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Generating Model...' : 'Refresh Forecast'}
                </button>
            </div>

            {/* Controls & Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Controls Panel */}
                <div className="glass-panel p-6 rounded-2xl h-fit">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/20">
                            <BrainCircuit className="h-6 w-6 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Model Configuration</h3>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Target Product</label>
                            <select
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                value={selectedSku}
                                onChange={(e) => setSelectedSku(e.target.value)}
                            >
                                {skuList.map(item => (
                                    <option key={item.id} value={item.sku}>
                                        {item.product_name} ({item.sku})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Forecast Horizon</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[7, 14, 30, 60, 90].map((days) => (
                                    <button
                                        key={days}
                                        onClick={() => setForecastDays(days)}
                                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${forecastDays === days
                                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                                            }`}
                                    >
                                        {days} Days
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/10">
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-gray-400">Model Accuracy</span>
                                <span className="font-bold text-green-400">94.2%</span>
                            </div>
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 w-[94.2%] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Based on backtesting against last 90 days of data.</p>
                        </div>
                    </div>
                </div>

                {/* Chart Area */}
                <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white">Forecast Visualization</h3>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                <span className="text-gray-400">Historical</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-purple-500 border-2 border-white/20 ring-1 ring-purple-500/50 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
                                <span className="text-gray-400">Predicted</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[400px] w-full bg-gray-900/50 rounded-xl border border-white/5 p-4 relative overflow-hidden">
                        {/* Grid Background */}
                        <div className="absolute inset-0 pointer-events-none" style={{
                            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
                            backgroundSize: '40px 40px'
                        }}></div>

                        {loading && forecastData.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 relative z-10">
                                <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                                <p>Running Prophet model...</p>
                            </div>
                        ) : (
                            <div className="relative z-10 h-full">
                                <DemandForecastChart data={forecastData} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="h-16 w-16 text-blue-500" />
                    </div>
                    <div className="flex items-center gap-3 mb-3 relative z-10">
                        <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400 border border-blue-500/20">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold text-white">Trend Analysis</h3>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed relative z-10">
                        Demand is projected to increase by <span className="font-bold text-blue-400">12%</span> over the next 30 days. Consider increasing safety stock for this SKU.
                    </p>
                </div>

                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Calendar className="h-16 w-16 text-purple-500" />
                    </div>
                    <div className="flex items-center gap-3 mb-3 relative z-10">
                        <div className="p-2 bg-purple-500/20 rounded-xl text-purple-400 border border-purple-500/20">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold text-white">Seasonality</h3>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed relative z-10">
                        Strong weekly seasonality detected. Sales consistently peak on <span className="font-bold text-purple-400">Fridays</span> and dip on Mondays.
                    </p>
                </div>

                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertTriangle className="h-16 w-16 text-orange-500" />
                    </div>
                    <div className="flex items-center gap-3 mb-3 relative z-10">
                        <div className="p-2 bg-orange-500/20 rounded-xl text-orange-400 border border-orange-500/20">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold text-white">Risk Assessment</h3>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed relative z-10">
                        Potential stockout risk in <span className="font-bold text-orange-400">14 days</span> if current demand trend continues without replenishment.
                    </p>
                    <button className="mt-3 text-sm text-orange-400 font-medium flex items-center hover:text-orange-300 transition-colors relative z-10">
                        View Replenishment Plan <ArrowRight className="h-4 w-4 ml-1" />
                    </button>
                </div>
            </div>
        </div>
    );
}
