'use client';

import { useEffect, useState } from 'react';
import { integrations } from '@/lib/api';
import { Package, CheckCircle, Plus, X, Settings, Globe } from 'lucide-react';

const AVAILABLE_INTEGRATIONS = [
    { id: 'shopify', name: 'Shopify', icon: Package, description: 'Sync orders and inventory automatically.' },
    { id: 'woocommerce', name: 'WooCommerce', icon: Package, description: 'Connect your WordPress store.' },
    { id: 'slack', name: 'Slack', icon: Package, description: 'Get real-time alerts in your channels.' },
    { id: 'fedex', name: 'FedEx', icon: Package, description: 'Generate shipping labels and track packages.' },
];

export default function IntegrationsPage() {
    const [connectedIntegrations, setConnectedIntegrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
    const [formData, setFormData] = useState({ api_key: '', api_secret: '', webhook_url: '' });

    useEffect(() => {
        fetchIntegrations();
    }, []);

    const fetchIntegrations = async () => {
        try {
            const data = await integrations.getAll();
            setConnectedIntegrations(data);
        } catch (error) {
            console.error('Failed to fetch integrations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = (integration: any) => {
        setSelectedIntegration(integration);
        // Pre-fill if updating
        const existing = connectedIntegrations.find(i => i.name === integration.id);
        if (existing) {
            setFormData({
                api_key: existing.api_key,
                api_secret: existing.api_secret || '',
                webhook_url: existing.webhook_url || ''
            });
        } else {
            setFormData({ api_key: '', api_secret: '', webhook_url: '' });
        }
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await integrations.create({
                name: selectedIntegration.id,
                ...formData,
                status: 'active'
            });
            setModalOpen(false);
            fetchIntegrations();
        } catch (error) {
            console.error('Failed to save integration:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to disconnect this integration?')) {
            try {
                await integrations.delete(id);
                fetchIntegrations();
            } catch (error) {
                console.error('Failed to delete integration:', error);
            }
        }
    };

    const isConnected = (id: string) => connectedIntegrations.some(i => i.name === id);

    return (
        <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
            <div className="mb-8">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Globe className="h-6 w-6 text-blue-400" />
                    Integration Hub
                </h1>
                <p className="text-gray-400 mt-1">Manage your connections with third-party services</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {AVAILABLE_INTEGRATIONS.map((integration) => {
                    const connected = connectedIntegrations.find(i => i.name === integration.id);

                    return (
                        <div key={integration.id} className={`bg-gray-800 rounded-xl border ${connected ? 'border-green-500/50' : 'border-gray-700'} p-6 shadow-lg relative overflow-hidden group`}>
                            {connected && (
                                <div className="absolute top-0 right-0 bg-green-500/20 text-green-400 px-3 py-1 rounded-bl-lg text-xs font-medium flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" /> Connected
                                </div>
                            )}

                            <div className="flex items-center gap-4 mb-4">
                                <div className={`p-3 rounded-lg ${connected ? 'bg-green-500/10 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                                    <integration.icon className="h-8 w-8" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{integration.name}</h3>
                                    <p className="text-xs text-gray-500">{connected ? 'Active' : 'Not Connected'}</p>
                                </div>
                            </div>

                            <p className="text-gray-400 text-sm mb-6 h-10">{integration.description}</p>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleConnect(integration)}
                                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${connected
                                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                        }`}
                                >
                                    {connected ? <Settings className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                    {connected ? 'Configure' : 'Connect'}
                                </button>

                                {connected && (
                                    <button
                                        onClick={() => handleDelete(connected.id)}
                                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                                        title="Disconnect"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Configuration Modal */}
            {modalOpen && selectedIntegration && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <selectedIntegration.icon className="h-5 w-5 text-blue-400" />
                            Configure {selectedIntegration.name}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">API Key</label>
                                <div className="relative">
                                    <Settings className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                    <input
                                        type="text"
                                        value={formData.api_key}
                                        onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter API Key"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">API Secret (Optional)</label>
                                <input
                                    type="password"
                                    value={formData.api_secret}
                                    onChange={(e) => setFormData({ ...formData, api_secret: e.target.value })}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 px-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter API Secret"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Webhook URL (Optional)</label>
                                <input
                                    type="url"
                                    value={formData.webhook_url}
                                    onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 px-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
                                >
                                    Save Configuration
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
