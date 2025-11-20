'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Plus, AlertCircle, Package, ArrowUpRight, ArrowDownRight, DollarSign, Box } from 'lucide-react';
import { inventory, warehouses } from '@/lib/api';
import { InventoryChart } from '@/components/Charts';

export default function InventoryPage() {
    const [items, setItems] = useState([]);
    const [warehouseList, setWarehouseList] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState('all');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [inventoryData, warehouseData] = await Promise.all([
                    inventory.getAll(),
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
                    <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
                    <p className="text-gray-500 mt-1">Real-time tracking across {warehouseList.length} warehouses</p>
                </div>
                <button className="flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium">
                    <Plus className="h-5 w-5 mr-2" />
                    Add New Item
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Products</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">{filteredItems.length.toLocaleString()}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <Package className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-600 bg-green-50 w-fit px-2 py-1 rounded-lg">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span>12% growth</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Value</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">${totalValue.toLocaleString()}</h3>
                        </div>
                        <div className="p-3 bg-green-50 rounded-xl">
                            <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-600 bg-green-50 w-fit px-2 py-1 rounded-lg">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span>5.4% increase</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Low Stock Alerts</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">{lowStockCount}</h3>
                        </div>
                        <div className="p-3 bg-red-50 rounded-xl">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-red-600 bg-red-50 w-fit px-2 py-1 rounded-lg">
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                        <span>Action needed</span>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Stock Level Trends</h3>
                    <div className="h-[300px] w-full">
                        <InventoryChart data={chartData} />
                    </div>
                </div>

                {/* Quick Actions / Summary */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-lg p-6 text-white">
                    <h3 className="text-lg font-bold mb-4">Inventory Health</h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400">Stock Availability</span>
                                <span className="font-medium">94%</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 w-[94%] rounded-full"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400">Turnover Rate</span>
                                <span className="font-medium">High</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[85%] rounded-full"></div>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-gray-700">
                            <p className="text-sm text-gray-400 mb-4">
                                3 items are approaching reorder points. Consider restocking soon to avoid stockouts.
                            </p>
                            <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                                View Recommendations
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Inventory Items</h3>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search SKU or name..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <select
                                className="appearance-none pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
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
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Details</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
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
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 mr-4 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                    <Box className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900">{item.product_name}</div>
                                                    <div className="text-xs text-gray-500">SKU: {item.sku}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-900">{item.quantity} units</span>
                                                    {item.quantity <= item.reorder_point && (
                                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                                    )}
                                                </div>
                                                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${item.quantity <= item.reorder_point ? 'bg-red-500' : 'bg-green-500'
                                                            }`}
                                                        style={{ width: `${Math.min((item.quantity / (item.reorder_point * 3)) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            ${item.unit_price.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-400 hover:text-blue-600 transition-colors">
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
