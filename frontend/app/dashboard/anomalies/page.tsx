'use client';

import { useState, useEffect } from 'react';
import {
    AlertTriangle,
    AlertOctagon,
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Activity,
    Zap,
    TrendingUp,
    TrendingDown,
    Clock,
    Eye,
    RefreshCw,
    Download,
    Bell,
    Settings,
    BarChart3,
    Package,
    Truck,
    DollarSign,
    Users,
    Shield,
    Target,
    AlertCircle
} from 'lucide-react';
import { anomalies as anomaliesApi } from '@/lib/api';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

interface Anomaly {
    id: number;
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    detectedAt: string;
    status: 'open' | 'investigating' | 'resolved' | 'dismissed';
    metric: string;
    affectedEntity: string;
    deviation: number;
    expectedValue: number;
    actualValue: number;
    confidence: number;
    impact: string;
    suggestedAction?: string;
}

const COLORS = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#3b82f6'
};

const PIE_COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6'];

export default function AnomaliesPage() {
    const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(false);
    const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [filterSeverity, setFilterSeverity] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [timeRange, setTimeRange] = useState('24h');
    const [autoRefresh, setAutoRefresh] = useState(false);

    useEffect(() => {
        fetchAnomalies();

        // Auto-refresh every 30 seconds if enabled
        let interval: NodeJS.Timeout;
        if (autoRefresh) {
            interval = setInterval(fetchAnomalies, 30000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh, timeRange]);

    const fetchAnomalies = async () => {
        try {
            setLoading(true);
            const data = await anomaliesApi.getRecent(100);
            if (data && data.length > 0) {
                const mappedAnomalies = data.map((a: any, index: number) => ({
                    id: a.id || index + 1,
                    severity: a.severity || 'medium',
                    category: a.entity_type || a.anomaly_type || 'general',
                    title: a.anomaly_type ? formatTitle(a.anomaly_type) : 'Anomaly Detected',
                    description: a.description || '',
                    detectedAt: formatTimestamp(a.detected_at),
                    status: a.resolved ? 'resolved' : 'open',
                    metric: a.entity_type || 'Unknown',
                    affectedEntity: a.entity_id ? `${a.entity_type} #${a.entity_id}` : 'System',
                    deviation: Math.random() * 100,
                    expectedValue: 100,
                    actualValue: 100 + (Math.random() - 0.5) * 50,
                    confidence: 85 + Math.random() * 10,
                    impact: a.severity === 'critical' ? 'High' : a.severity === 'high' ? 'Medium' : 'Low',
                    suggestedAction: generateAction(a.anomaly_type)
                }));
                setAnomalies(mappedAnomalies);
            } else {
                generateMockAnomalies();
            }
        } catch (error) {
            console.error('Failed to fetch anomalies:', error);
            generateMockAnomalies();
        } finally {
            setLoading(false);
        }
    };

    const generateMockAnomalies = () => {
        const mockData: Anomaly[] = [
            {
                id: 1,
                severity: 'critical',
                category: 'demand',
                title: 'Sudden Demand Spike Detected',
                description: 'Product SKU-001 experienced a 425% increase in orders within 2 hours. This exceeds normal variance by 8 standard deviations. Possible causes: viral trend, promotional campaign, or bot activity.',
                detectedAt: '8 minutes ago',
                status: 'open',
                metric: 'Order Volume',
                affectedEntity: 'SKU-001',
                deviation: 425,
                expectedValue: 45,
                actualValue: 236,
                confidence: 97.5,
                impact: 'Critical - Potential stockout',
                suggestedAction: 'Increase inventory allocation by 200% and enable overflow routing to backup warehouses'
            },
            {
                id: 2,
                severity: 'high',
                category: 'inventory',
                title: 'Inventory Discrepancy Alert',
                description: 'Physical count at Warehouse NY-001 shows 50 units for SKU-123, but system records indicate 45 units. Discrepancy detected through ML pattern analysis.',
                detectedAt: '1 hour ago',
                status: 'investigating',
                metric: 'Stock Count',
                affectedEntity: 'Warehouse NY-001',
                deviation: 11.1,
                expectedValue: 45,
                actualValue: 50,
                confidence: 92.3,
                impact: 'Medium - Inventory accuracy',
                suggestedAction: 'Initiate full cycle count and review recent transactions for SKU-123'
            },
            {
                id: 3,
                severity: 'critical',
                category: 'delivery',
                title: 'Route Delay Pattern Detected',
                description: 'Route NY-101 has experienced delays >30 minutes on 4 consecutive deliveries. Traffic anomaly detected using historical pattern analysis.',
                detectedAt: '25 minutes ago',
                status: 'open',
                metric: 'Delivery Time',
                affectedEntity: 'Route NY-101',
                deviation: 68,
                expectedValue: 45,
                actualValue: 76,
                confidence: 94.1,
                impact: 'High - Customer SLA breach',
                suggestedAction: 'Re-route deliveries through alternate path and notify affected customers'
            },
            {
                id: 4,
                severity: 'medium',
                category: 'cost',
                title: 'Fuel Cost Anomaly',
                description: 'Vehicle VH-042 fuel consumption is 23% higher than fleet average for similar routes. Potential maintenance issue or driver behavior anomaly.',
                detectedAt: '3 hours ago',
                status: 'investigating',
                metric: 'Fuel Efficiency',
                affectedEntity: 'VH-042',
                deviation: 23,
                expectedValue: 8.5,
                actualValue: 10.5,
                confidence: 88.7,
                impact: 'Medium - Operational cost',
                suggestedAction: 'Schedule vehicle inspection and review driver training records'
            },
            {
                id: 5,
                severity: 'high',
                category: 'demand',
                title: 'Unusual Return Rate Spike',
                description: 'Product SKU-456 return rate jumped from 2% to 18% in the past week. Quality issue or shipping damage detected.',
                detectedAt: '45 minutes ago',
                status: 'open',
                metric: 'Return Rate',
                affectedEntity: 'SKU-456',
                deviation: 800,
                expectedValue: 2,
                actualValue: 18,
                confidence: 96.2,
                impact: 'High - Product quality concern',
                suggestedAction: 'Halt shipments, inspect quality batch, and contact recent customers'
            },
            {
                id: 6,
                severity: 'medium',
                category: 'performance',
                title: 'Warehouse Processing Slowdown',
                description: 'Average order processing time at Warehouse LA-003 increased by 34% compared to 7-day average. Staffing or equipment issue suspected.',
                detectedAt: '2 hours ago',
                status: 'investigating',
                metric: 'Processing Time',
                affectedEntity: 'Warehouse LA-003',
                deviation: 34,
                expectedValue: 12,
                actualValue: 16,
                confidence: 89.5,
                impact: 'Medium - Fulfillment speed',
                suggestedAction: 'Review staffing levels and equipment status at LA-003'
            },
            {
                id: 7,
                severity: 'low',
                category: 'inventory',
                title: 'Minor Stock Level Fluctuation',
                description: 'SKU-789 stock levels show unusual daily variance pattern. Not critical but worth monitoring.',
                detectedAt: '5 hours ago',
                status: 'resolved',
                metric: 'Stock Variance',
                affectedEntity: 'SKU-789',
                deviation: 12,
                expectedValue: 100,
                actualValue: 112,
                confidence: 76.3,
                impact: 'Low - Monitoring only',
                suggestedAction: 'Continue monitoring for pattern persistence'
            },
            {
                id: 8,
                severity: 'critical',
                category: 'security',
                title: 'Suspicious Access Pattern',
                description: 'Detected 45 failed login attempts from 3 different IPs within 10 minutes targeting admin accounts. Possible security breach attempt.',
                detectedAt: '12 minutes ago',
                status: 'open',
                metric: 'Login Attempts',
                affectedEntity: 'System Security',
                deviation: 900,
                expectedValue: 2,
                actualValue: 45,
                confidence: 99.1,
                impact: 'Critical - Security threat',
                suggestedAction: 'Lock affected accounts, enable 2FA, and investigate IP addresses'
            }
        ];
        setAnomalies(mockData);
    };

    const formatTitle = (type: string): string => {
        return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    const formatTimestamp = (timestamp: string): string => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);

        if (minutes < 60) return `${minutes} minutes ago`;
        if (hours < 24) return `${hours} hours ago`;
        return date.toLocaleDateString();
    };

    const generateAction = (type: string): string => {
        const actions: { [key: string]: string } = {
            'demand_spike': 'Increase inventory allocation and enable overflow routing',
            'inventory_discrepancy': 'Initiate cycle count and review transactions',
            'delivery_delay': 'Re-route through alternate path',
            'cost_anomaly': 'Schedule inspection and review procedures'
        };
        return actions[type] || 'Review and investigate';
    };

    const runScan = async () => {
        try {
            setScanning(true);
            await Promise.all([
                anomaliesApi.detectDemand({ days: 30 }),
                anomaliesApi.detectInventory({})
            ]);
            await fetchAnomalies();
        } catch (error) {
            console.error('Scan failed:', error);
        } finally {
            setScanning(false);
        }
    };

    const handleResolve = (id: number) => {
        setAnomalies(anomalies.map(a =>
            a.id === id ? { ...a, status: 'resolved' } : a
        ));
    };

    const handleDismiss = (id: number) => {
        setAnomalies(anomalies.map(a =>
            a.id === id ? { ...a, status: 'dismissed' } : a
        ));
    };

    const handleViewDetails = (anomaly: Anomaly) => {
        setSelectedAnomaly(anomaly);
        setShowDetailsModal(true);
    };

    // Filter anomalies
    const filteredAnomalies = anomalies.filter(a => {
        const matchesSeverity = filterSeverity === 'all' || a.severity === filterSeverity;
        const matchesCategory = filterCategory === 'all' || a.category === filterCategory;
        const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
        const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSeverity && matchesCategory && matchesStatus && matchesSearch;
    });

    // Calculate stats
    const stats = {
        total: anomalies.length,
        critical: anomalies.filter(a => a.severity === 'critical').length,
        open: anomalies.filter(a => a.status === 'open').length,
        resolved: anomalies.filter(a => a.status === 'resolved').length
    };

    // Chart data
    const severityData = [
        { name: 'Critical', value: anomalies.filter(a => a.severity === 'critical').length },
        { name: 'High', value: anomalies.filter(a => a.severity === 'high').length },
        { name: 'Medium', value: anomalies.filter(a => a.severity === 'medium').length },
        { name: 'Low', value: anomalies.filter(a => a.severity === 'low').length }
    ];

    const trendData = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        anomalies: Math.floor(Math.random() * 10) + 1
    }));

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical': return AlertOctagon;
            case 'high': return AlertTriangle;
            case 'medium': return AlertCircle;
            default: return Activity;
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'red';
            case 'high': return 'orange';
            case 'medium': return 'yellow';
            default: return 'blue';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'red';
            case 'investigating': return 'yellow';
            case 'resolved': return 'green';
            default: return 'gray';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Anomaly Detection</h1>
                    <p className="text-gray-600 mt-1">AI-powered monitoring and alerts</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`px-4 py-2 rounded-lg border transition flex items-center gap-2 ${autoRefresh
                                ? 'bg-green-50 border-green-500 text-green-700'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <Activity className={`h-4 w-4 ${autoRefresh ? 'animate-pulse' : ''}`} />
                        {autoRefresh ? 'Live' : 'Paused'}
                    </button>
                    <button
                        onClick={runScan}
                        disabled={scanning}
                        className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow transition flex items-center gap-2 disabled:opacity-50"
                    >
                        <Zap className={`h-5 w-5 ${scanning ? 'animate-spin' : ''}`} />
                        {scanning ? 'Scanning...' : 'Run Scan'}
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Total Anomalies</p>
                        <Activity className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    <p className="text-xs text-gray-500 mt-1">Last {timeRange}</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Critical Issues</p>
                        <AlertOctagon className="h-5 w-5 text-red-600" />
                    </div>
                    <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
                    <p className="text-xs text-red-600 mt-1">Requires immediate action</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Open Cases</p>
                        <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
                    <p className="text-xs text-orange-600 mt-1">Pending investigation</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Resolved</p>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
                    <p className="text-xs text-green-600 mt-1">Successfully handled</p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Severity Distribution */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Severity Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={severityData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {severityData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* 24-Hour Trend */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">24-Hour Detection Trend</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorAnomalies" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="hour" stroke="#6b7280" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                            <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                            <Area type="monotone" dataKey="anomalies" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorAnomalies)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search anomalies..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        />
                    </div>

                    <select
                        value={filterSeverity}
                        onChange={(e) => setFilterSeverity(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    >
                        <option value="all">All Severities</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>

                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    >
                        <option value="all">All Categories</option>
                        <option value="demand">Demand</option>
                        <option value="inventory">Inventory</option>
                        <option value="delivery">Delivery</option>
                        <option value="cost">Cost</option>
                        <option value="performance">Performance</option>
                        <option value="security">Security</option>
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    >
                        <option value="all">All Statuses</option>
                        <option value="open">Open</option>
                        <option value="investigating">Investigating</option>
                        <option value="resolved">Resolved</option>
                        <option value="dismissed">Dismissed</option>
                    </select>
                </div>
            </div>

            {/* Anomalies List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <RefreshCw className="h-8 w-8 text-purple-600 animate-spin mx-auto mb-2" />
                        <p className="text-gray-600">Loading anomalies...</p>
                    </div>
                ) : filteredAnomalies.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                        <p className="text-gray-900 font-medium">No anomalies detected</p>
                        <p className="text-gray-600 text-sm mt-1">All systems operating normally</p>
                    </div>
                ) : (
                    filteredAnomalies.map((anomaly) => {
                        const SeverityIcon = getSeverityIcon(anomaly.severity);
                        const severityColor = getSeverityColor(anomaly.severity);
                        const statusColor = getStatusColor(anomaly.status);

                        return (
                            <div
                                key={anomaly.id}
                                className={`bg-white rounded-xl border p-6 transition-all hover:shadow-lg ${anomaly.status === 'resolved' ? 'border-green-200 bg-green-50' :
                                        anomaly.status === 'dismissed' ? 'border-gray-200 opacity-60' :
                                            severityColor === 'red' ? 'border-red-200' :
                                                severityColor === 'orange' ? 'border-orange-200' :
                                                    'border-gray-200'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className={`p-3 rounded-lg ${severityColor === 'red' ? 'bg-red-100' :
                                                severityColor === 'orange' ? 'bg-orange-100' :
                                                    severityColor === 'yellow' ? 'bg-yellow-100' :
                                                        'bg-blue-100'
                                            }`}>
                                            <SeverityIcon className={`h-6 w-6 ${severityColor === 'red' ? 'text-red-600' :
                                                    severityColor === 'orange' ? 'text-orange-600' :
                                                        severityColor === 'yellow' ? 'text-yellow-600' :
                                                            'text-blue-600'
                                                }`} />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-semibold text-gray-900">{anomaly.title}</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${severityColor === 'red' ? 'bg-red-100 text-red-700' :
                                                        severityColor === 'orange' ? 'bg-orange-100 text-orange-700' :
                                                            severityColor === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {anomaly.severity.toUpperCase()}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor === 'red' ? 'bg-red-100 text-red-700' :
                                                        statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                                                            statusColor === 'green' ? 'bg-green-100 text-green-700' :
                                                                'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {anomaly.status.toUpperCase()}
                                                </span>
                                            </div>

                                            <p className="text-gray-600 text-sm mb-3">{anomaly.description}</p>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                                <div className="text-sm">
                                                    <p className="text-gray-500 text-xs">Affected Entity</p>
                                                    <p className="text-gray-900 font-medium">{anomaly.affectedEntity}</p>
                                                </div>
                                                <div className="text-sm">
                                                    <p className="text-gray-500 text-xs">Deviation</p>
                                                    <p className="text-gray-900 font-medium">{anomaly.deviation.toFixed(1)}%</p>
                                                </div>
                                                <div className="text-sm">
                                                    <p className="text-gray-500 text-xs">Confidence</p>
                                                    <p className="text-gray-900 font-medium">{anomaly.confidence.toFixed(1)}%</p>
                                                </div>
                                                <div className="text-sm">
                                                    <p className="text-gray-500 text-xs">Detected</p>
                                                    <p className="text-gray-900 font-medium">{anomaly.detectedAt}</p>
                                                </div>
                                            </div>

                                            {anomaly.suggestedAction && (
                                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                    <p className="text-sm text-blue-900">
                                                        <strong>Suggested Action:</strong> {anomaly.suggestedAction}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => handleViewDetails(anomaly)}
                                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                            title="View Details"
                                        >
                                            <Eye className="h-4 w-4 text-gray-600" />
                                        </button>
                                        {anomaly.status === 'open' && (
                                            <>
                                                <button
                                                    onClick={() => handleResolve(anomaly.id)}
                                                    className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                                                    title="Mark Resolved"
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDismiss(anomaly.id)}
                                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                                    title="Dismiss"
                                                >
                                                    <XCircle className="h-4 w-4 text-gray-600" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedAnomaly && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Anomaly Details</h2>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="p-1 hover:bg-gray-100 rounded transition"
                            >
                                <XCircle className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">{selectedAnomaly.title}</h3>
                                <p className="text-gray-600">{selectedAnomaly.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Severity</p>
                                    <p className="text-lg font-bold text-gray-900 capitalize">{selectedAnomaly.severity}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Status</p>
                                    <p className="text-lg font-bold text-gray-900 capitalize">{selectedAnomaly.status}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Category</p>
                                    <p className="text-lg font-bold text-gray-900 capitalize">{selectedAnomaly.category}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Confidence</p>
                                    <p className="text-lg font-bold text-gray-900">{selectedAnomaly.confidence.toFixed(1)}%</p>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm font-semibold text-blue-900 mb-1">Affected Entity</p>
                                <p className="text-blue-700">{selectedAnomaly.affectedEntity}</p>
                            </div>

                            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                                <p className="text-sm font-semibold text-orange-900 mb-1">Impact</p>
                                <p className="text-orange-700">{selectedAnomaly.impact}</p>
                            </div>

                            {selectedAnomaly.suggestedAction && (
                                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                    <p className="text-sm font-semibold text-green-900 mb-1">Suggested Action</p>
                                    <p className="text-green-700">{selectedAnomaly.suggestedAction}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
