'use client';

import { DollarSign, TrendingUp, TrendingDown, CreditCard, FileText, Download } from 'lucide-react';

export default function FinancialsPage() {
    return (
        <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <DollarSign className="h-6 w-6 text-green-400" />
                        Financial Overview
                    </h1>
                    <p className="text-gray-400 mt-1">Monitor revenue, expenses, and invoices</p>
                </div>
                <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition border border-gray-700">
                    <Download className="h-4 w-4" /> Export Report
                </button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-400 font-medium">Total Revenue</h3>
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <DollarSign className="h-5 w-5 text-green-400" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">$124,592.00</div>
                    <div className="flex items-center gap-1 text-sm text-green-400">
                        <TrendingUp className="h-3 w-3" /> +12.5% from last month
                    </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-400 font-medium">Operating Expenses</h3>
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <CreditCard className="h-5 w-5 text-red-400" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">$42,150.00</div>
                    <div className="flex items-center gap-1 text-sm text-red-400">
                        <TrendingDown className="h-3 w-3" /> +5.2% from last month
                    </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-400 font-medium">Net Profit</h3>
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-blue-400" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">$82,442.00</div>
                    <div className="flex items-center gap-1 text-sm text-green-400">
                        <TrendingUp className="h-3 w-3" /> +18.2% margin
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Transactions */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg p-6">
                    <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-750 rounded-lg transition">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                                        <DollarSign className="h-5 w-5 text-gray-300" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-white">Payment from Client #{1000 + i}</div>
                                        <div className="text-xs text-gray-500">Today, 10:2{i} AM</div>
                                    </div>
                                </div>
                                <div className="font-medium text-green-400">+$1,250.00</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Invoices */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
                        <span>Pending Invoices</span>
                        <button className="text-sm text-purple-400 hover:text-purple-300">View All</button>
                    </h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-8 w-8 text-gray-500" />
                                    <div>
                                        <div className="font-medium text-white">Invoice #INV-2024-{100 + i}</div>
                                        <div className="text-xs text-gray-500">Due in {i * 5} days</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium text-white">$3,450.00</div>
                                    <div className="text-xs text-yellow-500">Pending</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
