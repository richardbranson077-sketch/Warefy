import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    TrendingUp,
    Map,
    BrainCircuit,
    AlertTriangle,
    Truck,
    Settings
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', href: '/dashboard/inventory', icon: Package },
    { name: 'Demand Forecast', href: '/dashboard/demand', icon: TrendingUp },
    { name: 'Route Optimization', href: '/dashboard/routes', icon: Map },
    { name: 'AI Recommendations', href: '/dashboard/recommendations', icon: BrainCircuit },
    { name: 'Anomalies', href: '/dashboard/anomalies', icon: AlertTriangle },
    { name: 'Fleet Management', href: '/dashboard/vehicles', icon: Truck },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-gray-900/95 backdrop-blur-xl border-r border-white/10 overflow-y-auto hidden md:block z-20">
            <div className="py-4 px-3 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group relative ${isActive
                                ? 'text-white bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_10px_#3b82f6]"></div>
                            )}
                            <item.icon className={`mr-3 h-5 w-5 transition-colors ${isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </div>

            <div className="absolute bottom-0 w-full border-t border-white/10 p-4 bg-gray-900/50 backdrop-blur-sm">
                <Link
                    href="/dashboard/settings"
                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${pathname === '/dashboard/settings'
                        ? 'text-white bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                >
                    <Settings className={`mr-3 h-5 w-5 ${pathname === '/dashboard/settings' ? 'text-blue-400' : 'text-gray-500'}`} />
                    Settings
                </Link>
            </div>
        </aside>
    );
}
