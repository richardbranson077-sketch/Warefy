'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Plus, AlertCircle, Package, ArrowUpRight, ArrowDownRight, DollarSign, Box, Layers } from 'lucide-react';
import { inventory, warehouses } from '@/lib/api';
import { InventoryChart } from '@/components/Charts';

interface InventoryItem {
    id: number;
    product_name: string;
    sku: string;
    category: string;
    quantity: number;
    reorder_point: number;
    unit_price: number;
    warehouse_id: number;
}

interface Warehouse {
    id: number;
    name: string;
}

export default function InventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [warehouseList, setWarehouseList] = useState<Warehouse[]>([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState('all');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [inventoryData, warehouseData] = await Promise.all([
                    inventory.getAll({}),
                    warehouses.getAll()
                ]);
                setItems(inventoryData);
                setWarehouseList(warehouseData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching inventory:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredItems = items.filter(item => {
        const matchesSearch = item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesWarehouse = selectedWarehouse === 'all' || item.warehouse_id === parseInt(selectedWarehouse);
        return matchesSearch && matchesWarehouse;
    });

    const chartData = filteredItems.slice(0, 10).map(item => ({
        name: item.product_name,
        quantity: item.quantity,
        reorderPoint: item.reorder_point
    }));

    const totalValue = filteredItems.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
    const lowStockCount = filteredItems.filter(i => i.quantity <= i.reorder_point).length;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Inventory Management</h1>
                    <p className="text-gray-400 mt-1">Real-time tracking across {warehouseList.length} warehouses</p>
                </div>
                <button className="flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all font-medium border border-blue-500/50">
                    <Plus className="h-5 w-5 mr-2" />
                    Add New Item
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Layers className="h-24 w-24 text-blue-500" />
                    </div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Total Products</p>
                            <h3 className="text-3xl font-bold text-white mt-2">{filteredItems.length.toLocaleString()}</h3>
                        </div>
                        <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/20">
                            <Package className="h-6 w-6 text-blue-400" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-400 bg-green-500/10 w-fit px-2 py-1 rounded-lg border border-green-500/20 relative z-10">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span>12% growth</span>
                    </div>
                </div>

                <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign className="h-24 w-24 text-emerald-500" />
                    </div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Total Value</p>
                            <h3 className="text-3xl font-bold text-white mt-2">${totalValue.toLocaleString()}</h3>
                        </div>
                        <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/20">
                            <DollarSign className="h-6 w-6 text-emerald-400" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-400 bg-green-500/10 w-fit px-2 py-1 rounded-lg border border-green-500/20 relative z-10">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span>5.4% increase</span>
                    </div>
                </div>

                <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertCircle className="h-24 w-24 text-red-500" />
                    </div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Low Stock Alerts</p>
                            <h3 className="text-3xl font-bold text-white mt-2">{lowStockCount}</h3>
                        </div>
                        <div className="p-3 bg-red-500/20 rounded-xl border border-red-500/20">
                            <AlertCircle className="h-6 w-6 text-red-400" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-red-400 bg-red-500/10 w-fit px-2 py-1 rounded-lg border border-red-500/20 relative z-10">
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                        <span>Action needed</span>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Stock Level Trends</h3>
                    <div className="h-[300px] w-full">
                        <InventoryChart data={chartData} />
                    </div>
                </div>

                {/* Quick Actions / Summary */}
                <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-2xl p-6 text-white border border-white/10 backdrop-blur-xl">
                    <h3 className="text-lg font-bold mb-4">Inventory Health</h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-300">Stock Availability</span>
                                <span className="font-medium text-green-400">94%</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 w-[94%] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-300">Turnover Rate</span>
                                <span className="font-medium text-blue-400">High</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[85%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-white/10">
                            <p className="text-sm text-gray-300 mb-4">
                                <span className="text-white font-bold">{lowStockCount} items</span> are approaching reorder points. Consider restocking soon to avoid stockouts.
                            </p>
                            <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors border border-white/10">
                                View Recommendations
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <h3 className="text-lg font-bold text-white">Inventory Items</h3>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search SKU or name..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <select
                                className="appearance-none pl-4 pr-10 py-2 bg-gray-900/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer text-white"
                                value={selectedWarehouse}
                                onChange={(e) => setSelectedWarehouse(e.target.value)}
                            >
                                <option value="all">All Warehouses</option>
                                {warehouseList.map(wh => (
                                    <option key={wh.id} value={wh.id}>{wh.name}</option>
                                ))}
                            </select>
                            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Product Details</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Stock Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No items found matching your criteria</td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 mr-4 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                                                    <Box className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-white">{item.product_name}</div>
                                                    <div className="text-xs text-gray-500">SKU: {item.sku}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-300">{item.quantity} units</span>
                                                    {item.quantity <= item.reorder_point && (
                                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                                    )}
                                                </div>
                                                <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${item.quantity <= item.reorder_point ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
                                                            }`}
                                                        style={{ width: `${Math.min((item.quantity / (item.reorder_point * 3)) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-white">
                                            ${item.unit_price.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-500 hover:text-blue-400 transition-colors">
                                                Edit
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
