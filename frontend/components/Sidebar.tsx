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
    DollarSign,
    PackageOpen,
    Zap,
    Link2,
    ShoppingBag,
    RotateCcw,
    Clock,
    CheckCircle,
    Lock,
    BarChart3,
    Target,
    TrendingUpIcon
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, section: 'main' },

    // Core Operations
    { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCart, section: 'operations' },
    { name: 'Inventory', href: '/dashboard/inventory', icon: Package, section: 'operations' },
    { name: 'Route Optimization', href: '/dashboard/routes', icon: Map, section: 'operations' },
    { name: 'Fleet Management', href: '/dashboard/vehicles', icon: Truck, section: 'operations' },

    // Enterprise Integration
    { name: 'Multi-Carrier Shipping', href: '/dashboard/shipping', icon: PackageOpen, section: 'integration' },
    { name: 'Smart Reorder', href: '/dashboard/reorder', icon: Zap, section: 'integration' },
    { name: 'ERP Integration', href: '/dashboard/erp', icon: Link2, section: 'integration' },
    { name: 'E-commerce', href: '/dashboard/ecommerce', icon: ShoppingBag, section: 'integration' },

    // Advanced Features
    { name: 'Returns Management', href: '/dashboard/returns', icon: RotateCcw, section: 'advanced' },
    { name: 'Labor Management', href: '/dashboard/labor', icon: Clock, section: 'advanced' },
    { name: 'Quality Control', href: '/dashboard/quality', icon: CheckCircle, section: 'advanced' },
    { name: 'RBAC & Permissions', href: '/dashboard/rbac', icon: Lock, section: 'advanced' },

    // Analytics & AI
    { name: 'Demand Forecast', href: '/dashboard/demand', icon: TrendingUp, section: 'analytics' },
    { name: 'ML Forecasting', href: '/dashboard/forecasting', icon: TrendingUpIcon, section: 'analytics' },
    { name: 'Performance Benchmarking', href: '/dashboard/benchmarking', icon: Target, section: 'analytics' },
    { name: 'AI Reports', href: '/dashboard/ai-reports', icon: FileText, section: 'analytics' },
    { name: 'Advanced Reporting', href: '/dashboard/reporting', icon: BarChart3, section: 'analytics' },

    // AI & Innovation
    { name: 'AI Command Center', href: '/dashboard/ai-command', icon: Brain, section: 'ai' },
    { name: 'AI Recommendations', href: '/dashboard/recommendations', icon: BrainCircuit, section: 'ai' },
    { name: 'Computer Vision', href: '/dashboard/computer-vision', icon: Camera, section: 'ai' },
    { name: 'Edge AI', href: '/dashboard/edge-ai', icon: Laptop, section: 'ai' },

    // Other
    { name: 'Anomalies', href: '/dashboard/anomalies', icon: AlertTriangle, section: 'other' },
    { name: 'Financials', href: '/dashboard/financials', icon: DollarSign, section: 'other' },
    { name: 'Audit Trail', href: '/dashboard/blockchain', icon: Shield, section: 'other' },
    { name: 'Collaboration', href: '/dashboard/collaboration', icon: User, section: 'other' },
    { name: 'Knowledge Base', href: '/dashboard/knowledge-base', icon: BookOpen, section: 'other' },
];

const sections = [
    { id: 'main', label: 'Main' },
    { id: 'operations', label: 'Operations' },
    { id: 'integration', label: 'Enterprise Integration' },
    { id: 'advanced', label: 'Advanced Features' },
    { id: 'analytics', label: 'Analytics & AI' },
    { id: 'ai', label: 'AI Innovation' },
    { id: 'other', label: 'Other' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 hidden md:block z-20 flex flex-col">
            {/* Scrollable navigation */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 pb-4">
                {sections.map((section) => {
                    const sectionItems = navigation.filter(item => item.section === section.id);
                    if (sectionItems.length === 0) return null;

                    return (
                        <div key={section.id}>
                            {section.id !== 'main' && (
                                <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {section.label}
                                </h3>
                            )}
                            <div className="space-y-1">
                                {sectionItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group relative ${isActive
                                                    ? 'text-blue-700 bg-blue-50 shadow-sm border border-blue-100'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                }`}
                                        >
                                            {isActive && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full"></div>
                                            )}
                                            <item.icon className={`mr-3 h-4 w-4 flex-shrink-0 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                                                }`} />
                                            <span className="truncate">{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Fixed settings at bottom */}
            <div className="border-t border-gray-200 p-3 bg-gray-50">
                <Link
                    href="/dashboard/settings"
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${pathname === '/dashboard/settings'
                            ? 'text-blue-700 bg-blue-50 shadow-sm border border-blue-100'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                >
                    <Settings className={`mr-3 h-4 w-4 ${pathname === '/dashboard/settings' ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                    Settings
                </Link>
            </div>
        </aside>
    );
}
