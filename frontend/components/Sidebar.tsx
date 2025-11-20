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
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
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
        <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 overflow-y-auto hidden md:block">
            <div className="py-4 px-3 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || (pathname !== '/' && pathname?.startsWith(item.href));
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive
                                    ? 'bg-primary-50 text-primary-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </div>

            <div className="absolute bottom-0 w-full border-t border-gray-200 p-4">
                <Link
                    href="/dashboard/settings"
                    className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
                >
                    <Settings className="mr-3 h-5 w-5 text-gray-400" />
                    Settings
                </Link>
            </div>
        </aside>
    );
}
