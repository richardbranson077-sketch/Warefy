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
    Settings,
    Brain,
    Camera,
    FileText,
    User,
    Laptop,
    BookOpen,
    Shield,
    ShoppingCart,
    DollarSign
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCart },
    { name: 'Inventory', href: '/dashboard/inventory', icon: Package },
    { name: 'Demand Forecast', href: '/dashboard/demand', icon: TrendingUp },
    { name: 'Route Optimization', href: '/dashboard/routes', icon: Map },
    { name: 'AI Recommendations', href: '/dashboard/recommendations', icon: BrainCircuit },
    { name: 'Anomalies', href: '/dashboard/anomalies', icon: AlertTriangle },
    { name: 'Fleet Management', href: '/dashboard/vehicles', icon: Truck },
    { name: 'Financials', href: '/dashboard/financials', icon: DollarSign },
    // Advanced features
    { name: 'AI Command Center', href: '/dashboard/ai-command', icon: Brain },
    { name: 'Computer Vision', href: '/dashboard/computer-vision', icon: Camera },
    { name: 'AI Reports', href: '/dashboard/ai-reports', icon: FileText },
    { name: 'Collaboration', href: '/dashboard/collaboration', icon: User },
    { name: 'Edge AI', href: '/dashboard/edge-ai', icon: Laptop },
    { name: 'Knowledge Base', href: '/dashboard/knowledge-base', icon: BookOpen },
    { name: 'Audit Trail', href: '/dashboard/blockchain', icon: Shield },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 overflow-y-auto hidden md:block z-20">
            <div className="py-4 px-3 space-y-1 pb-20">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group relative ${isActive
                                ? 'text-blue-700 bg-blue-50 shadow-sm border border-blue-100'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full"></div>
                            )}
                            <item.icon className={`mr-3 h-5 w-5 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </div>

            <div className="absolute bottom-0 w-full border-t border-gray-200 p-4 bg-gray-50">
                <Link
                    href="/dashboard/settings"
                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${pathname === '/dashboard/settings'
                        ? 'text-blue-700 bg-blue-50 shadow-sm border border-blue-100'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                >
                    <Settings className={`mr-3 h-5 w-5 ${pathname === '/dashboard/settings' ? 'text-blue-600' : 'text-gray-400'}`} />
                    Settings
                </Link>
            </div>
        </aside>
    );
}
