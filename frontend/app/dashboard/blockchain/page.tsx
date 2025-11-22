'use client';

import { useState } from 'react';
import {
    Shield,
    Lock,
    FileText,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Search,
    Filter,
    Download,
    Eye,
    Clock,
    User,
    Activity,
    Database,
    Key,
    Hash,
    Link2,
    Fingerprint,
    ShieldCheck,
    AlertCircle,
    TrendingUp,
    BarChart3,
    Calendar,
    RefreshCw,
    Settings,
    Zap,
    Package,
    Truck,
    DollarSign
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AuditLog {
    id: string;
    timestamp: Date;
    action: string;
    user: string;
    resource: string;
    status: 'success' | 'warning' | 'error';
    blockchainHash: string;
    verified: boolean;
    ipAddress: string;
    details: string;
}

interface BlockchainBlock {
    id: number;
    hash: string;
    previousHash: string;
    timestamp: Date;
    transactions: number;
    verified: boolean;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

export default function AuditPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    const auditLogs: AuditLog[] = [
        {
            id: '1',
            timestamp: new Date(Date.now() - 300000),
            action: 'Inventory Update',
            user: 'John Doe',
            resource: 'SKU-001',
            status: 'success',
            blockchainHash: '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385',
            verified: true,
            ipAddress: '192.168.1.100',
            details: 'Updated stock quantity from 150 to 145 units'
        },
        {
            id: '2',
            timestamp: new Date(Date.now() - 600000),
            action: 'Order Created',
            user: 'Jane Smith',
            resource: 'Order #1247',
            status: 'success',
            blockchainHash: '0x8a0fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a92486',
            verified: true,
            ipAddress: '192.168.1.101',
            details: 'New order created for customer C-5678'
        },
        {
            id: '3',
            timestamp: new Date(Date.now() - 900000),
            action: 'Route Optimization',
            user: 'Mike Johnson',
            resource: 'Route NY-101',
            status: 'warning',
            blockchainHash: '0x9b1fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a93587',
            verified: true,
            ipAddress: '192.168.1.102',
            details: 'Route optimized with 15% efficiency gain'
        },
        {
            id: '4',
            timestamp: new Date(Date.now() - 1200000),
            action: 'Failed Login Attempt',
            user: 'Unknown',
            resource: 'Auth System',
            status: 'error',
            blockchainHash: '0xac2fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a94688',
            verified: true,
            ipAddress: '203.45.67.89',
            details: 'Multiple failed login attempts detected'
        },
        {
            id: '5',
            timestamp: new Date(Date.now() - 1800000),
            action: 'Price Update',
            user: 'Sarah Wilson',
            resource: 'SKU-002',
            status: 'success',
            blockchainHash: '0xbd3fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a95789',
            verified: true,
            ipAddress: '192.168.1.103',
            details: 'Product price updated from $99.99 to $89.99'
        }
    ];

    const blockchainBlocks: BlockchainBlock[] = [
        {
            id: 1,
            hash: '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385',
            previousHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
            timestamp: new Date(Date.now() - 3600000),
            transactions: 45,
            verified: true
        },
        {
            id: 2,
            hash: '0x8a0fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a92486',
            previousHash: '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385',
            timestamp: new Date(Date.now() - 1800000),
            transactions: 38,
            verified: true
        },
        {
            id: 3,
            hash: '0x9b1fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a93587',
            previousHash: '0x8a0fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a92486',
            timestamp: new Date(Date.now() - 900000),
            transactions: 52,
            verified: true
        }
    ];

    const activityData = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        events: Math.floor(Math.random() * 50) + 10
    }));

    const statusDistribution = [
        { name: 'Success', value: 856 },
        { name: 'Warning', value: 124 },
        { name: 'Error', value: 43 },
        { name: 'Pending', value: 15 }
    ];

    const filteredLogs = auditLogs.filter(log => {
        const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
        const matchesSearch = searchQuery === '' ||
            log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.resource.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return 'bg-green-100 text-green-700 border-green-200';
            case 'warning': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'error': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success': return <CheckCircle className="h-4 w-4" />;
            case 'warning': return <AlertTriangle className="h-4 w-4" />;
            case 'error': return <XCircle className="h-4 w-4" />;
            default: return <AlertCircle className="h-4 w-4" />;
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                            <Shield className="h-7 w-7 text-white" />
                        </div>
                        Blockchain Audit Trail
                    </h1>
                    <p className="text-gray-600 mt-2">Immutable security logs with blockchain verification</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                        <Download className="h-5 w-5" />
                        Export Logs
                    </button>
                    <button className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm transition flex items-center gap-2">
                        <RefreshCw className="h-5 w-5" />
                        Verify Chain
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-600 uppercase font-semibold">Total Events</p>
                        <Activity className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">1,038</p>
                    <p className="text-xs text-green-600 mt-1">+12% this week</p>
                </div>

                <div className="bg-green-50 rounded-xl border border-green-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-green-700 uppercase font-semibold">Verified</p>
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-900">100%</p>
                    <p className="text-xs text-green-600 mt-1">All blocks verified</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-600 uppercase font-semibold">Blocks</p>
                        <Database className="h-4 w-4 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{blockchainBlocks.length}</p>
                    <p className="text-xs text-gray-600 mt-1">in chain</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-600 uppercase font-semibold">Security Score</p>
                        <Lock className="h-4 w-4 text-indigo-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">98.5</p>
                    <p className="text-xs text-green-600 mt-1">Excellent</p>
                </div>

                <div className="bg-red-50 rounded-xl border border-red-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-red-700 uppercase font-semibold">Threats</p>
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                    <p className="text-2xl font-bold text-red-900">3</p>
                    <p className="text-xs text-red-600 mt-1">blocked today</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-600" />
                        Audit Activity (24 Hours)
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={activityData}>
                            <defs>
                                <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="hour" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                            <Area type="monotone" dataKey="events" stroke="#10b981" fillOpacity={1} fill="url(#colorEvents)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-purple-600" />
                        Event Status
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={statusDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {statusDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        {statusDistribution.map((item, index) => (
                            <div key={item.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                                <span className="text-xs text-gray-600">{item.name}: {item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Blockchain Blocks */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Link2 className="h-5 w-5 text-green-600" />
                    Blockchain Verification
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {blockchainBlocks.map((block, index) => (
                        <div key={block.id} className="flex items-center gap-4">
                            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 min-w-[280px]">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-bold text-gray-900">Block #{block.id}</span>
                                    {block.verified && (
                                        <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                                            <ShieldCheck className="h-4 w-4" />
                                            Verified
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-2 text-xs">
                                    <div>
                                        <p className="text-gray-500 mb-1">Hash</p>
                                        <p className="font-mono text-gray-900 truncate">{block.hash.substring(0, 20)}...</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-1">Previous Hash</p>
                                        <p className="font-mono text-gray-900 truncate">{block.previousHash.substring(0, 20)}...</p>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-green-200">
                                        <span className="text-gray-600">{block.transactions} transactions</span>
                                        <span className="text-gray-600">{block.timestamp.toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            </div>
                            {index < blockchainBlocks.length - 1 && (
                                <ChevronRight className="h-6 w-6 text-green-600 flex-shrink-0" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search logs by action, user, or resource..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="success">Success</option>
                        <option value="warning">Warning</option>
                        <option value="error">Error</option>
                    </select>
                </div>
            </div>

            {/* Audit Logs */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-green-600" />
                        Audit Logs ({filteredLogs.length})
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Timestamp</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Resource</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Blockchain</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredLogs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {log.timestamp.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        {log.action}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {log.user}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {log.resource}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 w-fit ${getStatusColor(log.status)}`}>
                                            {getStatusIcon(log.status)}
                                            {log.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {log.verified ? (
                                            <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                                                <ShieldCheck className="h-4 w-4" />
                                                Verified
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-xs font-bold text-gray-400">
                                                <Clock className="h-4 w-4" />
                                                Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => setSelectedLog(log)}
                                            className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Log Details Modal */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedLog(null)}>
                    <div className="bg-white rounded-xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Audit Log Details</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 w-fit ${getStatusColor(selectedLog.status)}`}>
                                        {getStatusIcon(selectedLog.status)}
                                        {selectedLog.status}
                                    </span>
                                </div>
                                <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Action</p>
                                    <p className="font-semibold text-gray-900">{selectedLog.action}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">User</p>
                                    <p className="font-semibold text-gray-900">{selectedLog.user}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Resource</p>
                                    <p className="font-semibold text-gray-900">{selectedLog.resource}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">IP Address</p>
                                    <p className="font-semibold text-gray-900">{selectedLog.ipAddress}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Timestamp</p>
                                <p className="font-semibold text-gray-900">{selectedLog.timestamp.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Blockchain Hash</p>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <p className="font-mono text-xs text-gray-900 break-all">{selectedLog.blockchainHash}</p>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <ShieldCheck className="h-5 w-5 text-green-600" />
                                    <span className="text-sm font-semibold text-green-600">Blockchain Verified</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Details</p>
                                <p className="text-gray-900">{selectedLog.details}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
