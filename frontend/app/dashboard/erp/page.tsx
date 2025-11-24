'use client';

import { useState } from 'react';
import {
    Link2, CheckCircle, XCircle, RefreshCw, Settings,
    Calendar, BarChart3, AlertCircle, Download, Upload,
    DollarSign, FileText, Users, Package, Zap
} from 'lucide-react';

interface ERPConnection {
    id: number;
    erp_type: string;
    company_id: string;
    is_active: boolean;
    last_sync?: string;
    sync_frequency: string;
}

export default function ERPIntegrationPage() {
    const [connections, setConnections] = useState<ERPConnection[]>([
        {
            id: 1,
            erp_type: 'quickbooks',
            company_id: 'QB-12345',
            is_active: true,
            last_sync: '2024-01-15T10:30:00',
            sync_frequency: 'hourly'
        }
    ]);
    const [syncing, setSyncing] = useState(false);

    const erpPlatforms = [
        {
            id: 'quickbooks',
            name: 'QuickBooks Online',
            icon: '💰',
            color: 'from-green-600 to-emerald-600',
            description: 'Sync invoices, customers, and accounting data',
            features: ['Invoices', 'Purchase Orders', 'Customers', 'Payments']
        },
        {
            id: 'xero',
            name: 'Xero',
            icon: '📊',
            color: 'from-blue-600 to-cyan-600',
            description: 'Connect your Xero accounting system',
            features: ['Invoices', 'Bills', 'Contacts', 'Inventory']
        },
        {
            id: 'sap',
            name: 'SAP Business One',
            icon: '🏢',
            color: 'from-indigo-600 to-purple-600',
            description: 'Enterprise resource planning integration',
            features: ['Sales Orders', 'Purchase Orders', 'Inventory', 'Financials']
        },
        {
            id: 'netsuite',
            name: 'NetSuite',
            icon: '☁️',
            color: 'from-orange-600 to-red-600',
            description: 'Cloud ERP and accounting software',
            features: ['Orders', 'Fulfillment', 'Inventory', 'CRM']
        }
    ];

    const isConnected = (erpType: string) => {
        return connections.some(c => c.erp_type === erpType && c.is_active);
    };

    const handleConnect = (erpType: string) => {
        alert(`Connecting to ${erpType}... In production, this would initiate OAuth flow.`);
    };

    const handleSync = async () => {
        setSyncing(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setSyncing(false);
        alert('Sync completed successfully!');
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <Link2 className="h-7 w-7 text-white" />
                        </div>
                        ERP Integration Hub
                    </h1>
                    <p className="text-gray-600 mt-2">Connect your accounting and ERP systems</p>
                </div>
                <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                >
                    <RefreshCw className={`h-5 w-5 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Syncing...' : 'Sync All'}
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">1</p>
                    <p className="text-sm text-gray-600 mt-1">Active Connections</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <RefreshCw className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">247</p>
                    <p className="text-sm text-gray-600 mt-1">Records Synced Today</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Calendar className="h-5 w-5 text-purple-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">10:30 AM</p>
                    <p className="text-sm text-gray-600 mt-1">Last Sync</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Zap className="h-5 w-5 text-green-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">Hourly</p>
                    <p className="text-sm text-gray-600 mt-1">Sync Frequency</p>
                </div>
            </div>

            {/* Available Platforms */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Available ERP Platforms</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {erpPlatforms.map((platform) => {
                        const connected = isConnected(platform.id);
                        return (
                            <div
                                key={platform.id}
                                className={`border-2 rounded-xl p-6 transition ${connected
                                        ? 'border-green-300 bg-green-50'
                                        : 'border-gray-200 hover:border-blue-300'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 bg-gradient-to-r ${platform.color} rounded-lg flex items-center justify-center text-2xl`}>
                                            {platform.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                                            <p className="text-sm text-gray-600">{platform.description}</p>
                                        </div>
                                    </div>
                                    {connected && (
                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {platform.features.map((feature) => (
                                        <span
                                            key={feature}
                                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded"
                                        >
                                            {feature}
                                        </span>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handleConnect(platform.id)}
                                    className={`w-full px-4 py-2 rounded-lg font-medium transition ${connected
                                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                        }`}
                                >
                                    {connected ? 'Manage Connection' : 'Connect'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sync Logs */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Sync Activity</h2>
                <div className="space-y-3">
                    {[
                        { type: 'Invoice', direction: 'from_erp', status: 'success', records: 45, time: '10:30 AM' },
                        { type: 'Customer', direction: 'to_erp', status: 'success', records: 12, time: '9:15 AM' },
                        { type: 'Inventory', direction: 'from_erp', status: 'success', records: 190, time: '8:00 AM' }
                    ].map((log, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{log.type} Sync</p>
                                    <p className="text-sm text-gray-600">
                                        {log.direction === 'from_erp' ? 'Import' : 'Export'} • {log.records} records
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{log.time}</p>
                                <p className="text-xs text-green-600">Completed</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
