'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Bell,
    CheckCircle,
    AlertTriangle,
    Info,
    Clock,
    Trash2,
    Filter,
    Search,
    ArrowLeft
} from 'lucide-react';

export default function NotificationsPage() {
    const [filter, setFilter] = useState('all'); // all, unread, critical
    const [notifications, setNotifications] = useState([
        { id: 1, type: 'critical', title: 'Low Stock Alert', message: 'Wireless Headphones (SKU-123) is below reorder point (5 units left).', time: '15 mins ago', read: false },
        { id: 2, type: 'success', title: 'Order Shipped', message: 'Order #1234 has been successfully shipped via FedEx.', time: '1 hour ago', read: false },
        { id: 3, type: 'info', title: 'System Update', message: 'Warefy system maintenance scheduled for tonight at 2 AM.', time: '3 hours ago', read: true },
        { id: 4, type: 'warning', title: 'High Return Rate', message: 'Item "Gaming Mouse" has a 15% return rate this week.', time: '5 hours ago', read: true },
        { id: 5, type: 'info', title: 'New User Added', message: 'Sarah Jenkins has joined the "Packing" team.', time: '1 day ago', read: true },
        { id: 6, type: 'critical', title: 'Payment Failed', message: 'Payment for Order #1250 failed. Customer notified.', time: '1 day ago', read: true },
        { id: 7, type: 'success', title: 'Goal Reached', message: 'Daily picking target of 500 items reached!', time: '2 days ago', read: true },
    ]);

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.read;
        if (filter === 'critical') return n.type === 'critical';
        return true;
    });

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id: number) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const toggleRead = (id: number) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: !n.read } : n));
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition">
                            <ArrowLeft className="h-6 w-6 text-slate-500" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <Bell className="h-6 w-6 text-indigo-600" /> Notifications
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Stay updated with system alerts and activities.</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={markAllRead}
                            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                        >
                            Mark all read
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1 w-fit">
                        {['all', 'unread', 'critical'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all capitalize ${filter === f
                                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search notifications..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                        />
                    </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`group relative bg-white dark:bg-slate-800 rounded-xl p-4 border transition-all hover:shadow-md ${notification.read
                                        ? 'border-slate-200 dark:border-slate-700 opacity-75 hover:opacity-100'
                                        : 'border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/10 dark:bg-indigo-900/10'
                                    }`}
                            >
                                <div className="flex gap-4">
                                    <div className={`mt-1 h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${notification.type === 'critical' ? 'bg-red-100 text-red-600' :
                                            notification.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                                                notification.type === 'success' ? 'bg-green-100 text-green-600' :
                                                    'bg-blue-100 text-blue-600'
                                        }`}>
                                        {notification.type === 'critical' ? <AlertTriangle className="h-5 w-5" /> :
                                            notification.type === 'warning' ? <AlertTriangle className="h-5 w-5" /> :
                                                notification.type === 'success' ? <CheckCircle className="h-5 w-5" /> :
                                                    <Info className="h-5 w-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className={`text-sm font-semibold ${notification.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                                                {notification.title}
                                                {!notification.read && <span className="ml-2 inline-block w-2 h-2 bg-indigo-500 rounded-full"></span>}
                                            </h3>
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> {notification.time}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{notification.message}</p>
                                    </div>
                                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => deleteNotification(notification.id)}
                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 rounded-lg transition"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => toggleRead(notification.id)}
                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-indigo-500 rounded-lg transition"
                                            title={notification.read ? "Mark as unread" : "Mark as read"}
                                        >
                                            <CheckCircle className={`h-4 w-4 ${notification.read ? 'fill-current' : ''}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 border-dashed">
                            <Bell className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white">No notifications found</h3>
                            <p className="text-slate-500">You're all caught up!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
