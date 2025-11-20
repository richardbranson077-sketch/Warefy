'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, Filter } from 'lucide-react';
import { anomalies } from '@/lib/api';

export default function AnomaliesPage() {
    const [anomalyList, setAnomalyList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchAnomalies = async () => {
            try {
                // Mock data for demo if API is empty
                const data = await anomalies.getRecent();
                if (data && data.length > 0) {
                    setAnomalyList(data);
                } else {
                    setAnomalyList([
                        {
                            id: 1,
                            type: 'Demand Spike',
                            severity: 'critical',
                            description: 'Unusual demand spike for SKU-005 (Wireless Mouse). Sales 300% above average.',
                            detected_at: new Date().toISOString(),
                            status: 'active'
                        },
                        {
                            id: 2,
                            type: 'Delivery Delay',
                            severity: 'high',
                            description: 'Vehicle VH-002 is delayed by 45 minutes due to traffic congestion.',
                            detected_at: new Date(Date.now() - 3600000).toISOString(),
                            status: 'active'
                        },
                        {
                            id: 3,
                            type: 'Stockout Risk',
                            severity: 'medium',
                            description: 'Inventory for Desk Lamp (SKU-003) approaching critical levels.',
                            detected_at: new Date(Date.now() - 7200000).toISOString(),
                            status: 'resolved'
                        }
                    ]);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching anomalies:', error);
                setLoading(false);
            }
        };

        fetchAnomalies();
    }, []);

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Anomaly Detection</h1>
                    <p className="text-gray-500 mt-1">Real-time alerts for supply chain disruptions</p>
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-gray-400" />
                    <select
                        className="border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-primary-500"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">All Alerts</option>
                        <option value="critical">Critical Only</option>
                        <option value="active">Active Only</option>
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                {anomalyList.map((anomaly) => (
                    <div
                        key={anomaly.id}
                        className={`bg-white rounded-xl border p-6 transition-all hover:shadow-md ${anomaly.status === 'resolved' ? 'opacity-75 border-gray-200' : 'border-l-4 border-l-red-500 border-gray-200'
                            }`}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex gap-4">
                                <div className={`p-3 rounded-full h-fit ${anomaly.severity === 'critical' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                                    }`}>
                                    <AlertTriangle className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-semibold text-gray-900">{anomaly.type}</h3>
                                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${getSeverityColor(anomaly.severity)} uppercase`}>
                                            {anomaly.severity}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mb-2">{anomaly.description}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            {new Date(anomaly.detected_at).toLocaleString()}
                                        </span>
                                        {anomaly.status === 'resolved' && (
                                            <span className="flex items-center gap-1 text-green-600">
                                                <CheckCircle className="h-4 w-4" />
                                                Resolved
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {anomaly.status !== 'resolved' && (
                                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                    Resolve
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
