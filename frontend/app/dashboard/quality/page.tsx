'use client';

import { useState, useEffect } from 'react';
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    Award,
    TrendingUp,
    TrendingDown,
    Plus,
    Search,
    Filter,
    Download,
    Eye,
    Edit,
    Trash2,
    FileText,
    Camera,
    ClipboardCheck,
    Package,
    Users,
    BarChart3,
    RefreshCw,
    X,
    Star
} from 'lucide-react';

interface Inspection {
    id: number;
    inspection_type: string;
    item_sku: string;
    item_name: string;
    inspector_name: string;
    status: 'passed' | 'failed' | 'pending';
    defects_found: number;
    score: number;
    created_at: string;
    notes?: string;
}

interface Defect {
    id: number;
    inspection_id: number;
    defect_type: string;
    severity: 'critical' | 'major' | 'minor';
    description: string;
    quantity: number;
    created_at: string;
}

interface Supplier {
    id: number;
    name: string;
    quality_score: number;
    total_inspections: number;
    passed_inspections: number;
    defect_rate: number;
    trend: 'up' | 'down' | 'stable';
}

export default function QualityPage() {
    const [inspections, setInspections] = useState<Inspection[]>([]);
    const [defects, setDefects] = useState<Defect[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'inspections' | 'defects' | 'suppliers' | 'analytics'>('inspections');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showInspectionModal, setShowInspectionModal] = useState(false);
    const [showDefectModal, setShowDefectModal] = useState(false);
    const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);

    // Form state
    const [inspectionForm, setInspectionForm] = useState({
        inspection_type: 'receiving',
        item_sku: '',
        item_name: '',
        inspector_name: '',
        checklist_items: [
            { item: 'Visual inspection', passed: true },
            { item: 'Quantity verification', passed: true },
            { item: 'Packaging condition', passed: true },
            { item: 'Label accuracy', passed: true }
        ],
        notes: ''
    });

    const [defectForm, setDefectForm] = useState({
        defect_type: 'damaged',
        severity: 'minor' as 'critical' | 'major' | 'minor',
        description: '',
        quantity: 1
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Simulated data - replace with actual API calls
            const mockInspections: Inspection[] = [
                {
                    id: 1,
                    inspection_type: 'Receiving',
                    item_sku: 'WIDGET-001',
                    item_name: 'Premium Widget',
                    inspector_name: 'John Smith',
                    status: 'passed',
                    defects_found: 0,
                    score: 100,
                    created_at: new Date().toISOString(),
                    notes: 'All items in perfect condition'
                },
                {
                    id: 2,
                    inspection_type: 'In-Process',
                    item_sku: 'WIDGET-002',
                    item_name: 'Standard Widget',
                    inspector_name: 'Sarah Johnson',
                    status: 'failed',
                    defects_found: 3,
                    score: 75,
                    created_at: new Date(Date.now() - 3600000).toISOString(),
                    notes: 'Minor packaging defects found'
                },
                {
                    id: 3,
                    inspection_type: 'Final',
                    item_sku: 'WIDGET-003',
                    item_name: 'Deluxe Widget',
                    inspector_name: 'Mike Davis',
                    status: 'pending',
                    defects_found: 0,
                    score: 0,
                    created_at: new Date(Date.now() - 7200000).toISOString()
                }
            ];

            const mockDefects: Defect[] = [
                {
                    id: 1,
                    inspection_id: 2,
                    defect_type: 'Damaged',
                    severity: 'minor',
                    description: 'Slight dent on packaging',
                    quantity: 2,
                    created_at: new Date().toISOString()
                },
                {
                    id: 2,
                    inspection_id: 2,
                    defect_type: 'Labeling Error',
                    severity: 'major',
                    description: 'Incorrect product code on label',
                    quantity: 1,
                    created_at: new Date().toISOString()
                }
            ];

            const mockSuppliers: Supplier[] = [
                {
                    id: 1,
                    name: 'Acme Corp',
                    quality_score: 95,
                    total_inspections: 150,
                    passed_inspections: 143,
                    defect_rate: 4.7,
                    trend: 'up'
                },
                {
                    id: 2,
                    name: 'Global Supplies Inc',
                    quality_score: 88,
                    total_inspections: 120,
                    passed_inspections: 106,
                    defect_rate: 11.7,
                    trend: 'down'
                },
                {
                    id: 3,
                    name: 'Premium Parts Ltd',
                    quality_score: 92,
                    total_inspections: 200,
                    passed_inspections: 184,
                    defect_rate: 8.0,
                    trend: 'stable'
                }
            ];

            setInspections(mockInspections);
            setDefects(mockDefects);
            setSuppliers(mockSuppliers);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate stats
    const stats = {
        totalInspections: inspections.length,
        passed: inspections.filter(i => i.status === 'passed').length,
        failed: inspections.filter(i => i.status === 'failed').length,
        pending: inspections.filter(i => i.status === 'pending').length,
        avgScore: inspections.reduce((sum, i) => sum + i.score, 0) / inspections.length || 0,
        totalDefects: defects.length
    };

    const handleCreateInspection = async () => {
        try {
            // In production, make API call
            console.log('Creating inspection:', inspectionForm);
            await fetchData();
            setShowInspectionModal(false);
        } catch (error) {
            console.error('Error creating inspection:', error);
        }
    };

    const handleReportDefect = async () => {
        try {
            // In production, make API call
            console.log('Reporting defect:', defectForm);
            await fetchData();
            setShowDefectModal(false);
        } catch (error) {
            console.error('Error reporting defect:', error);
        }
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { text: string; color: string; icon: any }> = {
            passed: { text: 'Passed', color: 'green', icon: CheckCircle },
            failed: { text: 'Failed', color: 'red', icon: XCircle },
            pending: { text: 'Pending', color: 'yellow', icon: AlertTriangle }
        };

        const badge = badges[status] || badges.pending;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                ${badge.color === 'green' ? 'bg-green-100 text-green-700' :
                    badge.color === 'red' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'}`}>
                <Icon className="h-3 w-3" />
                {badge.text}
            </span>
        );
    };

    const getSeverityBadge = (severity: string) => {
        const colors: Record<string, string> = {
            critical: 'bg-red-100 text-red-700',
            major: 'bg-orange-100 text-orange-700',
            minor: 'bg-yellow-100 text-yellow-700'
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${colors[severity]}`}>
                {severity}
            </span>
        );
    };

    const filteredInspections = inspections.filter(insp => {
        const matchesSearch =
            insp.item_sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            insp.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            insp.inspector_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || insp.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quality Control</h1>
                    <p className="text-gray-600 mt-1">Manage inspections, defects, and supplier quality</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </button>
                    <button
                        onClick={() => setShowInspectionModal(true)}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition flex items-center gap-2"
                    >
                        <Plus className="h-5 w-5" />
                        New Inspection
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Total Inspections</p>
                        <ClipboardCheck className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalInspections}</p>
                    <p className="text-xs text-gray-500 mt-1">All time</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Passed</p>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.passed}</p>
                    <p className="text-xs text-green-600 mt-1">
                        {((stats.passed / stats.totalInspections) * 100 || 0).toFixed(1)}% pass rate
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Failed</p>
                        <XCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
                    <p className="text-xs text-red-600 mt-1">Needs attention</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Pending</p>
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                    <p className="text-xs text-yellow-600 mt-1">In progress</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Avg Score</p>
                        <Award className="h-5 w-5 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.avgScore.toFixed(1)}%</p>
                    <p className="text-xs text-purple-600 mt-1 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Quality metric
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Total Defects</p>
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalDefects}</p>
                    <p className="text-xs text-orange-600 mt-1">Reported issues</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="border-b border-gray-200">
                    <div className="flex gap-4 px-6">
                        {[
                            { id: 'inspections', label: 'Inspections', icon: ClipboardCheck },
                            { id: 'defects', label: 'Defects', icon: AlertTriangle },
                            { id: 'suppliers', label: 'Suppliers', icon: Users },
                            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
                        ].map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${activeTab === tab.id
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="p-6">
                    {/* Inspections Tab - Content continues... */}
                    {activeTab === 'inspections' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search inspections..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="all">All Status</option>
                                    <option value="passed">Passed</option>
                                    <option value="failed">Failed</option>
                                    <option value="pending">Pending</option>
                                </select>
                                <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition flex items-center gap-2">
                                    <Download className="h-4 w-4" />
                                    Export
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Item</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Inspector</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Score</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Defects</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredInspections.map((inspection) => (
                                            <tr key={inspection.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-mono text-gray-900">#{inspection.id}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{inspection.inspection_type}</td>
                                                <td className="px-4 py-3">
                                                    <div className="text-sm font-medium text-gray-900">{inspection.item_name}</div>
                                                    <div className="text-xs text-gray-500">{inspection.item_sku}</div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{inspection.inspector_name}</td>
                                                <td className="px-4 py-3">{getStatusBadge(inspection.status)}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className={`h-2 rounded-full ${inspection.score >= 90 ? 'bg-green-600' :
                                                                    inspection.score >= 75 ? 'bg-blue-600' :
                                                                        inspection.score >= 60 ? 'bg-yellow-600' :
                                                                            'bg-red-600'
                                                                    }`}
                                                                style={{ width: `${inspection.score}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-semibold text-gray-900">{inspection.score}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${inspection.defects_found === 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {inspection.defects_found}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {new Date(inspection.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedInspection(inspection);
                                                            }}
                                                            className="p-1 hover:bg-gray-100 rounded transition"
                                                        >
                                                            <Eye className="h-4 w-4 text-gray-600" />
                                                        </button>
                                                        {inspection.status === 'failed' && (
                                                            <button
                                                                onClick={() => setShowDefectModal(true)}
                                                                className="p-1 hover:bg-red-50 rounded transition"
                                                            >
                                                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Other tabs content will be added in the next part */}

                    {/* Defects Tab */}
                    {activeTab === 'defects' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Defect Reports</h3>
                                <button
                                    onClick={() => setShowDefectModal(true)}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Report Defect
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {defects.map((defect) => (
                                    <div key={defect.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{defect.defect_type}</h4>
                                                <p className="text-sm text-gray-600">Inspection #{defect.inspection_id}</p>
                                            </div>
                                            {getSeverityBadge(defect.severity)}
                                        </div>
                                        <p className="text-sm text-gray-700 mb-3">{defect.description}</p>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Quantity: <span className="font-semibold">{defect.quantity}</span></span>
                                            <span className="text-gray-500">{new Date(defect.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Suppliers Tab */}
                    {activeTab === 'suppliers' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Quality Scores</h3>

                            <div className="grid grid-cols-1 gap-4">
                                {suppliers.map((supplier) => (
                                    <div key={supplier.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-900">{supplier.name}</h4>
                                                <p className="text-sm text-gray-600">Quality Performance</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-gray-900">{supplier.quality_score}%</p>
                                                    <p className="text-xs text-gray-500">Overall Score</p>
                                                </div>
                                                {supplier.trend === 'up' ? (
                                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                                ) : supplier.trend === 'down' ? (
                                                    <TrendingDown className="h-5 w-5 text-red-600" />
                                                ) : (
                                                    <div className="h-5 w-5" />
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 mb-4">
                                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                                <p className="text-sm text-gray-600">Total Inspections</p>
                                                <p className="text-xl font-bold text-blue-600">{supplier.total_inspections}</p>
                                            </div>
                                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                                <p className="text-sm text-gray-600">Passed</p>
                                                <p className="text-xl font-bold text-green-600">{supplier.passed_inspections}</p>
                                            </div>
                                            <div className="text-center p-3 bg-red-50 rounded-lg">
                                                <p className="text-sm text-gray-600">Defect Rate</p>
                                                <p className="text-xl font-bold text-red-600">{supplier.defect_rate}%</p>
                                            </div>
                                        </div>

                                        <div className="mb-2">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm text-gray-600">Pass Rate</span>
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {((supplier.passed_inspections / supplier.total_inspections) * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${supplier.quality_score >= 90 ? 'bg-green-600' :
                                                            supplier.quality_score >= 75 ? 'bg-blue-600' :
                                                                'bg-yellow-600'
                                                        }`}
                                                    style={{ width: `${(supplier.passed_inspections / supplier.total_inspections) * 100}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-2 mt-4">
                                            <button className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition">
                                                View Details
                                            </button>
                                            <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition">
                                                Generate Report
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Analytics Tab */}
                    {activeTab === 'analytics' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Inspection Type Distribution */}
                                <div className="border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5 text-blue-600" />
                                        Inspection Types
                                    </h3>
                                    <div className="space-y-3">
                                        {['Receiving', 'In-Process', 'Final'].map((type) => {
                                            const count = inspections.filter(i => i.inspection_type === type).length;
                                            const percentage = (count / inspections.length) * 100 || 0;
                                            return (
                                                <div key={type}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm font-medium text-gray-700">{type}</span>
                                                        <span className="text-sm font-semibold text-gray-900">{count}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Defect Severity Distribution */}
                                <div className="border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-red-600" />
                                        Defect Severity
                                    </h3>
                                    <div className="space-y-3">
                                        {['critical', 'major', 'minor'].map((severity) => {
                                            const count = defects.filter(d => d.severity === severity).length;
                                            const percentage = (count / defects.length) * 100 || 0;
                                            return (
                                                <div key={severity}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm font-medium text-gray-700 capitalize">{severity}</span>
                                                        <span className="text-sm font-semibold text-gray-900">{count}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full ${severity === 'critical' ? 'bg-red-600' :
                                                                    severity === 'major' ? 'bg-orange-600' :
                                                                        'bg-yellow-600'
                                                                }`}
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Quality Trends */}
                                <div className="border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-green-600" />
                                        Quality Trends
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                            <span className="text-sm font-medium text-gray-700">Pass Rate</span>
                                            <span className="text-lg font-bold text-green-600">
                                                {((stats.passed / stats.totalInspections) * 100 || 0).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                            <span className="text-sm font-medium text-gray-700">Avg Quality Score</span>
                                            <span className="text-lg font-bold text-blue-600">{stats.avgScore.toFixed(1)}%</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                            <span className="text-sm font-medium text-gray-700">Defect Rate</span>
                                            <span className="text-lg font-bold text-red-600">
                                                {((stats.totalDefects / stats.totalInspections) || 0).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Top Issues */}
                                <div className="border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Package className="h-5 w-5 text-orange-600" />
                                        Top Defect Types
                                    </h3>
                                    <div className="space-y-3">
                                        {['Damaged', 'Labeling Error', 'Wrong Item', 'Quality Issue'].map((type, index) => (
                                            <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                                                        {index + 1}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">{type}</span>
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900">{Math.floor(Math.random() * 10) + 1}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* New Inspection Modal */}
            {showInspectionModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">New Quality Inspection</h2>
                            <button
                                onClick={() => setShowInspectionModal(false)}
                                className="p-1 hover:bg-gray-100 rounded transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Type</label>
                                    <select
                                        value={inspectionForm.inspection_type}
                                        onChange={(e) => setInspectionForm({ ...inspectionForm, inspection_type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="receiving">Receiving Inspection</option>
                                        <option value="in-process">In-Process Inspection</option>
                                        <option value="final">Final Inspection</option>
                                        <option value="random">Random Inspection</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Inspector Name</label>
                                    <input
                                        type="text"
                                        value={inspectionForm.inspector_name}
                                        onChange={(e) => setInspectionForm({ ...inspectionForm, inspector_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Item SKU</label>
                                    <input
                                        type="text"
                                        value={inspectionForm.item_sku}
                                        onChange={(e) => setInspectionForm({ ...inspectionForm, item_sku: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="WIDGET-001"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                                    <input
                                        type="text"
                                        value={inspectionForm.item_name}
                                        onChange={(e) => setInspectionForm({ ...inspectionForm, item_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Premium Widget"
                                    />
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Inspection Checklist</h3>
                                <div className="space-y-2">
                                    {inspectionForm.checklist_items.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm text-gray-700">{item.item}</span>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={item.passed}
                                                    onChange={(e) => {
                                                        const newItems = [...inspectionForm.checklist_items];
                                                        newItems[index].passed = e.target.checked;
                                                        setInspectionForm({ ...inspectionForm, checklist_items: newItems });
                                                    }}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                                />
                                                <span className={`text-sm font-medium ${item.passed ? 'text-green-600' : 'text-red-600'}`}>
                                                    {item.passed ? 'Pass' : 'Fail'}
                                                </span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea
                                    value={inspectionForm.notes}
                                    onChange={(e) => setInspectionForm({ ...inspectionForm, notes: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Additional notes..."
                                />
                            </div>

                            <div className="flex gap-2">
                                <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition">
                                    <Camera className="h-4 w-4" />
                                    Add Photos
                                </button>
                                <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition">
                                    <FileText className="h-4 w-4" />
                                    Attach Documents
                                </button>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => setShowInspectionModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateInspection}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                            >
                                Create Inspection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Report Defect Modal */}
            {showDefectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Report Defect</h2>
                            <button
                                onClick={() => setShowDefectModal(false)}
                                className="p-1 hover:bg-gray-100 rounded transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Defect Type</label>
                                <select
                                    value={defectForm.defect_type}
                                    onChange={(e) => setDefectForm({ ...defectForm, defect_type: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="damaged">Damaged</option>
                                    <option value="labeling_error">Labeling Error</option>
                                    <option value="wrong_item">Wrong Item</option>
                                    <option value="quality_issue">Quality Issue</option>
                                    <option value="missing_parts">Missing Parts</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                                <select
                                    value={defectForm.severity}
                                    onChange={(e) => setDefectForm({ ...defectForm, severity: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="minor">Minor</option>
                                    <option value="major">Major</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Affected</label>
                                <input
                                    type="number"
                                    value={defectForm.quantity}
                                    onChange={(e) => setDefectForm({ ...defectForm, quantity: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    min="1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={defectForm.description}
                                    onChange={(e) => setDefectForm({ ...defectForm, description: e.target.value })}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Describe the defect..."
                                />
                            </div>

                            <button className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition">
                                <Camera className="h-4 w-4" />
                                Add Photos
                            </button>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => setShowDefectModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReportDefect}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                            >
                                Report Defect
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
