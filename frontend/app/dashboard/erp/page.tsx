'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Box,
    RefreshCw,
    AlertTriangle,
    CheckCircle,
    Settings,
    Plus,
    ArrowRight,
    Cpu,
    Activity,
    Brain,
    Sparkles,
    Search,
    X,
    Check
} from 'lucide-react';
import { erpService, ERPConnection, Discrepancy, MappingSuggestion, SyncLog } from '@/services/erp.service';

export default function ERPPage() {
    const [activeTab, setActiveTab] = useState('overview');
    const [connections, setConnections] = useState<ERPConnection[]>([]);
    const [discrepancies, setDiscrepancies] = useState<Discrepancy[]>([]);
    const [logs, setLogs] = useState<SyncLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [mappingLoading, setMappingLoading] = useState(false);
    const [mappings, setMappings] = useState<MappingSuggestion[]>([]);

    // Mock data for AI Mapping demo
    const [erpFields, setErpFields] = useState("cust_id, cust_name, bill_addr, ship_addr, total_amt");
    const [warefyFields] = useState(["customer_id", "customer_name", "billing_address", "shipping_address", "total_amount", "status", "created_at"]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showLogsModal, setShowLogsModal] = useState(false);
    const [newConnection, setNewConnection] = useState({
        erp_type: 'sap_business_one',
        company_id: '',
        access_token: '',
        sync_frequency: 'hourly'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [conns, discs, syncLogs] = await Promise.all([
                erpService.getConnections(),
                erpService.getDiscrepancies(),
                erpService.getSyncLogs()
            ]);
            setConnections(conns);
            setDiscrepancies(discs);
            setLogs(syncLogs);
        } catch (error) {
            console.error("Failed to fetch ERP data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSyncAll = async () => {
        const activeConnections = connections.filter(conn => conn.is_active);

        if (activeConnections.length === 0) {
            alert("No active connections to sync.");
            return;
        }

        setSyncing(true);
        try {
            // Trigger sync for all active connections in parallel
            await Promise.all(
                activeConnections.map(conn =>
                    erpService.triggerSync(conn.id, ['inventory', 'customer', 'invoice'])
                )
            );

            // Refresh data after syncing
            await fetchData();
        } catch (error) {
            console.error("Sync failed", error);
            alert("Some syncs may have failed. Check logs for details.");
        } finally {
            setSyncing(false);
        }
    };

    const handleConnect = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await erpService.connectERP(newConnection);
            setShowAddModal(false);
            setNewConnection({
                erp_type: 'sap_business_one',
                company_id: '',
                access_token: '',
                sync_frequency: 'hourly'
            });
            await fetchData(); // Refresh list
        } catch (error) {
            console.error("Connection failed", error);
            alert("Failed to connect ERP system. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateMapping = async () => {
        setMappingLoading(true);
        try {
            const erpFieldList = erpFields.split(',').map(f => f.trim());
            const result = await erpService.getAIMapping(erpFieldList, warefyFields);
            setMappings(result);
        } catch (error) {
            console.error("Mapping failed", error);
        } finally {
            setMappingLoading(false);
        }
    };

    const handleResolveDiscrepancy = async (id: string, resolution: string) => {
        try {
            await erpService.resolveDiscrepancy(id, resolution);
            // Optimistic update
            setDiscrepancies(prev => prev.filter(d => d.id !== id));
        } catch (error) {
            console.error("Resolution failed", error);
        }
    };

    const renderOverview = () => (
        <div className="space-y-6">
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <Cpu className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">Active</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{connections.length}</h3>
                    <p className="text-sm text-gray-500">Connected Systems</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-50 rounded-xl">
                            <Activity className="w-6 h-6 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-600">Last 24h</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{logs.reduce((acc, log) => acc + log.records_processed, 0)}</h3>
                    <p className="text-sm text-gray-500">Records Synced</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-amber-50 rounded-xl">
                            <AlertTriangle className="w-6 h-6 text-amber-600" />
                        </div>
                        {discrepancies.length > 0 && (
                            <span className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full">Action Needed</span>
                        )}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{discrepancies.length}</h3>
                    <p className="text-sm text-gray-500">Data Discrepancies</p>
                </motion.div>
            </div>

            {/* Connected Systems List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Connected ERPs</h2>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Connection
                    </button>
                </div>
                <div className="divide-y divide-gray-100">
                    {connections.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No ERP systems connected. Click "Add Connection" to start.
                        </div>
                    ) : (
                        connections.map((conn) => (
                            <div key={conn.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <Box className="w-6 h-6 text-gray-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900 capitalize">{conn.erp_type.replace('_', ' ')}</h3>
                                        <p className="text-sm text-gray-500">ID: {conn.company_id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-6">
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">Last Sync</p>
                                        <p className="text-xs text-gray-500">
                                            {conn.last_sync ? new Date(conn.last_sync).toLocaleString() : 'Never'}
                                        </p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${conn.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {conn.is_active ? 'Active' : 'Inactive'}
                                    </div>
                                    <button className="p-2 text-gray-400 hover:text-gray-600">
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

    const renderAIMapping = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Brain className="w-5 h-5 text-purple-600 mr-2" />
                        AI Field Mapper
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Paste your ERP field names (comma separated) and let Gemini AI suggest the best mapping to Warefy's schema.
                    </p>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ERP Fields</label>
                            <textarea
                                value={erpFields}
                                onChange={(e) => setErpFields(e.target.value)}
                                className="w-full h-32 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                placeholder="e.g. cust_id, bill_addr..."
                            />
                        </div>
                        <button
                            onClick={handleGenerateMapping}
                            disabled={mappingLoading}
                            className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                            {mappingLoading ? (
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Sparkles className="w-4 h-4 mr-2" />
                            )}
                            {mappingLoading ? 'Analyzing...' : 'Generate Mapping'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900">Suggested Mappings</h3>
                    </div>
                    {mappings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <ArrowRight className="w-12 h-12 mb-4 opacity-20" />
                            <p>No mappings generated yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {mappings.map((mapping, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-4 flex items-center justify-between hover:bg-gray-50"
                                >
                                    <div className="flex items-center space-x-4 flex-1">
                                        <div className="flex-1 p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm font-mono text-gray-700">
                                            {mapping.erp_field}
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-400" />
                                        <div className="flex-1 p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm font-mono text-blue-700">
                                            {mapping.warefy_field}
                                        </div>
                                    </div>
                                    <div className="ml-6 flex items-center space-x-4">
                                        <div className="text-right">
                                            <div className="text-xs font-medium text-gray-500">Confidence</div>
                                            <div className={`text-sm font-bold ${mapping.confidence > 0.8 ? 'text-green-600' : 'text-amber-600'
                                                }`}>
                                                {(mapping.confidence * 100).toFixed(0)}%
                                            </div>
                                        </div>
                                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                                            <Check className="w-5 h-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderDiscrepancies = () => (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Data Discrepancies</h2>
                    <p className="text-sm text-gray-500">Conflicts detected between Warefy and ERPs</p>
                </div>
                <button
                    onClick={fetchData}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>
            <div className="divide-y divide-gray-100">
                {discrepancies.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-50" />
                        <p className="text-lg font-medium text-gray-900">All Systems Synced</p>
                        <p>No discrepancies found.</p>
                    </div>
                ) : (
                    discrepancies.map((disc) => (
                        <div key={disc.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-amber-50 rounded-lg">
                                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">
                                        {disc.type === 'inventory' ? 'Inventory Mismatch' : 'Data Conflict'}
                                    </h3>
                                    <p className="text-sm text-gray-500">Item: {disc.item_id} • Source: {disc.erp_source}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-8">
                                <div className="flex items-center space-x-4">
                                    <div className="text-center">
                                        <div className="text-xs text-gray-500 mb-1">Warefy</div>
                                        <div className="font-mono font-bold text-gray-900">{disc.warefy_value}</div>
                                    </div>
                                    <div className="h-8 w-px bg-gray-200"></div>
                                    <div className="text-center">
                                        <div className="text-xs text-gray-500 mb-1">ERP</div>
                                        <div className="font-mono font-bold text-gray-900">{disc.erp_value}</div>
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleResolveDiscrepancy(disc.id, 'keep_warefy')}
                                        className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Keep Warefy
                                    </button>
                                    <button
                                        onClick={() => handleResolveDiscrepancy(disc.id, 'accept_erp')}
                                        className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                    >
                                        Accept ERP
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">ERP Command Center</h1>
                    <p className="text-gray-500 mt-1">Manage integrations, sync data, and resolve conflicts with AI.</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => setShowLogsModal(true)}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center"
                    >
                        <Box className="w-4 h-4 mr-2" />
                        View Logs
                    </button>
                    <button
                        onClick={handleSyncAll}
                        disabled={syncing}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                        {syncing ? 'Syncing...' : 'Sync All'}
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
                {[
                    { id: 'overview', label: 'Overview', icon: Box },
                    { id: 'mapping', label: 'AI Mapping', icon: Brain },
                    { id: 'discrepancies', label: 'Discrepancies', icon: AlertTriangle },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <tab.icon className="w-4 h-4 mr-2" />
                        {tab.label}
                        {tab.id === 'discrepancies' && discrepancies.length > 0 && (
                            <span className="ml-2 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full text-xs">
                                {discrepancies.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'mapping' && renderAIMapping()}
                    {activeTab === 'discrepancies' && renderDiscrepancies()}
                </motion.div>
            </AnimatePresence>

            {/* Add Connection Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900">Connect ERP System</h2>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleConnect} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ERP Provider</label>
                                    <select
                                        value={newConnection.erp_type}
                                        onChange={(e) => setNewConnection({ ...newConnection, erp_type: e.target.value })}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    >
                                        <option value="sap_business_one">SAP Business One</option>
                                        <option value="oracle_netsuite">Oracle NetSuite</option>
                                        <option value="microsoft_dynamics">Microsoft Dynamics 365</option>
                                        <option value="quickbooks">QuickBooks Online</option>
                                        <option value="xero">Xero</option>
                                        <option value="sage_intacct">Sage Intacct</option>
                                        <option value="odoo">Odoo</option>
                                        <option value="zoho_books">Zoho Books</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Company / Tenant ID</label>
                                    <input
                                        type="text"
                                        required
                                        value={newConnection.company_id}
                                        onChange={(e) => setNewConnection({ ...newConnection, company_id: e.target.value })}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        placeholder="e.g. comp_12345"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">API Key / Access Token</label>
                                    <input
                                        type="password"
                                        required
                                        value={newConnection.access_token}
                                        onChange={(e) => setNewConnection({ ...newConnection, access_token: e.target.value })}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        placeholder="••••••••••••••••"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sync Frequency</label>
                                    <select
                                        value={newConnection.sync_frequency}
                                        onChange={(e) => setNewConnection({ ...newConnection, sync_frequency: e.target.value })}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    >
                                        <option value="realtime">Real-time</option>
                                        <option value="hourly">Hourly</option>
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                    </select>
                                </div>

                                <div className="pt-4 flex space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center"
                                    >
                                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Connect System'}
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
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden max-h-[80vh] flex flex-col"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Sync Logs</h2>
                                    <p className="text-sm text-gray-500">History of all ERP synchronization events</p>
                                </div>
                                <button
                                    onClick={() => setShowLogsModal(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="overflow-hidden border border-gray-200 rounded-xl">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Direction</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Records</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {logs.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                        No logs available
                                                    </td>
                                                </tr>
                                            ) : (
                                                logs.map((log) => (
                                                    <tr key={log.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${log.status === 'success' ? 'bg-green-100 text-green-800' :
                                                                log.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                                }`}>
                                                                {log.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                                                            {log.sync_type.replace('_', ' ')}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                                            {log.direction}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {log.records_processed} processed
                                                            {log.records_failed > 0 && <span className="text-red-500 ml-1">({log.records_failed} failed)</span>}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {new Date(log.started_at).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                                <button
                                    onClick={() => setShowLogsModal(false)}
                                    className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
