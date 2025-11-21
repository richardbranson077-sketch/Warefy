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
    Globe as Smartphone,
    Globe,
    Clock
} from 'lucide-react';

export default function LandingPage() {
    const features = [
        {
            icon: Brain,
            title: 'AI Demand Forecasting',
            description: 'Predict product demand with advanced ML algorithms that analyze historical data and market trends.'
        },
        {
            icon: Map,
            title: 'Real-Time Vehicle Tracking',
            description: 'Track fleets with GPS, live ETAs, and instant delay alerts to keep your logistics running smoothly.'
        },
        {
            icon: Package,
            title: 'Smart Inventory Management',
            description: 'Optimize stock levels automatically. Prevent stockouts and overstocking with intelligent reordering.'
        },
        {
            icon: Truck,
            title: 'AI Route Optimization',
            description: 'Reduce delays and fuel costs with smart route planning that adapts to traffic and weather in real-time.'
        },
        {
            icon: Shield,
            title: 'Predictive Maintenance',
            description: 'Prevent breakdowns before they occur. AI monitors vehicle health to schedule maintenance proactively.'
        },
        {
            icon: Zap,
            title: 'AI Business Assistant',
            description: 'Ask questions and get instant data-driven answers about your supply chain performance.'
        }
    ];

    const benefits = [
        { value: '40%', label: 'Reduce Logistics Costs', suffix: 'up to' },
        { value: '50%', label: 'Improve Delivery Times', suffix: 'up to' },
        { value: '60%', label: 'Increase Inventory Efficiency', suffix: 'up to' },
        { value: '100%', label: 'Real-Time Visibility', suffix: 'gain' }
    ];

    const industries = [
        { name: 'Logistics Companies', icon: Globe },
        { name: 'Retail & E-commerce', icon: Package },
        { name: 'Distribution Networks', icon: Layers },
        { name: 'Manufacturing', icon: Zap }
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
                                <div className="text-[10px] uppercase tracking-widest text-blue-600 font-semibold">Intelligent Logistics</div>
                            </div>
                        </Link>
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-slate-600 hover:text-blue-600 transition font-medium">Features</a>
                            <a href="#industries" className="text-slate-600 hover:text-blue-600 transition font-medium">Industries</a>
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
                        <span className="text-sm text-blue-700 font-bold tracking-wide">The AI Operating System for Supply Chains</span>
                    </div>

                    <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight max-w-6xl mx-auto">
                        Warefy helps businesses reduce costs, improve delivery times, and make smarter supply chain decisions with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">AI-powered insights and real-time visibility.</span>
                    </h1>

                    <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-4xl mx-auto">
                        From warehouses to fleets around the world, Warefy connects every part of your supply chain with AI intelligence, predictive analytics, and live operational tracking.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
                        <Link
                            href="/dashboard"
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-600/20 transition hover:-translate-y-1 flex items-center justify-center"
                        >
                            Request Demo
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                        <button className="px-8 py-4 bg-white border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-600 rounded-xl font-bold text-lg transition shadow-sm hover:shadow-md flex items-center justify-center">
                            Join Early Access
                        </button>
                    </div>

                    <div className="relative max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-900">
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 opacity-60"></div>
                        <Image
                            src="/hero-ai.png"
                            alt="Warefy AI Supply Chain Dashboard"
                            width={1200}
                            height={675}
                            className="w-full h-auto object-cover"
                            priority
                        />
                        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center space-x-4">
                            <button className="px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full text-sm font-medium hover:bg-white/20 transition">
                                Optimize My Supply Chain
                            </button>
                            <button className="px-6 py-2 bg-blue-600/90 backdrop-blur-md text-white rounded-full text-sm font-medium hover:bg-blue-600 transition shadow-lg shadow-blue-600/20">
                                Start Supply Chain Automation
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Overview Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">What Is Warefy?</h2>
                    <p className="text-xl text-slate-600 leading-relaxed">
                        Warefy is an AI-powered supply chain platform that gives businesses real-time visibility, predictive intelligence, and automated optimization across their entire logistics operations. From warehouses to delivery vehicles, Warefy helps you see everything, predict everything, and improve everything.
                    </p>
                    <div className="mt-10">
                        <button className="text-blue-600 font-bold hover:text-blue-700 flex items-center justify-center mx-auto group">
                            Get Supply Chain Insights
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Core Features Grid */}
            <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-slate-900 mb-4">Core Features</h2>
                        <p className="text-lg text-slate-600">Everything you need to run smarter logistics.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition duration-300 group">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition duration-300">
                                    <feature.icon className="h-6 w-6 text-blue-600 group-hover:text-white transition duration-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed mb-6">{feature.description}</p>
                                <div className="pt-4 border-t border-slate-50">
                                    <span className="text-sm font-bold text-blue-600 cursor-pointer hover:underline">
                                        {index === 0 ? 'Predict & Optimize Now' :
                                            index === 1 ? 'Track Fleet in Real Time' :
                                                index === 2 ? 'Monitor Inventory Now' :
                                                    index === 3 ? 'View Delivery Routes' :
                                                        'Learn more'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Value / Benefits Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <Image
                        src="/feature-analytics.png"
                        alt="Background Analytics"
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 to-slate-900/90"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 text-center mb-16">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="p-6">
                                <div className="text-sm text-blue-400 font-bold uppercase tracking-wider mb-2">{benefit.suffix}</div>
                                <div className="text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight">{benefit.value}</div>
                                <div className="text-slate-300 font-medium">{benefit.label}</div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center max-w-3xl mx-auto">
                        <blockquote className="text-2xl font-medium text-slate-200 leading-relaxed mb-10">
                            "Warefy doesn’t just show you data — it helps you make better decisions automatically."
                        </blockquote>
                        <div className="flex flex-wrap justify-center gap-4">
                            <button className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition shadow-lg shadow-blue-600/20">
                                Transform Your Supply Chain
                            </button>
                            <button className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg font-bold transition">
                                Run Smarter Logistics
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Industries Section */}
            <section id="industries" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl font-bold text-slate-900 mb-6">Built for Growth</h2>
                            <p className="text-xl text-slate-600 mb-8">
                                Whether you are a global logistics provider or a growing e-commerce brand, Warefy scales with your needs. Cloud-based, secure, ERP-ready.
                            </p>
                            <ul className="space-y-4 mb-10">
                                {industries.map((industry, index) => (
                                    <li key={index} className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mr-4 text-blue-600">
                                            <industry.icon className="h-5 w-5" />
                                        </div>
                                        <span className="text-lg font-bold text-slate-800">{industry.name}</span>
                                    </li>
                                ))}
                            </ul>
                            <button className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold transition flex items-center">
                                Start as a Logistics Partner
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </button>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-4 bg-blue-100 rounded-3xl transform rotate-3 opacity-50"></div>
                            <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                                <Image
                                    src="/smart-package.png"
                                    alt="Warefy Industry Application"
                                    width={600}
                                    height={400}
                                    className="w-full h-auto"
                                />
                                <div className="p-6 bg-white border-t border-slate-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="text-sm font-bold text-slate-700">System Active</span>
                                        </div>
                                        <span className="text-sm text-slate-500">v2.4.0</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-600 w-3/4"></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-500">
                                            <span>Optimization Progress</span>
                                            <span>75%</span>
                                        </div>
                                    </div>
                                    <div className="mt-6 grid grid-cols-2 gap-4">
                                        <button className="w-full py-2 text-sm font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
                                            Check Status
                                        </button>
                                        <button className="w-full py-2 text-sm font-bold text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                                            View Report
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-center">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                        Ready To Transform Your Supply Chain?
                    </h2>
                    <p className="text-2xl text-blue-100 mb-10 font-medium">
                        Stop reacting. Start predicting.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <Link
                            href="/dashboard"
                            className="px-10 py-4 bg-white text-blue-700 rounded-xl font-bold text-lg shadow-2xl hover:shadow-white/20 transition hover:scale-105 flex items-center justify-center"
                        >
                            Request Demo
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                        <button className="px-10 py-4 bg-blue-800/50 border border-blue-400/30 hover:bg-blue-800 text-white rounded-xl font-bold text-lg transition flex items-center justify-center">
                            Join Early Access
                        </button>
                    </div>
                    <div className="mt-12 pt-12 border-t border-blue-500/30 flex flex-wrap justify-center gap-8 text-blue-200 text-sm font-medium">
                        <span className="flex items-center"><CheckCircle className="h-4 w-4 mr-2" /> No Credit Card Required</span>
                        <span className="flex items-center"><CheckCircle className="h-4 w-4 mr-2" /> 14-Day Free Trial</span>
                        <span className="flex items-center"><CheckCircle className="h-4 w-4 mr-2" /> Cancel Anytime</span>
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
                        <a href="#" className="hover:text-blue-600 transition">Privacy</a>
                        <a href="#" className="hover:text-blue-600 transition">Terms</a>
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
