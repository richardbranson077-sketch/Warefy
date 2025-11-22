'use client';

import { useEffect, useState } from 'react';
import { orders } from '@/lib/api';
import {
    Package,
    Truck,
    CheckCircle,
    XCircle,
    Clock,
    Plus,
    Search,
    Filter,
    ShoppingCart,
    Download,
    Eye,
    Edit,
    Trash2,
    MapPin,
    User,
    Mail,
    Phone,
    Calendar,
    DollarSign,
    TrendingUp,
    AlertCircle,
    X,
    ChevronDown,
    MoreVertical,
    RefreshCw
} from 'lucide-react';

export default function OrdersPage() {
    const [orderList, setOrderList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [sortBy, setSortBy] = useState<'date' | 'amount' | 'customer'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await orders.getAll();
            setOrderList(data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const createDemoOrder = async () => {
        try {
            await orders.create({
                customer_name: 'Demo Customer ' + Math.floor(Math.random() * 1000),
                customer_email: 'demo@example.com',
                shipping_address: '123 Demo St, Tech City',
                status: 'pending',
                items: [
                    { sku: 'WIDGET-001', quantity: 2, unit_price: 49.99 },
                    { sku: 'GADGET-002', quantity: 1, unit_price: 199.99 }
                ]
            });
            fetchOrders();
        } catch (error) {
            console.error('Failed to create order:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'processing': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'shipped': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
            case 'delivered': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="h-4 w-4" />;
            case 'processing': return <Package className="h-4 w-4" />;
            case 'shipped': return <Truck className="h-4 w-4" />;
            case 'delivered': return <CheckCircle className="h-4 w-4" />;
            case 'cancelled': return <XCircle className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    const filteredOrders = orderList
        .filter(o => filter === 'all' || o.status === filter)
        .filter(o =>
            searchQuery === '' ||
            o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.id.toString().includes(searchQuery)
        )
        .sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'date') {
                comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            } else if (sortBy === 'amount') {
                comparison = a.total_amount - b.total_amount;
            } else if (sortBy === 'customer') {
                comparison = a.customer_name.localeCompare(b.customer_name);
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

    const toggleSelectOrder = (orderId: number) => {
        setSelectedOrders(prev =>
            prev.includes(orderId)
                ? prev.filter(id => id !== orderId)
                : [...prev, orderId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedOrders.length === filteredOrders.length) {
            setSelectedOrders([]);
        } else {
            setSelectedOrders(filteredOrders.map(o => o.id));
        }
    };

    const exportToCSV = () => {
        const headers = ['Order ID', 'Customer', 'Email', 'Date', 'Total', 'Status'];
        const rows = filteredOrders.map(o => [
            o.id,
            o.customer_name,
            o.customer_email,
            new Date(o.created_at).toLocaleDateString(),
            o.total_amount.toFixed(2),
            o.status
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const orderStats = {
        total: orderList.length,
        pending: orderList.filter(o => o.status === 'pending').length,
        processing: orderList.filter(o => o.status === 'processing').length,
        shipped: orderList.filter(o => o.status === 'shipped').length,
        delivered: orderList.filter(o => o.status === 'delivered').length,
        totalRevenue: orderList.reduce((sum, o) => sum + o.total_amount, 0),
        avgOrderValue: orderList.length > 0 ? orderList.reduce((sum, o) => sum + o.total_amount, 0) / orderList.length : 0
    };

    return (
        <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <ShoppingCart className="h-8 w-8 text-purple-400" />
                        Order Management
                    </h1>
                    <p className="text-gray-400 mt-1">Track and manage customer orders across your supply chain</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchOrders}
                        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition border border-gray-700"
                    >
                        <RefreshCw className="h-4 w-4" /> Refresh
                    </button>
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition border border-gray-700"
                    >
                        <Download className="h-4 w-4" /> Export
                    </button>
                    <button
                        onClick={createDemoOrder}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition shadow-lg shadow-purple-900/20"
                    >
                        <Plus className="h-4 w-4" /> New Order
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                    <div className="text-gray-400 text-xs uppercase font-semibold mb-1">Total Orders</div>
                    <div className="text-2xl font-bold text-white">{orderStats.total}</div>
                </div>
                <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-4">
                    <div className="text-yellow-400 text-xs uppercase font-semibold mb-1">Pending</div>
                    <div className="text-2xl font-bold text-yellow-400">{orderStats.pending}</div>
                </div>
                <div className="bg-blue-400/10 border border-blue-400/20 rounded-xl p-4">
                    <div className="text-blue-400 text-xs uppercase font-semibold mb-1">Processing</div>
                    <div className="text-2xl font-bold text-blue-400">{orderStats.processing}</div>
                </div>
                <div className="bg-purple-400/10 border border-purple-400/20 rounded-xl p-4">
                    <div className="text-purple-400 text-xs uppercase font-semibold mb-1">Shipped</div>
                    <div className="text-2xl font-bold text-purple-400">{orderStats.shipped}</div>
                </div>
                <div className="bg-green-400/10 border border-green-400/20 rounded-xl p-4">
                    <div className="text-green-400 text-xs uppercase font-semibold mb-1">Delivered</div>
                    <div className="text-2xl font-bold text-green-400">{orderStats.delivered}</div>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                    <div className="text-gray-400 text-xs uppercase font-semibold mb-1">Total Revenue</div>
                    <div className="text-2xl font-bold text-white">${orderStats.totalRevenue.toFixed(0)}</div>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                    <div className="text-gray-400 text-xs uppercase font-semibold mb-1">Avg Order</div>
                    <div className="text-2xl font-bold text-white">${orderStats.avgOrderValue.toFixed(0)}</div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by order ID, customer name, or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="date">Sort by Date</option>
                        <option value="amount">Sort by Amount</option>
                        <option value="customer">Sort by Customer</option>
                    </select>
                    <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition"
                    >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                </div>
            </div>

            {/* Status Filters */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition whitespace-nowrap ${filter === status
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                            }`}
                    >
                        {status} {status !== 'all' && `(${orderList.filter(o => o.status === status).length})`}
                    </button>
                ))}
            </div>

            {/* Bulk Actions */}
            {selectedOrders.length > 0 && (
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-6 flex items-center justify-between">
                    <span className="text-purple-300 font-medium">
                        {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected
                    </span>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition">
                            Update Status
                        </button>
                        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition">
                            Export Selected
                        </button>
                        <button
                            onClick={() => setSelectedOrders([])}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}

            {/* Orders Table */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-900/50 text-gray-400 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                                        onChange={toggleSelectAll}
                                        className="rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                                    />
                                </th>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Items</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <RefreshCw className="h-8 w-8 animate-spin text-purple-400" />
                                            <span>Loading orders...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <Package className="h-12 w-12 text-gray-600" />
                                            <span className="text-lg">No orders found</span>
                                            <span className="text-sm">Try adjusting your filters or search query</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-750 transition group">
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedOrders.includes(order.id)}
                                                onChange={() => toggleSelectOrder(order.id)}
                                                className="rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-bold text-purple-400">#{order.id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center">
                                                    <User className="h-5 w-5 text-purple-400" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">{order.customer_name}</div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        {order.customer_email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Calendar className="h-4 w-4" />
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(order.created_at).toLocaleTimeString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">
                                            {order.items?.length || 0} items
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 font-bold text-white">
                                                <DollarSign className="h-4 w-4 text-green-400" />
                                                {order.total_amount.toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                <span className="capitalize">{order.status}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                                                <button
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setShowDetailsModal(true);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-700 rounded-lg transition"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition"
                                                    title="Edit Order"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition"
                                                    title="Delete Order"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Details Modal */}
            {showDetailsModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Package className="h-6 w-6 text-purple-400" />
                                    Order #{selectedOrder.id}
                                </h2>
                                <p className="text-gray-400 text-sm mt-1">
                                    Created on {new Date(selectedOrder.created_at).toLocaleString()}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="p-2 hover:bg-gray-700 rounded-lg transition"
                            >
                                <X className="h-6 w-6 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Customer Info */}
                            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Customer Information</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-white">
                                        <User className="h-4 w-4 text-purple-400" />
                                        {selectedOrder.customer_name}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Mail className="h-4 w-4 text-purple-400" />
                                        {selectedOrder.customer_email}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <MapPin className="h-4 w-4 text-purple-400" />
                                        {selectedOrder.shipping_address}
                                    </div>
                                </div>
                            </div>

                            {/* Order Status */}
                            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Order Status</h3>
                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border ${getStatusColor(selectedOrder.status)}`}>
                                    {getStatusIcon(selectedOrder.status)}
                                    <span className="capitalize">{selectedOrder.status}</span>
                                </span>
                            </div>

                            {/* Order Items */}
                            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Order Items</h3>
                                <div className="space-y-2">
                                    {selectedOrder.items?.map((item: any, index: number) => (
                                        <div key={index} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                                            <div>
                                                <div className="font-medium text-white">{item.sku}</div>
                                                <div className="text-sm text-gray-400">Quantity: {item.quantity}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-white">${(item.quantity * item.unit_price).toFixed(2)}</div>
                                                <div className="text-sm text-gray-400">${item.unit_price} each</div>
                                            </div>
                                        </div>
                                    )) || <p className="text-gray-500">No items</p>}
                                </div>
                            </div>

                            {/* Order Total */}
                            <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold text-purple-300">Total Amount</span>
                                    <span className="text-2xl font-bold text-white">${selectedOrder.total_amount.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition">
                                    Update Status
                                </button>
                                <button className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition">
                                    Print Invoice
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
