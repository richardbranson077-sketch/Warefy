'use client';

import { useState } from 'react';
import {
    RotateCcw,
    Plus,
    Search,
    Filter,
    Download,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    Package,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    BarChart3,
    FileText,
    Trash2,
    RefreshCw,
    Camera,
    MessageSquare,
    DollarSign,
    X
} from 'lucide-react';
import { useReturns } from '@/hooks/useReturns';
import { ReturnRequest } from '@/services/returns.service';
import { LoadingSpinner } from '@/components/LoadingStates';
import { ErrorAlert } from '@/components/ErrorStates';

export default function ReturnsPage() {
    const { data: returns, loading, error, refetch, createReturn, approveReturn, rejectReturn } = useReturns();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showInspectionModal, setShowInspectionModal] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Form state
    const [formData, setFormData] = useState({
        orderId: 0,
        customerName: '',
        customerEmail: '',
        reason: 'defective',
        notes: '',
        items: [{ sku: '', productName: '', quantity: 1, reason: 'defective' }]
    });



    // Filter returns
    const filteredReturns = returns.filter(ret => {
        const matchesSearch =
            ret.rmaNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ret.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ret.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || ret.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filteredReturns.length / itemsPerPage);
    const paginatedReturns = filteredReturns.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Stats
    const stats = {
        total: returns.length,
        pending: returns.filter(r => r.status === 'pending_approval').length,
        approved: returns.filter(r => r.status === 'approved').length,
        completed: returns.filter(r => r.status === 'completed').length,
        totalRefunds: returns.reduce((sum, r) => sum + (r.refundAmount || 0), 0)
    };

    const handleCreateReturn = () => {
        setFormData({
            order_id: '',
            customer_name: '',
            customer_email: '',
            reason: 'defective',
            notes: '',
            items: [{ sku: '', product_name: '', quantity: 1, reason: 'defective' }]
        });
        setShowCreateModal(true);
    };

    const handleSubmitReturn = async () => {
        try {
            // In production, make API call to create return
            console.log('Creating return:', formData);
            await refetch();
            setShowCreateModal(false);
        } catch (error) {
            console.error('Error creating return:', error);
        }
    };

    const handleApprove = async (returnId: number) => {
        try {
            // In production, make API call
            console.log('Approving return:', returnId);
            await refetch();
        } catch (error) {
            console.error('Error approving return:', error);
        }
    };

    const handleReject = async (returnId: number) => {
        if (confirm('Are you sure you want to reject this return?')) {
            try {
                // In production, make API call
                console.log('Rejecting return:', returnId);
                await refetch();
            } catch (error) {
                console.error('Error rejecting return:', error);
            }
        }
    };

    const handleInspect = (returnItem: Return) => {
        setSelectedReturn(returnItem);
        setShowInspectionModal(true);
    };

    const handleCompleteInspection = async () => {
        try {
            // In production, make API call
            console.log('Completing inspection:', selectedReturn);
            await refetch();
            setShowInspectionModal(false);
        } catch (error) {
            console.error('Error completing inspection:', error);
        }
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { text: string; color: string; icon: any }> = {
            pending_approval: { text: 'Pending Approval', color: 'yellow', icon: Clock },
            approved: { text: 'Approved', color: 'blue', icon: CheckCircle },
            rejected: { text: 'Rejected', color: 'red', icon: XCircle },
            in_transit: { text: 'In Transit', color: 'purple', icon: Package },
            received: { text: 'Received', color: 'indigo', icon: Package },
            inspected: { text: 'Inspected', color: 'green', icon: Eye },
            completed: { text: 'Completed', color: 'green', icon: CheckCircle }
        };

        const badge = badges[status] || badges.pending_approval;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                ${badge.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                    badge.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                        badge.color === 'red' ? 'bg-red-100 text-red-700' :
                            badge.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                                badge.color === 'indigo' ? 'bg-indigo-100 text-indigo-700' :
                                    'bg-green-100 text-green-700'}`}>
                <Icon className="h-3 w-3" />
                {badge.text}
            </span>
        );
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { sku: '', product_name: '', quantity: 1, reason: 'defective' }]
        });
    };

    const removeItem = (index: number) => {
        setFormData({
            ...formData,
            items: formData.items.filter((_, i) => i !== index)
        });
    };

    return (
        <>
            {loading && <LoadingSpinner />}
            {error && <ErrorAlert message={error} />}
            {!loading && !error && (
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Returns Management</h1>
                            <p className="text-gray-600 mt-1">Manage RMAs, approvals, and inspections</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={fetchReturns}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Refresh
                            </button>
                            <button
                                onClick={handleCreateReturn}
                                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition flex items-center gap-2"
                            >
                                <Plus className="h-5 w-5" />
                                Create RMA
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600">Total Returns</p>
                                <RotateCcw className="h-5 w-5 text-blue-600" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            <p className="text-xs text-gray-500 mt-1">All time</p>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600">Pending Approval</p>
                                <Clock className="h-5 w-5 text-yellow-600" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                            <p className="text-xs text-yellow-600 mt-1">Requires action</p>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600">Approved</p>
                                <CheckCircle className="h-5 w-5 text-blue-600" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                            <p className="text-xs text-blue-600 mt-1">In process</p>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600">Completed</p>
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                            <p className="text-xs text-green-600 mt-1">Processed</p>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600">Total Refunds</p>
                                <DollarSign className="h-5 w-5 text-red-600" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">${stats.totalRefunds.toFixed(2)}</p>
                            <p className="text-xs text-red-600 mt-1 flex items-center">
                                <TrendingDown className="h-3 w-3 mr-1" />
                                Cost impact
                            </p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search RMA, customer..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending_approval">Pending Approval</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="in_transit">In Transit</option>
                                <option value="received">Received</option>
                                <option value="inspected">Inspected</option>
                                <option value="completed">Completed</option>
                            </select>

                            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2">
                                <Download className="h-4 w-4" />
                                Export Report
                            </button>
                        </div>
                    </div>

                    {/* Returns Table */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">RMA #</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Order ID</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Reason</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Items</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                                Loading returns...
                                            </td>
                                        </tr>
                                    ) : paginatedReturns.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                                No returns found
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedReturns.map((ret) => (
                                            <tr key={ret.id} className="hover:bg-gray-50 transition">
                                                <td className="px-4 py-3 text-sm font-mono font-medium text-blue-600">
                                                    {ret.rmaNumber}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-sm font-medium text-gray-900">{ret.customerName}</div>
                                                    <div className="text-xs text-gray-500">{ret.customerEmail}</div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">#{ret.orderId}</td>
                                                <td className="px-4 py-3">
                                                    <span className="px-2 py-1 bg-gray-100 rounded text-xs capitalize">
                                                        {ret.reason.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{ret.items.length}</td>
                                                <td className="px-4 py-3">{getStatusBadge(ret.status)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {new Date(ret.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedReturn(ret);
                                                                setShowDetailsModal(true);
                                                            }}
                                                            className="p-1 hover:bg-gray-100 rounded transition"
                                                            title="View Details"
                                                        >
                                                            <Eye className="h-4 w-4 text-gray-600" />
                                                        </button>
                                                        {ret.status === 'pending_approval' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApprove(ret.id)}
                                                                    className="p-1 hover:bg-green-50 rounded transition"
                                                                    title="Approve"
                                                                >
                                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReject(ret.id)}
                                                                    className="p-1 hover:bg-red-50 rounded transition"
                                                                    title="Reject"
                                                                >
                                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                                </button>
                                                            </>
                                                        )}
                                                        {ret.status === 'received' && (
                                                            <button
                                                                onClick={() => handleInspect(ret)}
                                                                className="p-1 hover:bg-blue-50 rounded transition"
                                                                title="Inspect"
                                                            >
                                                                <Eye className="h-4 w-4 text-blue-600" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredReturns.length)} of {filteredReturns.length} returns
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                                    >
                                        Previous
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-3 py-1 border rounded-lg text-sm transition ${currentPage === page
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Create RMA Modal */}
                    {showCreateModal && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900">Create New RMA</h2>
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="p-1 hover:bg-gray-100 rounded transition"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
                                            <input
                                                type="text"
                                                value={formData.orderId}
                                                onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="Enter order ID"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Return Reason</label>
                                            <select
                                                value={formData.reason}
                                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            >
                                                <option value="defective">Defective</option>
                                                <option value="wrong_item">Wrong Item</option>
                                                <option value="not_as_described">Not as Described</option>
                                                <option value="damaged">Damaged in Transit</option>
                                                <option value="changed_mind">Changed Mind</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                                            <input
                                                type="text"
                                                value={formData.customerName}
                                                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email</label>
                                            <input
                                                type="email"
                                                value={formData.customerEmail}
                                                onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Additional notes..."
                                        />
                                    </div>

                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-sm font-semibold text-gray-900">Return Items</h3>
                                            <button
                                                onClick={addItem}
                                                className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                                            >
                                                Add Item
                                            </button>
                                        </div>

                                        {formData.items.map((item, index) => (
                                            <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                                                <input
                                                    type="text"
                                                    placeholder="SKU"
                                                    value={item.sku}
                                                    onChange={(e) => {
                                                        const newItems = [...formData.items];
                                                        newItems[index].sku = e.target.value;
                                                        setFormData({ ...formData, items: newItems });
                                                    }}
                                                    className="col-span-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Product Name"
                                                    value={item.productName}
                                                    onChange={(e) => {
                                                        const newItems = [...formData.items];
                                                        newItems[index].productName = e.target.value;
                                                        setFormData({ ...formData, items: newItems });
                                                    }}
                                                    className="col-span-4 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Qty"
                                                    value={item.quantity}
                                                    onChange={(e) => {
                                                        const newItems = [...formData.items];
                                                        newItems[index].quantity = parseInt(e.target.value);
                                                        setFormData({ ...formData, items: newItems });
                                                    }}
                                                    className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                />
                                                <select
                                                    value={item.reason}
                                                    onChange={(e) => {
                                                        const newItems = [...formData.items];
                                                        newItems[index].reason = e.target.value;
                                                        setFormData({ ...formData, items: newItems });
                                                    }}
                                                    className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                >
                                                    <option value="defective">Defective</option>
                                                    <option value="wrong_item">Wrong Item</option>
                                                    <option value="damaged">Damaged</option>
                                                </select>
                                                <button
                                                    onClick={() => removeItem(index)}
                                                    className="col-span-1 p-2 hover:bg-red-50 rounded transition"
                                                    disabled={formData.items.length === 1}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmitReturn}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                                    >
                                        Create RMA
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Details Modal */}
                    {showDetailsModal && selectedReturn && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl max-w-2xl w-full">
                                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900">RMA Details</h2>
                                    <button
                                        onClick={() => setShowDetailsModal(false)}
                                        className="p-1 hover:bg-gray-100 rounded transition"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">RMA Number</p>
                                            <p className="text-lg font-mono font-semibold text-blue-600">{selectedReturn.rmaNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Status</p>
                                            {getStatusBadge(selectedReturn.status)}
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Customer</p>
                                            <p className="text-lg font-semibold text-gray-900">{selectedReturn.customerName}</p>
                                            <p className="text-sm text-gray-500">{selectedReturn.customerEmail}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Order ID</p>
                                            <p className="text-lg font-semibold text-gray-900">#{selectedReturn.orderId}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Return Reason</p>
                                            <p className="text-lg capitalize text-gray-900">{selectedReturn.reason.replace('_', ' ')}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Created Date</p>
                                            <p className="text-lg text-gray-900">{new Date(selectedReturn.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 pt-4">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Return Items</h3>
                                        <div className="space-y-2">
                                            {selectedReturn.items.map((item) => (
                                                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{item.productName}</p>
                                                        <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-900">Qty: {item.quantity}</p>
                                                        {item.disposition && (
                                                            <p className="text-xs text-green-600 capitalize">{item.disposition}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {selectedReturn.refundAmount && (
                                        <div className="border-t border-gray-200 pt-4">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-gray-600">Refund Amount</p>
                                                <p className="text-2xl font-bold text-green-600">${selectedReturn.refundAmount.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Inspection Modal */}
                    {showInspectionModal && selectedReturn && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl max-w-2xl w-full">
                                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900">Inspect Return - {selectedReturn.rmaNumber}</h2>
                                    <button
                                        onClick={() => setShowInspectionModal(false)}
                                        className="p-1 hover:bg-gray-100 rounded transition"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-4">
                                    {selectedReturn.items.map((item, index) => (
                                        <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{item.productName}</p>
                                                    <p className="text-sm text-gray-600">SKU: {item.sku} | Qty: {item.quantity}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                                        <option value="excellent">Excellent</option>
                                                        <option value="good">Good</option>
                                                        <option value="fair">Fair</option>
                                                        <option value="poor">Poor</option>
                                                        <option value="damaged">Damaged</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Disposition</label>
                                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                                        <option value="restock">Restock</option>
                                                        <option value="refurbish">Refurbish</option>
                                                        <option value="scrap">Scrap</option>
                                                        <option value="return_to_vendor">Return to Vendor</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="mt-3">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Notes</label>
                                                <textarea
                                                    rows={2}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                    placeholder="Add inspection notes..."
                                                />
                                            </div>

                                            <div className="mt-3">
                                                <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition">
                                                    <Camera className="h-4 w-4" />
                                                    Add Photos
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Refund Amount</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="0.00"
                                        />
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
                                        onClick={handleCompleteInspection}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                                    >
                                        Complete Inspection
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
