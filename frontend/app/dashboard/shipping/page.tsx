'use client';

import { useState, useEffect } from 'react';
import {
    Truck, Package, MapPin, Clock, CheckCircle, AlertCircle,
    Search, Filter, Plus, Eye, RefreshCw, Box, Shield,
    TrendingUp, DollarSign, BarChart2, Zap
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { shippingService, Shipment, ShippingAnalytics, ShipmentRate, SmartPackaging, ETAPrediction, RiskAssessment } from '@/services/shipping.service';
import dynamic from 'next/dynamic';

const LiveMap = dynamic(() => import('@/components/LiveMap'), { ssr: false });

// Components
const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
            {trend && (
                <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend > 0 ? '+' : ''}{trend}%
                </span>
            )}
        </div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
);

export default function ShippingPage() {
    // State
    const [activeTab, setActiveTab] = useState<'overview' | 'shipments' | 'analytics'>('overview');
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [analytics, setAnalytics] = useState<ShippingAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Wizard State
    const [wizardStep, setWizardStep] = useState(1);
    const [wizardData, setWizardData] = useState({
        from: { name: '', street1: '', city: '', state: '', postal_code: '', country: 'US' },
        to: { name: '', street1: '', city: '', state: '', postal_code: '', country: 'US' },
        package: { weight: 0, length: 0, width: 0, height: 0, contents: '' },
        selectedRate: null as ShipmentRate | null
    });
    const [rates, setRates] = useState<ShipmentRate[]>([]);
    const [smartPackaging, setSmartPackaging] = useState<SmartPackaging | null>(null);
    const [etaPrediction, setEtaPrediction] = useState<ETAPrediction | null>(null);
    const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
    const [aiLoading, setAiLoading] = useState(false);

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const [shipmentsData, analyticsData] = await Promise.all([
                shippingService.getAll(),
                shippingService.getAnalytics()
            ]);
            setShipments(shipmentsData);
            setAnalytics(analyticsData);
        } catch (error) {
            console.error("Failed to fetch shipping data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Wizard Handlers
    const handleGetSmartPackaging = async () => {
        setAiLoading(true);
        try {
            const result = await shippingService.getSmartPackaging([{ ...wizardData.package }]);
            setSmartPackaging(result);
            // Auto-fill dimensions if user accepts
            if (result.recommended_box) {
                // Parse dimensions from string (mock logic for demo)
                // In real app, parse "12x12x12"
            }
        } catch (error) {
            console.error("AI Error:", error);
        } finally {
            setAiLoading(false);
        }
    };

    const handleGetRates = async () => {
        setAiLoading(true);
        try {
            const ratesData = await shippingService.getRates({
                from_address: wizardData.from,
                to_address: wizardData.to,
                package: wizardData.package
            });
            setRates(ratesData);

            // Get Risk Assessment in parallel
            const riskData = await shippingService.getRiskAssessment({
                origin_zip: wizardData.from.postal_code,
                destination_zip: wizardData.to.postal_code
            });
            setRiskAssessment(riskData);

            setWizardStep(2);
        } catch (error) {
            console.error("Failed to get rates:", error);
        } finally {
            setAiLoading(false);
        }
    };

    const handleSelectRate = async (rate: ShipmentRate) => {
        setWizardData({ ...wizardData, selectedRate: rate });
        setAiLoading(true);
        try {
            const eta = await shippingService.predictETA({
                origin_zip: wizardData.from.postal_code,
                destination_zip: wizardData.to.postal_code,
                carrier: rate.carrier,
                service_level: rate.service_type
            });
            setEtaPrediction(eta);
            setWizardStep(3);
        } catch (error) {
            console.error("AI Error:", error);
        } finally {
            setAiLoading(false);
        }
    };

    const handleCreateShipment = async () => {
        setAiLoading(true);
        try {
            if (!wizardData.selectedRate) return;

            await shippingService.createShipment({
                order_id: 0, // Mock ID
                carrier: wizardData.selectedRate.carrier,
                service_type: wizardData.selectedRate.service_type,
                from_address: wizardData.from,
                to_address: wizardData.to,
                package: wizardData.package
            });

            setIsCreateModalOpen(false);
            setWizardStep(1);
            setWizardData({
                from: { name: '', street1: '', city: '', state: '', postal_code: '', country: 'US' },
                to: { name: '', street1: '', city: '', state: '', postal_code: '', country: 'US' },
                package: { weight: 0, length: 0, width: 0, height: 0, contents: '' },
                selectedRate: null
            });
            fetchData();
        } catch (error) {
            console.error("Failed to create shipment:", error);
        } finally {
            setAiLoading(false);
        }
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Shipping Command Center</h1>
                    <p className="text-gray-500 mt-1">AI-powered logistics optimization and tracking</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchData} className="p-2 text-gray-600 hover:bg-white rounded-lg border border-gray-200 transition-colors">
                        <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                    >
                        <Plus className="h-5 w-5" />
                        New Shipment
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Active Shipments"
                    value={shipments.filter(s => s.status === 'in_transit').length}
                    icon={Truck}
                    color="bg-blue-500"
                />
                <StatCard
                    title="On-Time Delivery"
                    value={`${analytics?.on_time_performance || 0}%`}
                    icon={CheckCircle}
                    color="bg-green-500"
                    trend={2.5}
                />
                <StatCard
                    title="Avg Cost / Shipment"
                    value={`$${analytics?.avg_cost_per_shipment || 0}`}
                    icon={DollarSign}
                    color="bg-purple-500"
                    trend={-1.2}
                />
                <StatCard
                    title="Pending Issues"
                    value={shipments.filter(s => s.status === 'exception').length}
                    icon={AlertCircle}
                    color="bg-red-500"
                />
            </div>

            {/* Main Content Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-100">
                    <nav className="flex gap-6 px-6">
                        {['overview', 'shipments', 'analytics'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`py-4 px-2 border-b-2 font-medium text-sm capitalize transition-colors ${activeTab === tab
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {/* Recent Activity & Map Placeholder */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 bg-gray-50 rounded-xl border border-gray-100 h-96 overflow-hidden relative">
                                    {shipments.find(s => s.status === 'in_transit' || s.status === 'pending') ? (
                                        (() => {
                                            const activeShipment = shipments.find(s => s.status === 'in_transit') || shipments[0];
                                            if (activeShipment && activeShipment.origin_coords && activeShipment.destination_coords && activeShipment.current_location) {
                                                return (
                                                    <LiveMap
                                                        origin={{
                                                            ...activeShipment.origin_coords,
                                                            address: activeShipment.origin || 'Origin'
                                                        }}
                                                        destination={{
                                                            ...activeShipment.destination_coords,
                                                            address: activeShipment.destination || 'Destination'
                                                        }}
                                                        currentLocation={{
                                                            ...activeShipment.current_location,
                                                            speed_kmh: activeShipment.current_location.speed_kmh || 0
                                                        }}
                                                    />
                                                );
                                            }
                                            return (
                                                <div className="flex items-center justify-center h-full">
                                                    <div className="text-center text-gray-400">
                                                        <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                        <p>No location data available for active shipment</p>
                                                    </div>
                                                </div>
                                            );
                                        })()
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="text-center text-gray-400">
                                                <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <p>Live Shipment Map Visualization</p>
                                                <p className="text-sm">No active shipments to track</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-900">Recent Updates</h3>
                                    {shipments.slice(0, 5).map(shipment => (
                                        <div key={shipment.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className={`p-2 rounded-full ${shipment.status === 'delivered' ? 'bg-green-100 text-green-600' :
                                                shipment.status === 'in_transit' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'
                                                }`}>
                                                <Package className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{shipment.tracking_number}</p>
                                                <p className="text-xs text-gray-500 capitalize">{shipment.status} • {shipment.carrier}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'analytics' && analytics && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white p-4 rounded-xl border border-gray-100">
                                <h3 className="font-semibold text-gray-900 mb-6">Shipping Cost Trend</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={analytics.cost_trend}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} prefix="$" />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Line type="monotone" dataKey="cost" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-gray-100">
                                <h3 className="font-semibold text-gray-900 mb-6">Carrier Distribution</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={analytics.carrier_distribution}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {analytics.carrier_distribution?.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Shipment Modal (Wizard) */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Create New Shipment</h2>
                                <p className="text-sm text-gray-500">Step {wizardStep} of 3</p>
                            </div>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>

                        <div className="p-8">
                            {/* Step 1: Details */}
                            {wizardStep === 1 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-blue-500" /> Origin
                                            </h3>
                                            <input
                                                className="w-full p-2 border rounded-lg"
                                                placeholder="Name"
                                                value={wizardData.from.name}
                                                onChange={e => setWizardData({ ...wizardData, from: { ...wizardData.from, name: e.target.value } })}
                                            />
                                            <input
                                                className="w-full p-2 border rounded-lg"
                                                placeholder="Street"
                                                value={wizardData.from.street1}
                                                onChange={e => setWizardData({ ...wizardData, from: { ...wizardData.from, street1: e.target.value } })}
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    className="w-full p-2 border rounded-lg"
                                                    placeholder="City"
                                                    value={wizardData.from.city}
                                                    onChange={e => setWizardData({ ...wizardData, from: { ...wizardData.from, city: e.target.value } })}
                                                />
                                                <input
                                                    className="w-full p-2 border rounded-lg"
                                                    placeholder="Zip"
                                                    value={wizardData.from.postal_code}
                                                    onChange={e => setWizardData({ ...wizardData, from: { ...wizardData.from, postal_code: e.target.value } })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-green-500" /> Destination
                                            </h3>
                                            <input
                                                className="w-full p-2 border rounded-lg"
                                                placeholder="Name"
                                                value={wizardData.to.name}
                                                onChange={e => setWizardData({ ...wizardData, to: { ...wizardData.to, name: e.target.value } })}
                                            />
                                            <input
                                                className="w-full p-2 border rounded-lg"
                                                placeholder="Street"
                                                value={wizardData.to.street1}
                                                onChange={e => setWizardData({ ...wizardData, to: { ...wizardData.to, street1: e.target.value } })}
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    className="w-full p-2 border rounded-lg"
                                                    placeholder="City"
                                                    value={wizardData.to.city}
                                                    onChange={e => setWizardData({ ...wizardData, to: { ...wizardData.to, city: e.target.value } })}
                                                />
                                                <input
                                                    className="w-full p-2 border rounded-lg"
                                                    placeholder="Zip"
                                                    value={wizardData.to.postal_code}
                                                    onChange={e => setWizardData({ ...wizardData, to: { ...wizardData.to, postal_code: e.target.value } })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t pt-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                                <Box className="h-4 w-4 text-purple-500" /> Package Details
                                            </h3>
                                            <button
                                                onClick={handleGetSmartPackaging}
                                                disabled={aiLoading}
                                                className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                                            >
                                                <Zap className="h-3 w-3" /> AI Smart Packaging
                                            </button>
                                        </div>

                                        {smartPackaging && (
                                            <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-100 flex items-start gap-3">
                                                <Zap className="h-5 w-5 text-purple-600 mt-1" />
                                                <div>
                                                    <p className="text-sm font-medium text-purple-900">AI Recommendation</p>
                                                    <p className="text-sm text-purple-700">Use <strong>{smartPackaging.recommended_box}</strong> with {smartPackaging.fill_material}.</p>
                                                    <p className="text-xs text-purple-600 mt-1">Potential Savings: {smartPackaging.savings_potential}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-4 gap-4">
                                            <input
                                                type="number"
                                                className="p-2 border rounded-lg"
                                                placeholder="Weight (lbs)"
                                                value={wizardData.package.weight || ''}
                                                onChange={e => setWizardData({ ...wizardData, package: { ...wizardData.package, weight: parseFloat(e.target.value) } })}
                                            />
                                            <input
                                                type="number"
                                                className="p-2 border rounded-lg"
                                                placeholder="Length (in)"
                                                value={wizardData.package.length || ''}
                                                onChange={e => setWizardData({ ...wizardData, package: { ...wizardData.package, length: parseFloat(e.target.value) } })}
                                            />
                                            <input
                                                type="number"
                                                className="p-2 border rounded-lg"
                                                placeholder="Width (in)"
                                                value={wizardData.package.width || ''}
                                                onChange={e => setWizardData({ ...wizardData, package: { ...wizardData.package, width: parseFloat(e.target.value) } })}
                                            />
                                            <input
                                                type="number"
                                                className="p-2 border rounded-lg"
                                                placeholder="Height (in)"
                                                value={wizardData.package.height || ''}
                                                onChange={e => setWizardData({ ...wizardData, package: { ...wizardData.package, height: parseFloat(e.target.value) } })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Rates */}
                            {wizardStep === 2 && (
                                <div className="space-y-6">
                                    {riskAssessment && (
                                        <div className={`p-4 rounded-lg border flex items-start gap-3 ${riskAssessment.risk_score > 0.5 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'
                                            }`}>
                                            <Shield className={`h-5 w-5 mt-1 ${riskAssessment.risk_score > 0.5 ? 'text-red-600' : 'text-green-600'
                                                }`} />
                                            <div>
                                                <p className="font-medium text-gray-900">Route Risk Assessment</p>
                                                <p className="text-sm text-gray-600">{riskAssessment.recommendation}</p>
                                                {riskAssessment.alerts?.map((alert, i) => (
                                                    <div key={i} className="text-xs mt-1 flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" /> {alert.message}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-4">
                                        {rates.map((rate, index) => (
                                            <div
                                                key={index}
                                                onClick={() => handleSelectRate(rate)}
                                                className="p-4 border rounded-xl hover:border-blue-500 hover:shadow-md cursor-pointer transition-all flex justify-between items-center group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-600">
                                                        {rate.carrier.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{rate.carrier} {rate.service_type}</p>
                                                        <p className="text-sm text-gray-500">{rate.estimated_days} Days • Reliability: {(rate.reliability_score * 100).toFixed(0)}%</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-bold text-gray-900">${rate.cost.toFixed(2)}</p>
                                                    <span className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">Select Rate &rarr;</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Confirm */}
                            {wizardStep === 3 && wizardData.selectedRate && (
                                <div className="space-y-6 text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="h-8 w-8 text-green-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900">Ready to Ship?</h3>

                                    {etaPrediction && (
                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 max-w-md mx-auto text-left">
                                            <p className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                                                <Clock className="h-4 w-4" /> AI ETA Prediction
                                            </p>
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-2xl font-bold text-blue-700">{etaPrediction.predicted_days} Days</p>
                                                    <p className="text-xs text-blue-600">Confidence: {(etaPrediction.confidence_score * 100).toFixed(0)}%</p>
                                                </div>
                                                <div className="text-right text-xs text-blue-600">
                                                    {etaPrediction.factors?.map((f, i) => (
                                                        <p key={i}>• {f}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4 text-left max-w-lg mx-auto bg-gray-50 p-6 rounded-xl">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">From</p>
                                            <p className="font-medium">{wizardData.from.name}</p>
                                            <p className="text-sm text-gray-600">{wizardData.from.city}, {wizardData.from.state}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">To</p>
                                            <p className="font-medium">{wizardData.to.name}</p>
                                            <p className="text-sm text-gray-600">{wizardData.to.city}, {wizardData.to.state}</p>
                                        </div>
                                        <div className="col-span-2 border-t pt-4 mt-2">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium text-gray-900">Total Cost</span>
                                                <span className="text-xl font-bold text-gray-900">${wizardData.selectedRate.cost.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-between bg-gray-50 rounded-b-2xl">
                            {wizardStep > 1 && (
                                <button
                                    onClick={() => setWizardStep(wizardStep - 1)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Back
                                </button>
                            )}
                            <div className="ml-auto">
                                {wizardStep === 1 && (
                                    <button
                                        onClick={handleGetRates}
                                        disabled={aiLoading}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2"
                                    >
                                        {aiLoading ? 'Analyzing...' : 'Get Rates'} <TrendingUp className="h-4 w-4" />
                                    </button>
                                )}
                                {wizardStep === 3 && (
                                    <button
                                        onClick={handleCreateShipment}
                                        disabled={aiLoading}
                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-200 flex items-center gap-2"
                                    >
                                        {aiLoading ? 'Processing...' : 'Confirm Shipment'} <Truck className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
