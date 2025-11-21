'use client';

import { useEffect, useState } from 'react';
import { orders } from '@/lib/api';
import { Package, Truck, CheckCircle, XCircle, Clock, Plus, Search, Filter, ShoppingCart } from 'lucide-react';

export default function OrdersPage() {
    const [orderList, setOrderList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

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
            case 'pending': return 'text-yellow-400 bg-yellow-400/10';
            case 'processing': return 'text-blue-400 bg-blue-400/10';
            case 'shipped': return 'text-purple-400 bg-purple-400/10';
            case 'delivered': return 'text-green-400 bg-green-400/10';
            case 'cancelled': return 'text-red-400 bg-red-400/10';
            default: return 'text-gray-400 bg-gray-400/10';
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

    const filteredOrders = filter === 'all'
        ? orderList
        : orderList.filter(o => o.status === filter);

    return (
        <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShoppingCart className="h-6 w-6 text-purple-400" />
                        Order Management
                    </h1>
                    <p className="text-gray-400 mt-1">Track and manage customer orders</p>
                </div>
                <button
                    onClick={createDemoOrder}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition shadow-lg shadow-purple-900/20"
                >
                    <Plus className="h-4 w-4" /> New Order
                </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition ${filter === status
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Orders Table */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-900/50 text-gray-400 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        Loading orders...
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No orders found.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-750 transition">
                                        <td className="px-6 py-4 font-medium text-purple-400">#{order.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{order.customer_name}</div>
                                            <div className="text-xs text-gray-500">{order.customer_email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-white">
                                            ${order.total_amount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                <span className="capitalize">{order.status}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-sm text-gray-400 hover:text-white transition">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
