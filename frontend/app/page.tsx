'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
    TrendingUp,
    Package,
    Truck,
    ArrowRight,
    CheckCircle,
    Shield,
    Zap,
    Brain,
    Map,
    BarChart3,
    Layers,
    Globe,
    Clock,
    Package as Database,
    Network,
    Activity,
    Settings,
    Zap as Workflow
} from 'lucide-react';

export default function LandingPage() {
    const platformCapabilities = [
        {
            icon: Brain,
            title: 'AI-Powered Intelligence',
            description: 'Machine learning models that predict demand, optimize inventory, and automate decision-making across your entire supply chain network.'
        },
        {
            icon: Database,
            title: 'Unified Data Platform',
            description: 'Centralize data from warehouses, suppliers, carriers, and sales channels into a single source of truth for your operations.'
        },
        {
            icon: Workflow,
            title: 'Process Automation',
            description: 'Automate procurement, replenishment, routing, and fulfillment workflows to eliminate manual tasks and reduce errors.'
        },
        {
            icon: Activity,
            title: 'Advanced Analytics',
            description: 'Real-time dashboards and predictive analytics that give you visibility into every aspect of your supply chain performance.'
        },
        {
            icon: Network,
            title: 'Network Orchestration',
            description: 'Coordinate multi-warehouse operations, supplier relationships, and distribution networks from a single control center.'
        },
        {
            icon: Settings,
            title: 'Enterprise Integration',
            description: 'Seamlessly connect with your ERP, WMS, TMS, and other enterprise systems through pre-built connectors and APIs.'
        }
    ];

    const benefits = [
        { value: '40%', label: 'Reduction in Operating Costs', suffix: 'up to' },
        { value: '60%', label: 'Inventory Optimization', suffix: 'up to' },
        { value: '50%', label: 'Faster Order Fulfillment', suffix: 'up to' },
        { value: '100%', label: 'Supply Chain Visibility', suffix: 'achieve' }
    ];

    const useCases = [
        {
            name: 'Demand Planning & Forecasting',
            icon: TrendingUp,
            desc: 'Predict future demand with AI models trained on your historical data and market trends.'
        },
        {
            name: 'Inventory Optimization',
            icon: Package,
            desc: 'Maintain optimal stock levels across all locations while minimizing carrying costs.'
        },
        {
            name: 'Warehouse Management',
            icon: Layers,
            desc: 'Streamline receiving, putaway, picking, and shipping operations across your network.'
        },
        {
            name: 'Transportation Management',
            icon: Truck,
            desc: 'Optimize routes, consolidate shipments, and track deliveries in real-time.'
        }
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <Link href="/" className="flex items-center space-x-3 group">
                            <div className="relative w-10 h-10">
                                <Image src="/logo.png" alt="Warefy" width={40} height={40} className="rounded-lg relative z-10 shadow-sm" />
                            </div>
                            <div>
                                <span className="text-2xl font-bold text-slate-900 tracking-tight">Warefy</span>
                                <div className="text-[10px] uppercase tracking-widest text-blue-600 font-semibold">AI That Powers Your Supply Chain</div>
                            </div>
                        </Link>
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#platform" className="text-slate-600 hover:text-blue-600 transition font-medium">Platform</a>
                            <Link href="/services" className="text-slate-600 hover:text-blue-600 transition font-medium">Services</Link>
                            <a href="#integration" className="text-slate-600 hover:text-blue-600 transition font-medium">Integration</a>
                            <Link href="/login" className="text-slate-600 hover:text-slate-900 transition font-medium">Sign In</Link>
                            <Link
                                href="/dashboard"
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5"
                            >
                                View Platform Demo
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100/30 via-transparent to-transparent"></div>

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center space-x-2 bg-white border border-blue-100 px-4 py-1.5 rounded-full mb-8 shadow-sm">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span className="text-sm text-blue-700 font-bold tracking-wide">Enterprise Supply Chain Platform</span>
                    </div>

                    <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight max-w-6xl mx-auto">
                        The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">AI-Powered Platform</span> for End-to-End Supply Chain Management
                    </h1>

                    <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-4xl mx-auto">
                        Warefy unifies planning, execution, and analytics into a single intelligent platform. Automate workflows, optimize inventory, and gain real-time visibility across your entire supply chain network.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
                        <Link
                            href="/dashboard"
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-600/20 transition hover:-translate-y-1 flex items-center justify-center"
                        >
                            Explore Platform
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                        <button className="px-8 py-4 bg-white border-2 border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-600 rounded-xl font-bold text-lg transition shadow-sm hover:shadow-md flex items-center justify-center">
                            Schedule Demo
                        </button>
                    </div>

                    <div className="relative max-w-6xl mx-auto">
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-3xl blur-2xl opacity-30"></div>
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                            <div className="bg-slate-800 px-4 py-3 flex items-center space-x-2">
                                <div className="flex space-x-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                </div>
                                <div className="flex-1 text-center">
                                    <span className="text-xs text-slate-400 font-mono">warefy.ai/platform</span>
                                </div>
                            </div>
                            <Image
                                src="/hero-ai.png"
                                alt="Warefy Supply Chain Platform Dashboard"
                                width={1200}
                                height={675}
                                className="w-full h-auto"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Bar */}
            <section className="py-12 border-y border-slate-100 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-sm text-slate-500 uppercase tracking-wider font-semibold mb-8">
                        Trusted by Supply Chain Leaders
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {benefits.map((stat, index) => (
                            <div key={index} className="text-center group cursor-default">
                                <div className="text-sm text-blue-600 font-bold uppercase tracking-wider mb-2">{stat.suffix}</div>
                                <div className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">{stat.value}</div>
                                <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Platform Capabilities */}
            <section id="platform" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-6">
                            <Database className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-blue-700 font-bold uppercase tracking-wide">Platform Capabilities</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                            Everything You Need in <span className="text-blue-600">One Platform</span>
                        </h2>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                            Warefy brings together planning, execution, visibility, and analytics into a unified cloud platform built for modern supply chains.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {platformCapabilities.map((capability, index) => (
                            <div
                                key={index}
                                className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-xl hover:shadow-blue-900/5 transition group duration-300 hover:-translate-y-1"
                            >
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
                                    <capability.icon className="h-7 w-7 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">
                                    {capability.title}
                                </h3>
                                <p className="text-slate-600 leading-relaxed">
                                    {capability.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Use Cases */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-6">
                                <Workflow className="h-4 w-4 text-blue-600" />
                                <span className="text-sm text-blue-700 font-bold uppercase tracking-wide">Supply Chain Solutions</span>
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">Built for Every Supply Chain Function</h2>
                            <p className="text-lg text-slate-600 mb-8">
                                From demand planning to last-mile delivery, Warefy provides specialized modules that work together seamlessly.
                            </p>
                            <div className="space-y-4">
                                {useCases.map((useCase, i) => (
                                    <div key={i} className="flex items-start p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm mr-4 flex-shrink-0">
                                            <useCase.icon className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 mb-1">{useCase.name}</h4>
                                            <p className="text-sm text-slate-600">{useCase.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-4 bg-blue-100 rounded-3xl transform rotate-3 opacity-50"></div>
                            <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                                <Image
                                    src="/smart-package.png"
                                    alt="Supply Chain Analytics Dashboard"
                                    width={600}
                                    height={400}
                                    className="w-full h-auto"
                                />
                                <div className="p-6 bg-gradient-to-t from-white to-slate-50 border-t border-slate-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="text-sm font-bold text-slate-700">Live Data Sync</span>
                                        </div>
                                        <span className="text-xs text-slate-500 font-mono">Updated 2s ago</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-white p-3 rounded-lg border border-slate-100">
                                            <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Warehouses</div>
                                            <div className="text-lg font-bold text-slate-900">24</div>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg border border-slate-100">
                                            <div className="text-xs text-slate-500 uppercase font-semibold mb-1">SKUs</div>
                                            <div className="text-lg font-bold text-slate-900">8.2K</div>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg border border-slate-100">
                                            <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Orders</div>
                                            <div className="text-lg font-bold text-green-600">+12%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Integration Section */}
            <section id="integration" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-[128px] opacity-20"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center space-x-2 bg-blue-900/50 border border-blue-500/30 px-3 py-1 rounded-full mb-6">
                            <Network className="h-4 w-4 text-blue-400" />
                            <span className="text-sm text-blue-300 font-bold uppercase tracking-wide">Enterprise Integration</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Connects with Your Existing Systems</h2>
                        <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                            Pre-built connectors for ERP, WMS, TMS, and e-commerce platforms. Deploy in weeks, not months.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: 'ERP Systems', items: ['SAP', 'Oracle', 'Microsoft Dynamics', 'NetSuite'] },
                            { title: 'E-Commerce', items: ['Shopify', 'Magento', 'WooCommerce', 'BigCommerce'] },
                            { title: 'Logistics', items: ['FedEx', 'UPS', 'DHL', 'Custom Carriers'] }
                        ].map((category, i) => (
                            <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-xl">
                                <h3 className="text-lg font-bold mb-4 text-blue-300">{category.title}</h3>
                                <ul className="space-y-2">
                                    {category.items.map((item, j) => (
                                        <li key={j} className="flex items-center text-blue-100 text-sm">
                                            <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <p className="text-blue-200 mb-6">Plus REST APIs, webhooks, and custom integrations</p>
                        <button className="px-8 py-3 bg-white text-slate-900 rounded-lg font-bold hover:bg-blue-50 transition">
                            View Integration Docs
                        </button>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-center">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                        Ready to Transform Your Supply Chain?
                    </h2>
                    <p className="text-2xl text-blue-100 mb-10 font-medium">
                        Join leading enterprises using Warefy to optimize their operations.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <Link
                            href="/dashboard"
                            className="px-10 py-4 bg-white text-blue-700 rounded-xl font-bold text-lg shadow-2xl hover:shadow-white/20 transition hover:scale-105 flex items-center justify-center"
                        >
                            View Platform Demo
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                        <button className="px-10 py-4 bg-blue-800/50 border-2 border-blue-400/30 hover:bg-blue-800 text-white rounded-xl font-bold text-lg transition flex items-center justify-center">
                            Talk to Sales
                        </button>
                    </div>
                    <div className="mt-12 pt-12 border-t border-blue-500/30 flex flex-wrap justify-center gap-8 text-blue-200 text-sm font-medium">
                        <span className="flex items-center"><CheckCircle className="h-4 w-4 mr-2" /> Free Trial Available</span>
                        <span className="flex items-center"><CheckCircle className="h-4 w-4 mr-2" /> No Credit Card Required</span>
                        <span className="flex items-center"><CheckCircle className="h-4 w-4 mr-2" /> Enterprise Support</span>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-50 text-slate-600 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center space-x-2 mb-4 md:mb-0">
                        <div className="relative w-8 h-8">
                            <Image src="/logo.png" alt="Warefy" width={32} height={32} className="rounded-lg" />
                        </div>
                        <span className="text-slate-900 font-bold text-xl">Warefy</span>
                    </div>
                    <div className="flex space-x-8 text-sm font-medium">
                        <a href="#platform" className="hover:text-blue-600 transition">Platform</a>
                        <Link href="/services" className="hover:text-blue-600 transition">Services</Link>
                        <a href="#" className="hover:text-blue-600 transition">Privacy</a>
                        <a href="#" className="hover:text-blue-600 transition">Contact</a>
                    </div>
                    <div className="mt-4 md:mt-0 text-sm text-slate-500">
                        © 2025 Warefy Inc. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
