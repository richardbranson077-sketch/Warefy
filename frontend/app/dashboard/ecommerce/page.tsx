'use client';

import { useState } from 'react';
import {
    ShoppingBag, CheckCircle, XCircle, RefreshCw, Settings,
    TrendingUp, Package, DollarSign, Globe, Zap, Download, Upload
} from 'lucide-react';

export default function EcommercePage() {
    const [syncing, setSyncing] = useState(false);

    const platforms = [
        {
            id: 'shopify',
            name: 'Shopify',
            icon: '🛍️',
            color: 'from-green-600 to-emerald-600',
            connected: true,
            orders: 342,
            revenue: 45680,
            lastSync: '5 min ago'
        },
        {
            id: 'woocommerce',
            name: 'WooCommerce',
            icon: '🛒',
            color: 'from-purple-600 to-pink-600',
            connected: true,
            orders: 128,
            revenue: 18900,
            lastSync: '10 min ago'
        },
        {
            id: 'amazon',
            name: 'Amazon',
            icon: '📦',
            color: 'from-orange-600 to-yellow-600',
            connected: false,
            orders: 0,
            revenue: 0,
            lastSync: null
        },
        {
            id: 'ebay',
            name: 'eBay',
            icon: '🏷️',
            color: 'from-blue-600 to-cyan-600',
            connected: false,
            orders: 0,
            revenue: 0,
            lastSync: null
        }
    ];

    const handleSync = async (platform: string) => {
        setSyncing(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setSyncing(false);
        alert(`${platform} synced successfully!`);
    };

    const handleConnect = (platform: string) => {
        alert(`Connecting to ${platform}... In production, this would initiate OAuth/API key setup.`);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                            <ShoppingBag className="h-7 w-7 text-white" />
                        </div>
                        E-commerce Integrations
                    </h1>
                    <p className="text-gray-600 mt-2">Multi-channel order and inventory management</p>
                </div>
                <button
                    onClick={() => handleSync('all platforms')}
                    disabled={syncing}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                >
                    <RefreshCw className={`h-5 w-5 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Syncing...' : 'Sync All Stores'}
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-green-600">+12%</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">470</p>
                    <p className="text-sm text-gray-600 mt-1">Total Orders (30d)</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <DollarSign className="h-5 w-5 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium text-green-600">+18%</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">$64,580</p>
                    <p className="text-sm text-gray-600 mt-1">Total Revenue (30d)</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Globe className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">2</p>
                    <p className="text-sm text-gray-600 mt-1">Connected Stores</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Package className="h-5 w-5 text-orange-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">98.5%</p>
                    <p className="text-sm text-gray-600 mt-1">Inventory Sync Accuracy</p>
                </div>
            </div>

            {/* Platform Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {platforms.map((platform) => (
                    <div
                        key={platform.id}
                        className={`bg-white border-2 rounded-xl p-6 shadow-sm transition ${platform.connected
                                ? 'border-green-300'
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-14 h-14 bg-gradient-to-r ${platform.color} rounded-xl flex items-center justify-center text-3xl`}>
                                    {platform.icon}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{platform.name}</h3>
                                    {platform.connected ? (
                                        <p className="text-sm text-green-600 flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" />
                                            Connected
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-400">Not connected</p>
                                    )}
                                </div>
                            </div>
                            {platform.connected && (
                                <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                                    <Settings className="h-5 w-5 text-gray-600" />
                                </button>
                            )}
                        </div>

                        {platform.connected ? (
                            <>
                                <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-200">
                                    <div>
                                        <p className="text-xs text-gray-600">Orders</p>
                                        <p className="text-lg font-bold text-gray-900">{platform.orders}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Revenue</p>
                                        <p className="text-lg font-bold text-gray-900">${platform.revenue.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Last Sync</p>
                                        <p className="text-sm font-medium text-gray-900">{platform.lastSync}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleSync(platform.name)}
                                        className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Sync Now
                                    </button>
                                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition">
                                        View Orders
                                    </button>
                                </div>
                            </>
                        ) : (
                            <button
                                onClick={() => handleConnect(platform.name)}
                                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
                            >
                                Connect Store
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Sync Activity</h2>
                <div className="space-y-3">
                    {[
                        { platform: 'Shopify', type: 'Orders', direction: 'import', count: 15, status: 'success', time: '5 min ago' },
                        { platform: 'WooCommerce', type: 'Inventory', direction: 'export', count: 42, status: 'success', time: '10 min ago' },
                        { platform: 'Shopify', type: 'Inventory', direction: 'export', count: 38, status: 'success', time: '15 min ago' }
                    ].map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    {activity.direction === 'import' ? (
                                        <Download className="h-5 w-5 text-green-600" />
                                    ) : (
                                        <Upload className="h-5 w-5 text-blue-600" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{activity.platform} - {activity.type}</p>
                                    <p className="text-sm text-gray-600">
                                        {activity.direction === 'import' ? 'Imported' : 'Exported'} {activity.count} records
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{activity.time}</p>
                                <p className="text-xs text-green-600">Completed</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
