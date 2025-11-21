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
    Smartphone,
    Globe,
    Clock,
    AlertTriangle,
    Database,
    Server,
    Lock,
    Search
} from 'lucide-react';

export default function ServicesPage() {
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
                                <div className="text-[10px] uppercase tracking-widest text-blue-600 font-semibold">Intelligent Logistics</div>
                            </div>
                        </Link>
                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="/#features" className="text-slate-600 hover:text-blue-600 transition font-medium">Features</Link>
                            <Link href="/services" className="text-blue-600 font-bold transition">Services</Link>
                            <Link href="/#industries" className="text-slate-600 hover:text-blue-600 transition font-medium">Industries</Link>
                            <Link href="/login" className="text-slate-600 hover:text-slate-900 transition font-medium">Sign In</Link>
                            <Link
                                href="/dashboard"
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5"
                            >
                                Request Demo
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-50">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100/50 via-transparent to-transparent"></div>
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center space-x-2 bg-white border border-blue-100 px-4 py-1.5 rounded-full mb-8 shadow-sm">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span className="text-sm text-blue-700 font-bold tracking-wide uppercase">AI-Powered Optimization</span>
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight max-w-5xl mx-auto">
                        The AI Operating System for <br className="hidden lg:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            Modern Supply Chains
                        </span>
                    </h1>
                    <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-3xl mx-auto">
                        Warefy is a global, AI-powered supply chain optimization platform that helps companies predict demand, manage inventory, and orchestrate logistics in real time.
                        <br /><span className="font-semibold text-slate-800">We don’t just give you data — We give you decisions, automation, and control.</span>
                    </p>
                </div>
            </section>

            {/* The Global Problem */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center space-x-2 bg-red-50 border border-red-100 px-3 py-1 rounded-full mb-6">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                <span className="text-sm text-red-700 font-bold uppercase tracking-wide">The Global Problem</span>
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">In today’s world, supply chains are more complex than ever.</h2>
                            <p className="text-lg text-slate-600 mb-8">
                                Global disruptions, rising fuel costs, and unpredictable demand patterns are causing billions in lost inefficiencies every year. Most companies still rely on:
                            </p>
                            <ul className="space-y-4">
                                {[
                                    'Manual spreadsheets & static reports',
                                    'Outdated ERP systems',
                                    'Guesswork in operations',
                                    'Poor real-time visibility'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center text-slate-700">
                                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mr-3 flex-shrink-0">
                                            <span className="text-red-600 font-bold text-xs">✕</span>
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 relative">
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-100 rounded-full opacity-50 blur-xl"></div>
                            <h3 className="text-xl font-bold text-slate-900 mb-6">The Result?</h3>
                            <div className="space-y-6">
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center">
                                    <TrendingUp className="h-8 w-8 text-red-500 mr-4" />
                                    <div>
                                        <div className="text-sm text-slate-500 uppercase font-semibold">Lost Revenue</div>
                                        <div className="text-lg font-bold text-slate-900">Billions in inefficiencies</div>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center">
                                    <Clock className="h-8 w-8 text-orange-500 mr-4" />
                                    <div>
                                        <div className="text-sm text-slate-500 uppercase font-semibold">Operational Delays</div>
                                        <div className="text-lg font-bold text-slate-900">Reactive vs. Proactive</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* The Warefy Solution */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center space-x-2 bg-blue-900/50 border border-blue-500/30 px-3 py-1 rounded-full mb-6">
                            <CheckCircle className="h-4 w-4 text-blue-400" />
                            <span className="text-sm text-blue-300 font-bold uppercase tracking-wide">The Warefy Solution</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">A Single Intelligent System</h2>
                        <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                            Warefy connects your data, vehicles, warehouses, and deliveries into a platform that sees, thinks, predicts, and optimizes continuously.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        {[
                            { icon: Brain, title: 'Predictive Intelligence', desc: 'Demand forecasting & risk detection' },
                            { icon: Layers, title: 'Multi-warehouse Optimization', desc: 'Stock rebalancing & automated replenishment' },
                            { icon: Map, title: 'Real-Time Tracking', desc: 'Live fleet visibility & route optimization' },
                            { icon: Zap, title: 'Automated Decisions', desc: 'AI-powered suggestions & actions' },
                            { icon: Shield, title: 'Predictive Maintenance', desc: 'Prevent breakdowns before they happen' },
                            { icon: BarChart3, title: 'Cost Minimization', desc: 'Reduce fuel, storage, and operational costs' }
                        ].map((feature, i) => (
                            <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-xl hover:bg-white/10 transition">
                                <feature.icon className="h-8 w-8 text-blue-400 mb-4" />
                                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                                <p className="text-blue-200 text-sm">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Real-Time Fleet Tracking */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1">
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
                                <Image src="/hero-ai.png" alt="Real-Time Fleet Tracking" width={800} height={600} className="w-full h-auto" />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 to-transparent p-8">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-white font-bold">Live Fleet Status: Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-6">
                                <Map className="h-4 w-4 text-blue-600" />
                                <span className="text-sm text-blue-700 font-bold uppercase tracking-wide">Real-Time Live Fleet Tracking</span>
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">Turn your logistics from reactive to proactive.</h2>
                            <p className="text-lg text-slate-600 mb-8">
                                Warefy includes live vehicle tracking using GPS and telematics data. From a single dashboard, see where your fleet is right now, detect delays instantly, and respond before customers complain.
                            </p>
                            <ul className="space-y-3 mb-8">
                                {[
                                    'Real-time location of every vehicle',
                                    'Route deviation detection',
                                    'ETA predictions using AI',
                                    'Fuel usage monitoring & driver insights'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center text-slate-700">
                                        <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core AI Capabilities */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Core AI Capabilities</h2>
                        <p className="text-lg text-slate-600">Advanced intelligence powering your operations.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'AI Demand Forecasting',
                                desc: 'Uses deep learning models (LSTM, XGBoost) to predict future product demand, seasonal fluctuations, and surges.',
                                result: 'Smarter purchasing, fewer stockouts, reduced waste.',
                                icon: Brain
                            },
                            {
                                title: 'Smart Inventory Optimization',
                                desc: 'Continuously analyzes stock levels to recommend replenishment schedules, rebalancing, and detect overstock risks.',
                                result: 'Lower storage costs, optimized capital flow.',
                                icon: Package
                            },
                            {
                                title: 'Autonomous Route Optimization',
                                desc: 'Analyzes traffic, distance, fuel, and delivery windows to deliver the most efficient delivery plan automatically.',
                                result: 'Faster delivery, lower fuel costs.',
                                icon: Truck
                            },
                            {
                                title: 'AI Business Intelligence Assistant',
                                desc: 'Ask questions like "Why were deliveries delayed?" and get data-backed, explainable answers in seconds.',
                                result: 'Instant data-driven decision making.',
                                icon: Search
                            },
                            {
                                title: 'Predictive Vehicle Maintenance',
                                desc: 'Predicts when each vehicle needs servicing by analyzing engine health, mileage, and historical data.',
                                result: 'Fewer breakdowns, longer vehicle lifespan.',
                                icon: Shield
                            },
                            {
                                title: 'Real-Time Risk Detection',
                                desc: 'Detects unusual demand spikes, delivery delays, and stock shortages before they become problems.',
                                result: 'Instant alerts and recommended actions.',
                                icon: AlertTriangle
                            }
                        ].map((cap, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                                    <cap.icon className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{cap.title}</h3>
                                <p className="text-slate-600 text-sm mb-4 leading-relaxed">{cap.desc}</p>
                                <div className="pt-4 border-t border-slate-50">
                                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Result:</span>
                                    <span className="text-xs text-slate-500 ml-2">{cap.result}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Impact Stats */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-900 text-white">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-12">What Companies Achieve With Warefy</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { val: '20-45%', label: 'Reduction in Logistics Costs' },
                            { val: '30-60%', label: 'Inventory Efficiency Improvement' },
                            { val: '50%', label: 'Improvement in On-Time Deliveries' },
                            { val: '15-25%', label: 'Increase in Operational Profit' }
                        ].map((stat, i) => (
                            <div key={i} className="p-6 bg-white/5 rounded-2xl border border-white/10">
                                <div className="text-4xl font-extrabold text-blue-400 mb-2">{stat.val}</div>
                                <div className="text-sm text-blue-100 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Integration & Security */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-16">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                                <Layers className="h-6 w-6 text-blue-600 mr-3" />
                                Built for Scale & Integration
                            </h3>
                            <p className="text-slate-600 mb-6">
                                Warefy integrates easily with ERP systems (SAP, Oracle, NetSuite), e-commerce platforms, and fleet management providers. It scales from startups to multinational operations.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                {['SAP', 'Oracle', 'NetSuite', 'Shopify', 'Salesforce', 'IoT Providers'].map((tech, i) => (
                                    <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">{tech}</span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                                <Lock className="h-6 w-6 text-blue-600 mr-3" />
                                Enterprise-Level Security
                            </h3>
                            <ul className="space-y-3">
                                {[
                                    'End-to-end encryption',
                                    'Role-based access control',
                                    'Secure API integrations',
                                    'Compliance-ready architecture'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center text-slate-700">
                                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Vision & CTA */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 text-center">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Vision</h2>
                        <p className="text-xl text-slate-600 italic">
                            "We believe supply chains shouldn’t run on guesswork. They should run on intelligence."
                        </p>
                    </div>

                    <div className="bg-white p-12 rounded-3xl shadow-xl border border-slate-100">
                        <h2 className="text-4xl font-bold text-slate-900 mb-6">Take Control of Your Supply Chain</h2>
                        <p className="text-xl text-slate-600 mb-10">
                            Reduce costs. Predict demand. Track everything. Run your operations like the world’s best logistics companies.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link
                                href="/dashboard"
                                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-600/20 transition hover:-translate-y-1 flex items-center justify-center"
                            >
                                Request Demo
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                            <button className="px-8 py-4 bg-white border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-600 rounded-xl font-bold text-lg transition shadow-sm hover:shadow-md">
                                Join Early Access
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white text-slate-600 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center space-x-2 mb-4 md:mb-0">
                        <div className="relative w-8 h-8">
                            <Image src="/logo.png" alt="Warefy" width={32} height={32} className="rounded-lg" />
                        </div>
                        <span className="text-slate-900 font-bold text-xl">Warefy</span>
                    </div>
                    <div className="flex space-x-8 text-sm font-medium">
                        <Link href="/" className="hover:text-blue-600 transition">Home</Link>
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
