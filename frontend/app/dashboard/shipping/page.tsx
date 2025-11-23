'use client';

import { useState, useEffect } from 'react';
import {
    Truck, Package, DollarSign, Clock, MapPin, Download,
    Search, Filter, Plus, CheckCircle, AlertCircle, TrendingUp,
    Calendar, BarChart3, Settings, RefreshCw, Zap, Globe
} from 'lucide-react';

interface Address {
    name: string;
    company?: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
    email?: string;
}

interface PackageDetails {
    weight: number;
    length: number;
    width: number;
    height: number;
    insurance_value?: number;
}

interface Rate {
    carrier: string;
    service_type: string;
    cost: number;
    estimated_days: number;
    estimated_delivery?: string;
}

interface Shipment {
    id: number;
    tracking_number: string;
    carrier: string;
    service_type: string;
    status: string;
    cost: number;
    estimated_delivery?: string;
    actual_delivery?: string;
    created_at: string;
}

export default function ShippingPage() {
    const [activeTab, setActiveTab] = useState<'rates' | 'shipments' | 'carriers'>('rates');
    const [rates, setRates] = useState<Rate[]>([]);
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [loading, setLoading] = useState(false);
    const [showRateModal, setShowRateModal] = useState(false);

    // Rate comparison form state
    const [fromAddress, setFromAddress] = useState<Partial<Address>>({
        name: 'Warefy HQ',
        street1: '123 Warehouse St',
        city: 'San Francisco',
        state: 'CA',
        postal_code: '94102',
        country: 'US'
    });

    const [toAddress, setToAddress] = useState<Partial<Address>>({
        name: 'Customer Name',
        street1: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'US'
    });

    const [packageDetails, setPackageDetails] = useState<PackageDetails>({
        weight: 5,
        length: 12,
        width: 10,
        height: 8,
        insurance_value: 0
    });

    const carrierColors: Record<string, string> = {
        fedex: 'from-purple-600 to-purple-700',
        ups: 'from-yellow-600 to-yellow-700',
        usps: 'from-blue-600 to-blue-700',
        dhl: 'from-red-600 to-red-700'
    };

    const carrierLogos: Record<string, string> = {
        fedex: '📦 FedEx',
        ups: '🚚 UPS',
        usps: '✉️ USPS',
        dhl: '✈️ DHL'
    };

    const getRates = async () => {
        setLoading(true);
        try {
            // Simulated API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            const mockRates: Rate[] = [
                { carrier: 'usps', service_type: 'USPS Priority', cost: 9.50, estimated_days: 3 },
                { carrier: 'fedex', service_type: 'FedEx Ground', cost: 12.50, estimated_days: 5 },
                { carrier: 'ups', service_type: 'UPS Ground', cost: 11.75, estimated_days: 5 },
                { carrier: 'usps', service_type: 'USPS Express', cost: 28.00, estimated_days: 1 },
                { carrier: 'fedex', service_type: 'FedEx 2 Day', cost: 25.00, estimated_days: 2 },
                { carrier: 'ups', service_type: 'UPS Next Day', cost: 42.00, estimated_days: 1 },
                { carrier: 'dhl', service_type: 'DHL Express', cost: 55.00, estimated_days: 2 },
            ];

            setRates(mockRates.sort((a, b) => a.cost - b.cost));
        } catch (error) {
            console.error('Error fetching rates:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <Truck className="h-7 w-7 text-white" />
                        </div>
                        Shipping Management
                    </h1>
                    <p className="text-gray-600 mt-2">Multi-carrier shipping with real-time rates</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Settings
                    </button>
                    <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        New Shipment
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-green-600">+12%</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">1,247</p>
                    <p className="text-sm text-gray-600 mt-1">Total Shipments</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-green-600">-8%</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">$12,450</p>
                    <p className="text-sm text-gray-600 mt-1">Shipping Costs</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Clock className="h-5 w-5 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-600">2.5 days</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">96%</p>
                    <p className="text-sm text-gray-600 mt-1">On-Time Delivery</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-orange-600" />
                        </div>
                        <span className="text-sm font-medium text-green-600">+15%</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">$9.85</p>
                    <p className="text-sm text-gray-600 mt-1">Avg Cost/Shipment</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
                <div className="border-b border-gray-200">
                    <div className="flex gap-1 p-2">
                        {[
                            { id: 'rates', label: 'Rate Comparison', icon: BarChart3 },
                            { id: 'shipments', label: 'Shipments', icon: Package },
                            { id: 'carriers', label: 'Carriers', icon: Globe }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition ${activeTab === tab.id
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Rate Comparison Tab */}
                {activeTab === 'rates' && (
                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                            {/* From Address */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-blue-600" />
                                    From Address
                                </h3>
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Street Address"
                                        value={fromAddress.street1}
                                        onChange={(e) => setFromAddress({ ...fromAddress, street1: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            placeholder="City"
                                            value={fromAddress.city}
                                            onChange={(e) => setFromAddress({ ...fromAddress, city: e.target.value })}
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                        <input
                                            type="text"
                                            placeholder="State"
                                            value={fromAddress.state}
                                            onChange={(e) => setFromAddress({ ...fromAddress, state: e.target.value })}
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="ZIP Code"
                                        value={fromAddress.postal_code}
                                        onChange={(e) => setFromAddress({ ...fromAddress, postal_code: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>
                            </div>

                            {/* To Address */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-green-600" />
                                    To Address
                                </h3>
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Street Address"
                                        value={toAddress.street1}
                                        onChange={(e) => setToAddress({ ...toAddress, street1: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            placeholder="City"
                                            value={toAddress.city}
                                            onChange={(e) => setToAddress({ ...toAddress, city: e.target.value })}
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                        <input
                                            type="text"
                                            placeholder="State"
                                            value={toAddress.state}
                                            onChange={(e) => setToAddress({ ...toAddress, state: e.target.value })}
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="ZIP Code"
                                        value={toAddress.postal_code}
                                        onChange={(e) => setToAddress({ ...toAddress, postal_code: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>
                            </div>

                            {/* Package Details */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Package className="h-4 w-4 text-purple-600" />
                                    Package Details
                                </h3>
                                <div className="space-y-2">
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">Weight (lbs)</label>
                                        <input
                                            type="number"
                                            value={packageDetails.weight}
                                            onChange={(e) => setPackageDetails({ ...packageDetails, weight: parseFloat(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="text-xs text-gray-600 mb-1 block">L (in)</label>
                                            <input
                                                type="number"
                                                value={packageDetails.length}
                                                onChange={(e) => setPackageDetails({ ...packageDetails, length: parseFloat(e.target.value) })}
                                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-600 mb-1 block">W (in)</label>
                                            <input
                                                type="number"
                                                value={packageDetails.width}
                                                onChange={(e) => setPackageDetails({ ...packageDetails, width: parseFloat(e.target.value) })}
                                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-600 mb-1 block">H (in)</label>
                                            <input
                                                type="number"
                                                value={packageDetails.height}
                                                onChange={(e) => setPackageDetails({ ...packageDetails, height: parseFloat(e.target.value) })}
                                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={getRates}
                            disabled={loading}
                            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="h-5 w-5 animate-spin" />
                                    Comparing Rates...
                                </>
                            ) : (
                                <>
                                    <Zap className="h-5 w-5" />
                                    Compare Rates from All Carriers
                                </>
                            )}
                        </button>

                        {/* Rates Results */}
                        {rates.length > 0 && (
                            <div className="mt-6 space-y-3">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {rates.length} Shipping Options Available
                                    </h3>
                                    <span className="text-sm text-gray-600">Sorted by price (lowest first)</span>
                                </div>
                                {rates.map((rate, index) => (
                                    <div
                                        key={index}
                                        className="bg-white border-2 border-gray-200 hover:border-blue-400 rounded-xl p-4 transition cursor-pointer group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 bg-gradient-to-r ${carrierColors[rate.carrier]} rounded-lg flex items-center justify-center text-white font-bold text-lg`}>
                                                    {carrierLogos[rate.carrier]?.split(' ')[0]}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{rate.service_type}</h4>
                                                    <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                                                        <Clock className="h-3 w-3" />
                                                        {rate.estimated_days} business {rate.estimated_days === 1 ? 'day' : 'days'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-gray-900">${rate.cost.toFixed(2)}</p>
                                                {index === 0 && (
                                                    <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded mt-1">
                                                        Cheapest
                                                    </span>
                                                )}
                                                {rate.estimated_days === 1 && (
                                                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded mt-1">
                                                        Fastest
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button className="w-full mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition opacity-0 group-hover:opacity-100">
                                            Select & Create Label
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Shipments Tab */}
                {activeTab === 'shipments' && (
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by tracking number, customer, or order..."
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <button className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Filter
                            </button>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-8 text-center">
                            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No shipments yet</h3>
                            <p className="text-gray-600 mb-4">Create your first shipment using the rate comparison tool</p>
                            <button
                                onClick={() => setActiveTab('rates')}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                            >
                                Compare Rates
                            </button>
                        </div>
                    </div>
                )}

                {/* Carriers Tab */}
                {activeTab === 'carriers' && (
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { name: 'FedEx', status: 'active', icon: '📦', color: 'purple' },
                                { name: 'UPS', status: 'active', icon: '🚚', color: 'yellow' },
                                { name: 'USPS', status: 'active', icon: '✉️', color: 'blue' },
                                { name: 'DHL Express', status: 'inactive', icon: '✈️', color: 'red' }
                            ].map((carrier) => (
                                <div key={carrier.name} className="bg-white border border-gray-200 rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="text-3xl">{carrier.icon}</div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{carrier.name}</h3>
                                                <p className="text-sm text-gray-600">
                                                    {carrier.status === 'active' ? (
                                                        <span className="flex items-center gap-1 text-green-600">
                                                            <CheckCircle className="h-3 w-3" />
                                                            Connected
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-gray-400">
                                                            <AlertCircle className="h-3 w-3" />
                                                            Not configured
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition">
                                            {carrier.status === 'active' ? 'Settings' : 'Connect'}
                                        </button>
                                    </div>
                                    {carrier.status === 'active' && (
                                        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
                                            <div>
                                                <p className="text-xs text-gray-600">Shipments</p>
                                                <p className="text-lg font-semibold text-gray-900">342</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Avg Cost</p>
                                                <p className="text-lg font-semibold text-gray-900">$12.50</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">On-Time</p>
                                                <p className="text-lg font-semibold text-gray-900">98%</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
