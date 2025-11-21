'use client';

import { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Plus,
    AlertCircle,
    Package,
    DollarSign,
    Download,
    Upload,
    Edit,
    Trash2,
    Eye,
    X,
    TrendingUp,
    TrendingDown,
    BarChart3,
    RefreshCw,
    ChevronDown,
    CheckCircle,
    XCircle,
    Layers
} from 'lucide-react';
import { inventory, warehouses } from '@/lib/api';

interface InventoryItem {
    id: number;
    product_name: string;
    sku: string;
    category: string;
    quantity: number;
    reorder_point: number;
    unit_price: number;
    warehouse_id: number;
    supplier?: string;
    lastRestocked?: string;
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
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'value' | 'stock'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Form state for Add/Edit
    const [formData, setFormData] = useState({
        product_name: '',
        sku: '',
        category: '',
        quantity: 0,
        reorder_point: 0,
        unit_price: 0,
        warehouse_id: 1,
        supplier: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [inventoryData, warehouseData] = await Promise.all([
                inventory.getAll({}),
                warehouses.getAll()
            ]);
            setItems(inventoryData || []);
            setWarehouseList(warehouseData || []);
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get unique categories
    const categories = ['all', ...Array.from(new Set(items.map(item => item.category)))];

    // Filter and sort items
    const filteredItems = items.filter(item => {
        const matchesSearch =
            item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesWarehouse = selectedWarehouse === 'all' || item.warehouse_id === parseInt(selectedWarehouse);
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        return matchesSearch && matchesWarehouse && matchesCategory;
    });

    const sortedItems = [...filteredItems].sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
            case 'name':
                comparison = a.product_name.localeCompare(b.product_name);
                break;
            case 'quantity':
                comparison = a.quantity - b.quantity;
                break;
            case 'value':
                comparison = (a.quantity * a.unit_price) - (b.quantity * b.unit_price);
                break;
            case 'stock':
                const aStatus = a.quantity <= a.reorder_point ? -1 : 1;
                const bStatus = b.quantity <= b.reorder_point ? -1 : 1;
                comparison = aStatus - bStatus;
                break;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Pagination
    const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
    const paginatedItems = sortedItems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Stats
    const totalValue = filteredItems.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
    const lowStockCount = filteredItems.filter(i => i.quantity <= i.reorder_point).length;
    const totalQuantity = filteredItems.reduce((acc, item) => acc + item.quantity, 0);

    // Handlers
    const handleAddItem = () => {
        setFormData({
            product_name: '',
            sku: '',
            category: '',
            quantity: 0,
            reorder_point: 0,
            unit_price: 0,
            warehouse_id: warehouseList[0]?.id || 1,
            supplier: ''
        });
        setShowAddModal(true);
    };

    const handleEditItem = (item: InventoryItem) => {
        setSelectedItem(item);
        setFormData({
            product_name: item.product_name,
            sku: item.sku,
            category: item.category,
            quantity: item.quantity,
            reorder_point: item.reorder_point,
            unit_price: item.unit_price,
            warehouse_id: item.warehouse_id,
            supplier: item.supplier || ''
        });
        setShowEditModal(true);
    };

    const handleViewDetails = (item: InventoryItem) => {
        setSelectedItem(item);
        setShowDetailsModal(true);
    };

    const handleSaveItem = async () => {
        try {
            if (showEditModal && selectedItem) {
                await inventory.update(selectedItem.id, formData);
            } else {
                await inventory.create(formData);
            }
            await fetchData();
            setShowAddModal(false);
            setShowEditModal(false);
        } catch (error) {
            console.error('Error saving item:', error);
        }
    };

    const handleDeleteItem = async (id: number) => {
        if (confirm('Are you sure you want to delete this item?')) {
            try {
                await inventory.delete(id);
                await fetchData();
            } catch (error) {
                console.error('Error deleting item:', error);
            }
        }
    };

    const handleBulkDelete = async () => {
        if (confirm(`Delete ${selectedItems.length} selected items?`)) {
            try {
                await Promise.all(selectedItems.map(id => inventory.delete(id)));
                setSelectedItems([]);
                await fetchData();
            } catch (error) {
                console.error('Error deleting items:', error);
            }
        }
    };

    const handleExportCSV = () => {
        const headers = ['SKU', 'Product Name', 'Category', 'Quantity', 'Unit Price', 'Total Value', 'Warehouse'];
        const csvData = filteredItems.map(item => [
            item.sku,
            item.product_name,
            item.category,
            item.quantity,
            item.unit_price,
            (item.quantity * item.unit_price).toFixed(2),
            warehouseList.find(w => w.id === item.warehouse_id)?.name || ''
        ]);

        const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const toggleSort = (field: typeof sortBy) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const getStockStatus = (item: InventoryItem) => {
        if (item.quantity === 0) return { text: 'Out of Stock', color: 'red' };
        if (item.quantity <= item.reorder_point) return { text: 'Low Stock', color: 'orange' };
        return { text: 'In Stock', color: 'green' };
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
                    <p className="text-gray-600 mt-1">Manage products across {warehouseList.length} warehouses</p>
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
                        onClick={handleExportCSV}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Export
                    </button>
                    <button
                        onClick={handleAddItem}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition flex items-center gap-2"
                    >
                        <Plus className="h-5 w-5" />
                        Add Item
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Total Products</p>
                        <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{filteredItems.length}</p>
                    <p className="text-xs text-gray-500 mt-1">{totalQuantity.toLocaleString()} units</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Total Value</p>
                        <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">${(totalValue / 1000).toFixed(1)}K</p>
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +8.2% vs last month
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Low Stock Items</p>
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{lowStockCount}</p>
                    <p className="text-xs text-orange-600 mt-1">Requires attention</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Categories</p>
                        <Layers className="h-5 w-5 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{categories.length - 1}</p>
                    <p className="text-xs text-gray-500 mt-1">Active categories</p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products or SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>

                    {/* Warehouse Filter */}
                    <select
                        value={selectedWarehouse}
                        onChange={(e) => setSelectedWarehouse(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                        <option value="all">All Warehouses</option>
                        {warehouseList.map(wh => (
                            <option key={wh.id} value={wh.id}>{wh.name}</option>
                        ))}
                    </select>

                    {/* Category Filter */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                        <option value="all">All Categories</option>
                        {categories.filter(c => c !== 'all').map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                        <option value="name">Sort by Name</option>
                        <option value="quantity">Sort by Quantity</option>
                        <option value="value">Sort by Value</option>
                        <option value="stock">Sort by Stock Status</option>
                    </select>
                </div>

                {/* Bulk Actions */}
                {selectedItems.length > 0 && (
                    <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-900">
                            {selectedItems.length} item(s) selected
                        </p>
                        <button
                            onClick={handleBulkDelete}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition flex items-center gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete Selected
                        </button>
                    </div>
                )}
            </div>

            {/* Items Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.length === paginatedItems.length && paginatedItems.length > 0}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedItems(paginatedItems.map(item => item.id));
                                            } else {
                                                setSelectedItems([]);
                                            }
                                        }}
                                        className="w-4 h-4"
                                    />
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">SKU</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Quantity</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Unit Price</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total Value</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                                        Loading inventory...
                                    </td>
                                </tr>
                            ) : paginatedItems.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                                        No items found
                                    </td>
                                </tr>
                            ) : (
                                paginatedItems.map((item) => {
                                    const status = getStockStatus(item);
                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(item.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedItems([...selectedItems, item.id]);
                                                        } else {
                                                            setSelectedItems(selectedItems.filter(id => id !== item.id));
                                                        }
                                                    }}
                                                    className="w-4 h-4"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-sm font-mono text-gray-900">{item.sku}</td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.product_name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs">
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{item.quantity.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">${item.unit_price.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                                ${(item.quantity * item.unit_price).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color === 'green' ? 'bg-green-100 text-green-700' :
                                                        status.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                                                            'bg-red-100 text-red-700'
                                                    }`}>
                                                    {status.text}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleViewDetails(item)}
                                                        className="p-1 hover:bg-gray-100 rounded transition"
                                                        title="View Details"
                                                    >
                                                        <Eye className="h-4 w-4 text-gray-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditItem(item)}
                                                        className="p-1 hover:bg-gray-100 rounded transition"
                                                        title="Edit"
                                                    >
                                                        <Edit className="h-4 w-4 text-blue-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteItem(item.id)}
                                                        className="p-1 hover:bg-gray-100 rounded transition"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedItems.length)} of {sortedItems.length} items
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

            {/* Add/Edit Modal */}
            {(showAddModal || showEditModal) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                                {showEditModal ? 'Edit Item' : 'Add New Item'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setShowEditModal(false);
                                }}
                                className="p-1 hover:bg-gray-100 rounded transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                    <input
                                        type="text"
                                        value={formData.product_name}
                                        onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                                    <input
                                        type="text"
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse</label>
                                    <select
                                        value={formData.warehouse_id}
                                        onChange={(e) => setFormData({ ...formData, warehouse_id: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        {warehouseList.map(wh => (
                                            <option key={wh.id} value={wh.id}>{wh.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Point</label>
                                    <input
                                        type="number"
                                        value={formData.reorder_point}
                                        onChange={(e) => setFormData({ ...formData, reorder_point: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.unit_price}
                                        onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.supplier}
                                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setShowEditModal(false);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveItem}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                            >
                                {showEditModal ? 'Update Item' : 'Add Item'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {showDetailsModal && selectedItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Product Details</h2>
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
                                    <p className="text-sm text-gray-600 mb-1">Product Name</p>
                                    <p className="text-lg font-semibold text-gray-900">{selectedItem.product_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">SKU</p>
                                    <p className="text-lg font-mono text-gray-900">{selectedItem.sku}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Category</p>
                                    <p className="text-lg text-gray-900">{selectedItem.category}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Warehouse</p>
                                    <p className="text-lg text-gray-900">
                                        {warehouseList.find(w => w.id === selectedItem.warehouse_id)?.name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Current Stock</p>
                                    <p className="text-2xl font-bold text-gray-900">{selectedItem.quantity.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Reorder Point</p>
                                    <p className="text-2xl font-bold text-orange-600">{selectedItem.reorder_point.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Unit Price</p>
                                    <p className="text-2xl font-bold text-green-600">${selectedItem.unit_price.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Value</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        ${(selectedItem.quantity * selectedItem.unit_price).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                            {selectedItem.supplier && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Supplier</p>
                                    <p className="text-lg text-gray-900">{selectedItem.supplier}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
