'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useDashboard } from '../../hooks/useDashboard';
import { useAIRecommendations } from '../../hooks/useAIRecommendations';
import LoadingSpinner from '../../components/LoadingStates';
import ErrorAlert from '../../components/ErrorStates';
import { formatDistanceToNow } from 'date-fns';
import { dashboardService } from '../../services/dashboard.service';
import {
    Moon,
    Sun,
    Bell,
    Package,
    Truck,
    CheckCircle,
    AlertTriangle,
    ArrowUpRight,
    Search,
    Filter,
    MoreHorizontal,
    Download,
    ClipboardList,
    Box,
    MapPin,
    Activity,
    Sparkles,
    Zap,
    Cpu,
    Wifi,
    Mic,
    Camera,
    Leaf,
    ShieldCheck,
    Eye,
    X,
    LogOut,
    Settings,
    User,
    Thermometer,
    Droplets,
    Wind,
    TrendingUp
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, CartesianGrid
} from 'recharts';

// Dynamically import Leaflet map to avoid SSR issues
const LiveMap = dynamic(() => import('../../components/LiveMap'), {
    ssr: false,
    loading: () => <div className="w-full h-[300px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl flex items-center justify-center text-slate-400">Loading Map...</div>
});

export default function DashboardPage() {
    const router = useRouter();
    const [timeRange, setTimeRange] = useState('24h');
    const [darkMode, setDarkMode] = useState(false);
    const [activeZoneFilter, setActiveZoneFilter] = useState('All');
    const [selectedZone, setSelectedZone] = useState<any>(null); // For modal
    const [isListening, setIsListening] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [revenuePeriod, setRevenuePeriod] = useState('Last 7 Days');
    const [topProducts, setTopProducts] = useState<any[]>([]);

    const revenueDataMap: any = {
        'Last 7 Days': [
            { date: 'Mon', revenue: 4000 },
            { date: 'Tue', revenue: 3000 },
            { date: 'Wed', revenue: 2000 },
            { date: 'Thu', revenue: 2780 },
            { date: 'Fri', revenue: 1890 },
            { date: 'Sat', revenue: 2390 },
            { date: 'Sun', revenue: 3490 },
        ],
        'Last 30 Days': [
            { date: 'Week 1', revenue: 15000 },
            { date: 'Week 2', revenue: 18000 },
            { date: 'Week 3', revenue: 12000 },
            { date: 'Week 4', revenue: 21000 },
        ],
        'This Year': [
            { date: 'Jan', revenue: 45000 },
            { date: 'Feb', revenue: 52000 },
            { date: 'Mar', revenue: 48000 },
            { date: 'Apr', revenue: 61000 },
            { date: 'May', revenue: 55000 },
            { date: 'Jun', revenue: 67000 },
            { date: 'Jul', revenue: 72000 },
            { date: 'Aug', revenue: 69000 },
            { date: 'Sep', revenue: 78000 },
            { date: 'Oct', revenue: 85000 },
            { date: 'Nov', revenue: 92000 },
            { date: 'Dec', revenue: 105000 },
        ]
    };

    const { data, loading, error } = useDashboard();
    const { recommendations, loading: aiLoading } = useAIRecommendations();

    const currentRevenueData = revenuePeriod === 'Last 7 Days' && data?.revenueData?.length > 0
        ? data.revenueData
        : revenueDataMap[revenuePeriod];

    const handleLogout = () => {
        localStorage.removeItem('token');
        document.cookie = 'token=; Max-Age=0; path=/;';
        router.push('/login');
    };

    // Fallback values when data is loading or null
    const stats = data || {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalRevenue: 0,
        lowStockItems: 0,
        totalInventoryValue: 0,
        activeShipments: 0,
        warehouseUtilization: 0,
        recentOrders: [],
        inventoryAlerts: [],
        revenueData: [],
        ordersByStatus: {
            pending: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0
        }
    };

    // Real Live Activity Feed
    const [activities, setActivities] = useState<any[]>([]);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const feed = await dashboardService.getLiveFeed();
                if (Array.isArray(feed)) {
                    setActivities(feed.map((item: any) => {
                        try {
                            return {
                                ...item,
                                time: item.time ? formatDistanceToNow(new Date(item.time), { addSuffix: true }) : 'Just now'
                            };
                        } catch (e) {
                            return { ...item, time: 'Just now' };
                        }
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch live feed", err);
            }
        };

        fetchFeed();
        const interval = setInterval(fetchFeed, 5000); // Poll every 5s

        return () => clearInterval(interval);
    }, []);

    // Fetch Top Products
    useEffect(() => {
        const fetchTopProducts = async () => {
            try {
                const data = await dashboardService.getTopProducts(5, 30);
                setTopProducts(data.products || []);
            } catch (err) {
                console.error("Failed to fetch top products", err);
            }
        };

        fetchTopProducts();
        // Refresh every 5 minutes
        const interval = setInterval(fetchTopProducts, 300000);
        return () => clearInterval(interval);
    }, []);

    // Mock Warehouse Zones Data
    const zones = [
        { id: 'receiving', name: 'Receiving', status: 'active', load: 45, staff: 3, color: 'bg-blue-500', tasks: 12 },
        { id: 'storage', name: 'Storage', status: 'normal', load: 78, staff: 8, color: 'bg-indigo-500', tasks: 45 },
        { id: 'picking', name: 'Picking', status: 'busy', load: 92, staff: 12, color: 'bg-amber-500', tasks: 128 },
        { id: 'packing', name: 'Packing', status: 'active', load: 60, staff: 5, color: 'bg-purple-500', tasks: 34 },
        { id: 'shipping', name: 'Shipping', status: 'normal', load: 30, staff: 2, color: 'bg-green-500', tasks: 8 },
    ];

    // Filter zones based on status
    const filteredZones = activeZoneFilter === 'All'
        ? zones
        : zones.filter(z => z.status.toLowerCase() === activeZoneFilter.toLowerCase());

    // Dynamic Inbound vs Outbound Data
    const [flowData, setFlowData] = useState<any[]>([]);

    // Simulate live data updates for the chart based on Time Range
    useEffect(() => {
        // Generate initial data based on timeRange
        const generateData = () => {
            const points = timeRange === '1h' ? 12 : timeRange === '8h' ? 8 : 6;
            const intervalMinutes = timeRange === '1h' ? 5 : timeRange === '8h' ? 60 : 240;
            const now = new Date();
            const data = [];

            for (let i = points; i >= 0; i--) {
                const t = new Date(now.getTime() - i * intervalMinutes * 60000);
                data.push({
                    time: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    inbound: Math.floor(Math.random() * 150) + 50,
                    outbound: Math.floor(Math.random() * 150) + 50
                });
            }
            return data;
        };

        setFlowData(generateData());

        const interval = setInterval(() => {
            setFlowData(prevData => {
                if (prevData.length === 0) return prevData;
                const newData = [...prevData];
                const lastItem = newData[newData.length - 1];

                // Randomize slightly
                const newInbound = Math.max(0, lastItem.inbound + (Math.random() * 20 - 10));
                const newOutbound = Math.max(0, lastItem.outbound + (Math.random() * 20 - 10));

                newData[newData.length - 1] = {
                    ...lastItem,
                    inbound: Math.round(newInbound),
                    outbound: Math.round(newOutbound)
                };
                return newData;
            });
        }, 2000); // Update every 2 seconds

        return () => clearInterval(interval);
    }, [timeRange]);

    // Mock Data for Live Map
    const mapData = {
        origin: { lat: 40.7128, lng: -74.0060, address: 'New York Distribution Center' },
        destination: { lat: 42.3601, lng: -71.0589, address: 'Boston Fulfillment Hub' },
        currentLocation: { lat: 41.5, lng: -72.8, speed_kmh: 85 },
        waypoints: [{ lat: 41.3083, lng: -72.9279, address: 'New Haven Stop' }]
    };

    return (
        <>
            {loading && <LoadingSpinner />}
            {error && <ErrorAlert message={error} />}
            {!loading && !error && (
                <div className={darkMode ? 'dark bg-slate-900 min-h-screen text-slate-100' : 'bg-slate-50 min-h-screen text-slate-900'}>
                    {/* Header */}
                    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4">
                        <div className="flex items-center justify-between max-w-7xl mx-auto">
                            <div className="flex items-center gap-3">
                                <div className="bg-indigo-600 p-2 rounded-lg">
                                    <Package className="h-6 w-6 text-white" />
                                </div>
                                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">Warefy Ops</h1>
                            </div>
                            <div className="flex items-center space-x-4 relative">
                                {/* System Health Ticker */}
                                <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400">
                                    <span className="flex items-center gap-1.5 text-green-600"><Wifi className="h-3 w-3" /> Systems Online</span>
                                    <span className="w-px h-3 bg-slate-300 dark:bg-slate-600"></span>
                                    <span className="flex items-center gap-1.5"><Cpu className="h-3 w-3" /> CPU: 12%</span>
                                    <span className="w-px h-3 bg-slate-300 dark:bg-slate-600"></span>
                                    <span className="flex items-center gap-1.5"><Activity className="h-3 w-3" /> Latency: 24ms</span>
                                </div>

                                <div className="hidden md:flex items-center px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                                    <Search className="h-4 w-4 text-slate-400 mr-2" />
                                    <input type="text" placeholder="Search..." className="bg-transparent border-none focus:outline-none text-sm w-48" />
                                </div>
                                <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-500">
                                    {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                                </button>

                                {/* Notifications Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
                                        className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-500"
                                    >
                                        <Bell className="h-5 w-5" />
                                        <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                                    </button>

                                    {showNotifications && (
                                        <div className="absolute top-12 right-0 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                                <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                                                <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Mark all read</button>
                                            </div>
                                            <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                                {[1, 2, 3].map((i) => (
                                                    <div key={i} className="p-4 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition cursor-pointer">
                                                        <div className="flex gap-3">
                                                            <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${i === 1 ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                                            <div>
                                                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                                    {i === 1 ? 'Critical: Low Stock Alert' : 'New Order Received'}
                                                                </p>
                                                                <p className="text-xs text-slate-500 mt-1">
                                                                    {i === 1 ? 'Wireless Headphones (SKU-123) is below reorder point.' : 'Order #1234 has been placed successfully.'}
                                                                </p>
                                                                <p className="text-[10px] text-slate-400 mt-2">{i * 15} mins ago</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="p-2 bg-slate-50 dark:bg-slate-800/50 text-center">
                                                <Link href="/dashboard/notifications" className="block w-full text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 py-1">
                                                    View all notifications
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* User Menu Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
                                        className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px] transition-transform hover:scale-105"
                                    >
                                        <div className="h-full w-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center">
                                            <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                    </button>

                                    {showUserMenu && (
                                        <div className="absolute top-12 right-0 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                            <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                                                <p className="font-semibold text-slate-900 dark:text-white">John Hendrix</p>
                                                <p className="text-xs text-slate-500">admin@warefy.com</p>
                                            </div>
                                            <div className="p-2">
                                                <Link href="/dashboard/profile" className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2 transition">
                                                    <User className="h-4 w-4" /> Profile
                                                </Link>
                                                <Link href="/dashboard/settings" className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2 transition">
                                                    <Settings className="h-4 w-4" /> Settings
                                                </Link>
                                                <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2 transition"
                                                >
                                                    <LogOut className="h-4 w-4" /> Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="max-w-7xl mx-auto p-6 space-y-6 pb-24">
                        {/* Operational Controls */}
                        <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    Warehouse Floor <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse">● Live</span>
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Real-time operational status and activity feed.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
                                    {['1h', '8h', '24h'].map((range) => (
                                        <button
                                            key={range}
                                            onClick={() => setTimeRange(range)}
                                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${timeRange === range
                                                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                                }`}
                                        >
                                            {range}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => document.getElementById('zone-activity')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm shadow-indigo-200 dark:shadow-none transition-all text-sm font-medium"
                                >
                                    <Activity className="h-4 w-4" /> View Floor Map
                                </button>
                            </div>
                        </section>

                        {/* AI Control Tower */}
                        <section className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-yellow-300" /> AI Control Tower
                                    </h2>
                                    <Link href="/dashboard/recommendations" className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition backdrop-blur-sm">
                                        View All Insights
                                    </Link>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {recommendations.slice(0, 3).map((rec) => (
                                        <div key={rec.id} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition cursor-pointer">
                                            <div className="flex items-start justify-between mb-2">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${rec.severity === 'critical' ? 'bg-red-500/80 text-white' :
                                                    rec.severity === 'high' ? 'bg-orange-500/80 text-white' :
                                                        'bg-blue-500/80 text-white'
                                                    }`}>
                                                    {rec.type.toUpperCase()}
                                                </span>
                                                <span className="text-xs text-indigo-100">{rec.impact}</span>
                                            </div>
                                            <h3 className="font-semibold text-white mb-1">{rec.title}</h3>
                                            <p className="text-xs text-indigo-100 line-clamp-2">{rec.description}</p>
                                            <button className="mt-3 w-full py-1.5 bg-white text-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-50 transition">
                                                Apply Fix
                                            </button>
                                        </div>
                                    ))}
                                    {recommendations.length === 0 && (
                                        <div className="col-span-3 text-center py-4 text-indigo-100">
                                            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <p>AI is analyzing system data...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Operational Metrics Cards */}
                        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* To Pick */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 dark:bg-amber-900/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                <div className="relative">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">To Pick</p>
                                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.ordersByStatus.pending}</h3>
                                        </div>
                                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl">
                                            <ClipboardList className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-amber-500 h-full rounded-full" style={{ width: '45%' }}></div>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">45% of daily target</p>
                                </div>
                            </div>

                            {/* Packing */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                <div className="relative">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Packing</p>
                                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.ordersByStatus.processing}</h3>
                                        </div>
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                                            <Box className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-blue-500 h-full rounded-full" style={{ width: '60%' }}></div>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">Avg time: 4m 30s</p>
                                </div>
                            </div>

                            {/* Outbound */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 dark:bg-green-900/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                <div className="relative">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Outbound</p>
                                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.ordersByStatus.shipped}</h3>
                                        </div>
                                        <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl">
                                            <Truck className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-green-500 h-full rounded-full" style={{ width: '85%' }}></div>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">3 trucks loading</p>
                                </div>
                            </div>

                            {/* Sustainability Score */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                <div className="relative">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Eco Score</p>
                                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">94<span className="text-sm font-normal text-slate-400">/100</span></h3>
                                        </div>
                                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
                                            <Leaf className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
                                        <ArrowUpRight className="h-3 w-3" />
                                        <span>-12% CO2 Emissions</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">Optimized routing active</p>
                                </div>
                            </div>
                        </section>

                        {/* Main Operations Grid */}
                        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Live Warehouse Map / Zone Status */}
                            <div id="zone-activity" className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-indigo-500" /> Zone Activity
                                    </h2>
                                    <div className="flex gap-2">
                                        {['All', 'Active', 'Busy', 'Normal'].map(filter => (
                                            <button
                                                key={filter}
                                                onClick={() => setActiveZoneFilter(filter)}
                                                className={`px-3 py-1 text-xs font-medium rounded-full transition ${activeZoneFilter === filter
                                                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                                                    }`}
                                            >
                                                {filter}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Visual Warehouse Layout */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                    {filteredZones.map((zone) => (
                                        <div
                                            key={zone.id}
                                            onClick={() => setSelectedZone(zone)}
                                            className="relative p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-indigo-300 transition-all cursor-pointer group hover:shadow-md"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-semibold text-slate-900 dark:text-white">{zone.name}</span>
                                                <span className={`h-2 w-2 rounded-full ${zone.status === 'busy' ? 'bg-red-500 animate-pulse' : zone.status === 'active' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                                                        <span>Load</span>
                                                        <span>{zone.load}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${zone.color}`} style={{ width: `${zone.load}%` }}></div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                                    <User className="h-3 w-3" /> {zone.staff} staff
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredZones.length === 0 && (
                                        <div className="col-span-3 text-center py-8 text-slate-500">
                                            No zones found matching "{activeZoneFilter}"
                                        </div>
                                    )}
                                </div>

                                {/* Inbound/Outbound Flow Chart */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                            Item Flow (Inbound vs Outbound)
                                            <span className="flex h-2 w-2 relative">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                            </span>
                                        </h3>
                                    </div>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <AreaChart data={flowData}>
                                            <defs>
                                                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Area type="monotone" dataKey="inbound" stroke="#3b82f6" fillOpacity={1} fill="url(#colorIn)" name="Inbound" />
                                            <Area type="monotone" dataKey="outbound" stroke="#10b981" fillOpacity={1} fill="url(#colorOut)" name="Outbound" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Live Activity Feed */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        ⚡ Live Feed
                                    </h2>
                                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Updating...</span>
                                </div>
                                <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                                    {activities.map((activity) => (
                                        <div key={activity.id} className="flex gap-3 pb-4 border-b border-slate-50 dark:border-slate-700/50 last:border-0 last:pb-0">
                                            <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 
                                                ${activity.action === 'Picked' ? 'bg-amber-100 text-amber-600' :
                                                    activity.action === 'Packed' ? 'bg-blue-100 text-blue-600' :
                                                        activity.action === 'Received' ? 'bg-indigo-100 text-indigo-600' :
                                                            'bg-green-100 text-green-600'}`}>
                                                {activity.action[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                    <span className="font-bold">{activity.action}</span> {activity.item}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                                        <User className="h-3 w-3" /> {activity.user}
                                                    </span>
                                                    <span className="text-xs text-slate-400">•</span>
                                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" /> {activity.zone}
                                                    </span>
                                                    <span className="text-xs text-slate-400">•</span>
                                                    <span className="text-xs text-slate-400">{activity.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {/* Simulated past activities */}
                                    <div className="opacity-60">
                                        <div className="flex gap-3 pb-4 border-b border-slate-50 dark:border-slate-700/50">
                                            <div className="mt-1 h-8 w-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0">P</div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">Putaway Pallet #9921</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-slate-500">Tom H.</span>
                                                    <span className="text-xs text-slate-400">15 min ago</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button className="w-full mt-4 py-2 text-sm text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg transition">
                                    View Full Log
                                </button>
                            </div>
                        </section>

                        {/* Global Logistics Map & Cameras */}
                        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Map */}
                            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        🌍 Priority Shipment Tracking
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-3 w-3 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                                        </span>
                                        <span className="text-sm font-medium text-indigo-600">Live Tracking Active</span>
                                    </div>
                                </div>
                                <div className="h-[300px] w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative z-0">
                                    <LiveMap
                                        origin={mapData.origin}
                                        destination={mapData.destination}
                                        currentLocation={mapData.currentLocation}
                                        waypoints={mapData.waypoints}
                                    />
                                </div>
                            </div>

                            {/* Warehouse Conditions (IoT) */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Wifi className="h-5 w-5 text-indigo-500" /> Environment
                                    </h2>
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
                                            <Thermometer className="h-4 w-4" /> <span className="text-xs font-medium">Temp</span>
                                        </div>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">21.5°C</p>
                                        <p className="text-xs text-green-600 flex items-center gap-1 mt-1"><CheckCircle className="h-3 w-3" /> Optimal</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
                                            <Droplets className="h-4 w-4" /> <span className="text-xs font-medium">Humidity</span>
                                        </div>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">45%</p>
                                        <p className="text-xs text-green-600 flex items-center gap-1 mt-1"><CheckCircle className="h-3 w-3" /> Optimal</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
                                            <Wind className="h-4 w-4" /> <span className="text-xs font-medium">Air Quality</span>
                                        </div>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">98 AQI</p>
                                        <p className="text-xs text-green-600 flex items-center gap-1 mt-1"><CheckCircle className="h-3 w-3" /> Good</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
                                            <Zap className="h-4 w-4" /> <span className="text-xs font-medium">Power</span>
                                        </div>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">12.4 kW</p>
                                        <p className="text-xs text-amber-600 flex items-center gap-1 mt-1"><TrendingUp className="h-3 w-3" /> Peak</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">HVAC System</span>
                                        <span className="text-green-600 font-medium">Active</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                                        <div className="bg-green-500 h-full rounded-full animate-pulse" style={{ width: '100%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Recent Orders & Inventory (Bottom Row) */}
                        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Recent Orders Table */}
                            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        🛍️ Recent Orders
                                    </h2>
                                    <Link href="/dashboard/orders" className="text-sm text-indigo-600 font-medium hover:underline">View All Orders</Link>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-700/50">
                                            <tr>
                                                <th className="px-4 py-3 rounded-l-lg">Order ID</th>
                                                <th className="px-4 py-3">Customer</th>
                                                <th className="px-4 py-3">Date</th>
                                                <th className="px-4 py-3">Status</th>
                                                <th className="px-4 py-3 text-right rounded-r-lg">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.recentOrders.length > 0 ? (
                                                stats.recentOrders.map((order) => (
                                                    <tr key={order.id} className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{order.orderNumber}</td>
                                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{order.customer}</td>
                                                        <td className="px-4 py-3 text-slate-500">{new Date(order.date).toLocaleDateString()}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                                order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                                    order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                                        'bg-slate-100 text-slate-700'
                                                                }`}>
                                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white">${order.total.toFixed(2)}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No recent orders found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Inventory Alerts */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        ⚠️ Low Stock Alerts
                                    </h2>
                                    <Link href="/dashboard/inventory" className="text-sm text-indigo-600 font-medium hover:underline">Manage</Link>
                                </div>
                                <div className="space-y-4">
                                    {stats.inventoryAlerts.length > 0 ? (
                                        stats.inventoryAlerts.map((alert) => (
                                            <div key={alert.id} className="flex items-center gap-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                                                <div className="h-10 w-10 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-red-500 shadow-sm">
                                                    <AlertTriangle className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-slate-900 dark:text-white truncate">{alert.name}</h4>
                                                    <p className="text-xs text-red-600 dark:text-red-400">Only {alert.currentStock} left (Reorder: {alert.reorderPoint})</p>
                                                </div>
                                                <button className="px-3 py-1.5 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition">
                                                    Restock
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="h-12 w-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <CheckCircle className="h-6 w-6" />
                                            </div>
                                            <p className="text-slate-500">Inventory levels are healthy!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                        {/* Performance Analytics */}
                        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Revenue Trend */}
                            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-indigo-500" /> Revenue Analytics
                                    </h2>
                                    <select
                                        value={revenuePeriod}
                                        onChange={(e) => setRevenuePeriod(e.target.value)}
                                        className="bg-slate-50 dark:bg-slate-700 border-none text-xs rounded-lg px-3 py-1.5 text-slate-600 dark:text-slate-300 focus:ring-0"
                                    >
                                        <option>Last 7 Days</option>
                                        <option>Last 30 Days</option>
                                        <option>This Year</option>
                                    </select>
                                </div>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={currentRevenueData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                            <Tooltip
                                                cursor={{ fill: '#f1f5f9' }}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                formatter={(value: number) => [`$${value}`, 'Revenue']}
                                            />
                                            <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={32} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Top Products */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Package className="h-5 w-5 text-indigo-500" /> Top Products
                                    </h2>
                                </div>
                                <div className="space-y-4">
                                    {topProducts.length > 0 ? (
                                        topProducts.map((product, i) => (
                                            <div key={product.sku} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                                        #{i + 1}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{product.name}</p>
                                                        <p className="text-xs text-slate-500">{product.sales} units sold</p>
                                                    </div>
                                                </div>
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${product.growth.startsWith('+')
                                                    ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
                                                    : 'text-red-600 bg-red-50 dark:bg-red-900/20'
                                                    }`}>
                                                    {product.growth}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-slate-400">
                                            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No sales data available</p>
                                        </div>
                                    )}
                                </div>
                                <button className="w-full mt-4 py-2 text-sm text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg transition">
                                    View Full Report
                                </button>
                            </div>
                        </section>
                    </main>

                    {/* Zone Details Modal */}
                    {selectedZone && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        {selectedZone.name}
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${selectedZone.status === 'busy' ? 'bg-red-100 text-red-600' :
                                            selectedZone.status === 'active' ? 'bg-green-100 text-green-600' :
                                                'bg-blue-100 text-blue-600'
                                            }`}>
                                            {selectedZone.status.toUpperCase()}
                                        </span>
                                    </h3>
                                    <button onClick={() => setSelectedZone(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition">
                                        <X className="h-5 w-5 text-slate-500" />
                                    </button>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                            <p className="text-xs text-slate-500 mb-1">Current Load</p>
                                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{selectedZone.load}%</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                            <p className="text-xs text-slate-500 mb-1">Active Staff</p>
                                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{selectedZone.staff}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">Pending Tasks</h4>
                                        <div className="space-y-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition">
                                                    <div className={`h-2 w-2 rounded-full ${i === 1 ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-300 flex-1">
                                                        {selectedZone.name === 'Picking' ? `Pick Order #${1230 + i}` : `Process Item #${5590 + i}`}
                                                    </p>
                                                    <span className="text-xs text-slate-400">2m ago</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition">
                                        View Detailed Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Floating Voice Assistant Button */}
                    <div className="fixed bottom-6 right-6 z-50">
                        <button
                            onClick={() => setIsListening(!isListening)}
                            className={`p-4 rounded-full shadow-lg transition-all transform hover:scale-110 ${isListening
                                ? 'bg-red-500 animate-pulse ring-4 ring-red-200'
                                : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                        >
                            <Mic className="h-6 w-6 text-white" />
                        </button>
                        {isListening && (
                            <div className="absolute bottom-16 right-0 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-64 animate-in slide-in-from-bottom-2">
                                <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">Listening...</p>
                                <div className="flex gap-1 justify-center">
                                    <div className="w-1 h-4 bg-indigo-500 animate-bounce delay-75"></div>
                                    <div className="w-1 h-6 bg-indigo-500 animate-bounce delay-150"></div>
                                    <div className="w-1 h-3 bg-indigo-500 animate-bounce delay-300"></div>
                                    <div className="w-1 h-5 bg-indigo-500 animate-bounce delay-75"></div>
                                </div>
                                <p className="text-xs text-slate-400 mt-2 text-center">Try "Where is order #123?"</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
