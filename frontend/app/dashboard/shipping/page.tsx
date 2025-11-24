'use client';

import { useState } from 'react';
import { useShipping } from '@/hooks/useShipping';
import { Shipment } from '@/services/shipping.service';
import { LoadingSpinner } from '@/components/LoadingStates';
import { ErrorAlert } from '@/components/ErrorStates';
import {
    Truck,
    Package,
    MapPin,
    Clock,
    CheckCircle,
    AlertCircle,
    Search,
    Filter,
    Plus,
    Eye,
    Download,
    RefreshCw
} from 'lucide-react';

export default function ShippingPage() {
    const { data: shipments, loading, error, refetch, createShipment, updateShipment } = useShipping();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Filter shipments
    const filteredShipments = (shipments || []).filter(shipment => {
        const matchesSearch = shipment.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shipment.carrier?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Stats
    const stats = {
        total: shipments?.length || 0,
        inTransit: shipments?.filter(s => s.status === 'in_transit').length || 0,
        delivered: shipments?.filter(s => s.status === 'delivered').length || 0,
        pending: shipments?.filter(s => s.status === 'pending').length || 0
    };

    return (
        <>
            {loading && <LoadingSpinner />}
            {error && <ErrorAlert message={error} />}
            {!loading && !error && (
                <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <Truck className="h-8 w-8 text-blue-400" />
                                Shipping Management
                            </h1>
                            <p className="text-gray-400 mt-1">Track and manage shipments</p>
                        </div>
                        <button
                            onClick={() => refetch()}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Total Shipments</p>
                                <Package className="h-5 w-5 text-blue-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">In Transit</p>
                                <Truck className="h-5 w-5 text-yellow-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.inTransit}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Delivered</p>
                                <CheckCircle className="h-5 w-5 text-green-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.delivered}</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-400">Pending</p>
                                <Clock className="h-5 w-5 text-orange-400" />
                            </div>
                            <p className="text-2xl font-bold">{stats.pending}</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search tracking number, carrier..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="in_transit">In Transit</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    {/* Shipments Table */}
                    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-750 border-b border-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Tracking #</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Carrier</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Origin</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Destination</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {filteredShipments.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                                                No shipments found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredShipments.map((shipment) => (
                                            <tr key={shipment.id} className="hover:bg-gray-750 transition">
                                                <td className="px-4 py-3 text-sm font-mono text-blue-400">
                                                    {shipment.trackingNumber}
                                                </td>
                                                <td className="px-4 py-3 text-sm">{shipment.carrier}</td>
                                                <td className="px-4 py-3 text-sm">{shipment.origin}</td>
                                                <td className="px-4 py-3 text-sm">{shipment.destination}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${shipment.status === 'delivered' ? 'bg-green-400/10 text-green-400' :
                                                            shipment.status === 'in_transit' ? 'bg-yellow-400/10 text-yellow-400' :
                                                                shipment.status === 'pending' ? 'bg-orange-400/10 text-orange-400' :
                                                                    'bg-red-400/10 text-red-400'
                                                        }`}>
                                                        {shipment.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedShipment(shipment);
                                                            setShowDetailsModal(true);
                                                        }}
                                                        className="p-1 hover:bg-gray-700 rounded transition"
                                                    >
                                                        <Eye className="h-4 w-4 text-gray-400" />
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
            )}
        </>
    );
}
