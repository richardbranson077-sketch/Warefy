'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp,
    Package,
    RefreshCw,
    Plus,
    Settings,
    X,
    Check,
    Brain,
    DollarSign,
    BarChart3,
    Box
} from 'lucide-react';
import { ecommerceService, EcommerceConnection, ProductRecommendation, PricingRecommendation, OrderAnalytics, SyncLog } from '@/services/ecommerce.service';

export default function EcommercePage() {
    const [activeTab, setActiveTab] = useState('overview');
    const [connections, setConnections] = useState<EcommerceConnection[]>([]);
    const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
    const [pricingRecs, setPricingRecs] = useState<PricingRecommendation[]>([]);
    const [analytics, setAnalytics] = useState<OrderAnalytics | null>(null);
    const [logs, setLogs] = useState<SyncLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showLogsModal, setShowLogsModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [selectedConnection, setSelectedConnection] = useState<EcommerceConnection | null>(null);
    const [newConnection, setNewConnection] = useState({
        platform: 'shopify',
        store_name: '',
        api_key: '',
        auto_sync_orders: true
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [conns, syncLogs] = await Promise.all([
                ecommerceService.getConnections(),
                ecommerceService.getSyncLogs()
            ]);
            setConnections(conns);
            setLogs(syncLogs);

            // Load AI data for first active connection
            if (conns.length > 0 && conns[0].is_active) {
                loadAIFeatures(conns[0].id);
            }
        } catch (error) {
            console.error("Failed to fetch e-commerce data", error);
        } finally {
            setLoading(false);
        }
    };

    const loadAIFeatures = async (connectionId: number) => {
        try {
            const [recs, pricing, stats] = await Promise.all([
                ecommerceService.getProductRecommendations(connectionId),
                ecommerceService.getPricingOptimization(connectionId),
                ecommerceService.getOrderAnalytics(connectionId)
            ]);
            setRecommendations(recs);
            setPricingRecs(pricing);
            setAnalytics(stats);
        } catch (error) {
            console.error("Failed to load AI features", error);
        }
    };

    const handleSyncAll = async () => {
        const activeConns = connections.filter(c => c.is_active);
        if (activeConns.length === 0) {
            alert("No active connections to sync.");
            return;
        }

        setSyncing(true);
        try {
            await Promise.all(
                activeConns.map(conn => ecommerceService.syncOrders(conn.id))
            );
            await fetchData();
        } catch (error) {
            console.error("Sync failed", error);
        } finally {
            setSyncing(false);
        }
    };

    const handleConnect = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await ecommerceService.connectPlatform(newConnection);
            setShowAddModal(false);
            setNewConnection({ platform: 'shopify', store_name: '', api_key: '', auto_sync_orders: true });
            await fetchData();
        } catch (error) {
            console.error("Connection failed", error);
            alert("Failed to connect platform. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    const handleSettingsClick = (connection: EcommerceConnection) => {
        setSelectedConnection(connection);
        setShowSettingsModal(true);
    };

    const handleUpdateConnection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedConnection) return;

        setLoading(true);
        try {
            await ecommerceService.updateConnection(selectedConnection.id, {
                store_name: selectedConnection.store_name,
                is_active: selectedConnection.is_active
            });
            setShowSettingsModal(false);
            setSelectedConnection(null);
            await fetchData();
        } catch (error) {
            console.error("Update failed", error);
            alert("Failed to update connection settings.");
        } finally {
            setLoading(false);
        }
    };

    const renderOverview = () => (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">Active</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{connections.length}</h3>
                    <p className="text-sm text-gray-500">Connected Platforms</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-50 rounded-xl">
                            <Package className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{analytics?.total_orders || 0}</h3>
                    <p className="text-sm text-gray-500">Total Orders</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-50 rounded-xl">
                            <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">${analytics?.total_revenue?.toFixed(2) || '0.00'}</h3>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                </motion.div>
            </div>

            {/* Connected Platforms */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Connected Platforms</h2>
                    <button onClick={() => setShowAddModal(true)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Platform
                    </button>
                </div>
                <div className="divide-y divide-gray-100">
                    {connections.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No platforms connected. Click "Add Platform" to start.
                        </div>
                    ) : (
                        connections.map((conn) => (
                            <div key={conn.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <Package className="w-6 h-6 text-gray-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900 capitalize">{conn.platform}</h3>
                                        <p className="text-sm text-gray-500">{conn.store_name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-6">
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">Last Order Sync</p>
                                        <p className="text-xs text-gray-500">
                                            {conn.last_order_sync ? new Date(conn.last_order_sync).toLocaleString() : 'Never'}
                                        </p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${conn.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {conn.is_active ? 'Active' : 'Inactive'}
                                    </div>
                                    <button onClick={() => handleSettingsClick(conn)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                        <Settings className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );

    const renderAITools = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Recommendations */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center">
                    <Brain className="w-5 h-5 text-purple-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">AI Product Recommendations</h3>
                </div>
                <div className="p-6 space-y-4">
                    {recommendations.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No recommendations available</p>
                    ) : (
                        recommendations.map((rec, idx) => (
                            <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-medium text-gray-900">{rec.product_name}</h4>
                                    <span className="text-xs font-bold text-purple-600">{(rec.confidence * 100).toFixed(0)}%</span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{rec.reasoning}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">SKU: {rec.sku}</span>
                                    <span className="text-sm font-semibold text-green-600">${rec.expected_revenue.toFixed(2)}</span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Pricing Optimization */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center">
                    <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Pricing Optimization</h3>
                </div>
                <div className="p-6 space-y-4">
                    {pricingRecs.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No pricing recommendations</p>
                    ) : (
                        pricingRecs.map((rec, idx) => (
                            <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="p-4 bg-green-50 rounded-lg border border-green-100">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs text-gray-500">SKU: {rec.sku}</span>
                                    <span className="text-xs font-bold text-green-600">{(rec.confidence * 100).toFixed(0)}%</span>
                                </div>
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="text-sm text-gray-500 line-through">${rec.current_price.toFixed(2)}</span>
                                    <span className="text-lg font-bold text-green-600">${rec.recommended_price.toFixed(2)}</span>
                                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">{rec.expected_impact}</span>
                                </div>
                                <p className="text-sm text-gray-600">{rec.reasoning}</p>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );

    const renderAnalytics = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center mb-6">
                    <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Order Analytics & Insights</h3>
                </div>

                {analytics ? (
                    <div className="space-y-6">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-sm text-gray-700 leading-relaxed">{analytics.insights}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Avg Order Value</p>
                                <p className="text-xl font-bold text-gray-900">${analytics.avg_order_value.toFixed(2)}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Total Orders</p>
                                <p className="text-xl font-bold text-gray-900">{analytics.total_orders}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Revenue</p>
                                <p className="text-xl font-bold text-gray-900">${analytics.total_revenue.toFixed(2)}</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">Top Products</h4>
                            <div className="space-y-2">
                                {analytics.top_products.map((product, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-700">SKU: {product.sku}</span>
                                        <span className="text-sm font-semibold text-gray-900">{product.quantity} units</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-8">No analytics data available</p>
                )}
            </div>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">E-commerce Command Center</h1>
                    <p className="text-gray-500 mt-1">Manage multi-channel sales with AI insights</p>
                </div>
                <div className="flex space-x-3">
                    <button onClick={() => setShowLogsModal(true)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center">
                        <Box className="w-4 h-4 mr-2" />
                        View Logs
                    </button>
                    <button onClick={handleSyncAll} disabled={syncing} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center disabled:opacity-50">
                        <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                        {syncing ? 'Syncing...' : 'Sync All'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
                {[
                    { id: 'overview', label: 'Overview', icon: Package },
                    { id: 'ai-tools', label: 'AI Tools', icon: Brain },
                    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                ].map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        <tab.icon className="w-4 h-4 mr-2" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'ai-tools' && renderAITools()}
                    {activeTab === 'analytics' && renderAnalytics()}
                </motion.div>
            </AnimatePresence>

            {/* Add Connection Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900">Connect E-commerce Platform</h2>
                                <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleConnect} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                                    <select value={newConnection.platform} onChange={(e) => setNewConnection({ ...newConnection, platform: e.target.value })} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                                        <option value="shopify">Shopify</option>
                                        <option value="woocommerce">WooCommerce</option>
                                        <option value="amazon">Amazon Seller Central</option>
                                        <option value="ebay">eBay</option>
                                        <option value="bigcommerce">BigCommerce</option>
                                        <option value="magento">Magento</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                                    <input type="text" required value={newConnection.store_name} onChange={(e) => setNewConnection({ ...newConnection, store_name: e.target.value })} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="mystore" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                                    <input type="password" required value={newConnection.api_key} onChange={(e) => setNewConnection({ ...newConnection, api_key: e.target.value })} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="••••••••••••••••" />
                                </div>

                                <div className="pt-4 flex space-x-3">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center">
                                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Connect'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Logs Modal */}
            <AnimatePresence>
                {showLogsModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden max-h-[80vh] flex flex-col">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Sync Logs</h2>
                                    <p className="text-sm text-gray-500">E-commerce synchronization history</p>
                                </div>
                                <button onClick={() => setShowLogsModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="space-y-3">
                                    {logs.length === 0 ? (
                                        <p className="text-center text-gray-500 py-8">No logs available</p>
                                    ) : (
                                        logs.map((log) => (
                                            <div key={log.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 capitalize">{log.platform} - {log.sync_type}</h4>
                                                        <p className="text-sm text-gray-500">{log.records_processed} records processed</p>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {log.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-2">{new Date(log.started_at).toLocaleString()}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Settings Modal */}
            <AnimatePresence>
                {showSettingsModal && selectedConnection && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900">Connection Settings</h2>
                                <button onClick={() => { setShowSettingsModal(false); setSelectedConnection(null); }} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateConnection} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                                    <input type="text" disabled value={selectedConnection.platform} className="w-full p-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                                    <input type="text" value={selectedConnection.store_name} onChange={(e) => setSelectedConnection({ ...selectedConnection, store_name: e.target.value })} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Connection Status</p>
                                        <p className="text-xs text-gray-500">Enable or disable this connection</p>
                                    </div>
                                    <button type="button" onClick={() => setSelectedConnection({ ...selectedConnection, is_active: !selectedConnection.is_active })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${selectedConnection.is_active ? 'bg-blue-600' : 'bg-gray-300'}`}>
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${selectedConnection.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>

                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <p className="text-xs text-blue-700">
                                        <strong>Note:</strong> To update API credentials, please delete and recreate the connection.
                                    </p>
                                </div>

                                <div className="pt-4 flex space-x-3">
                                    <button type="button" onClick={() => { setShowSettingsModal(false); setSelectedConnection(null); }} className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center">
                                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
