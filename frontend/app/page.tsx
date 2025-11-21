'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
    TrendingUp,
    BarChart3,
    Package,
    Truck,
    ArrowRight,
    CheckCircle,
    Star,
    User as Users,
    Shield,
    Zap,
    Brain,
    Clock as History,
    AlertTriangle,
    Globe as Smartphone
} from 'lucide-react';

export default function LandingPage() {
    const features = [
        {
            icon: Brain,
            title: 'AI Command Center',
            description: 'Interact with your supply chain using natural language. Ask questions, generate reports, and get instant optimization suggestions powered by advanced LLMs.'
        },
        {
            icon: Package,
            title: 'Real-Time Inventory',
            description: 'Live tracking of stock levels across multiple warehouses. Automated low-stock alerts and predictive reordering prevent stockouts.'
        },
        {
            icon: Truck,
            title: 'Fleet & Route Optimization',
            description: 'Manage your vehicle fleet with precision. AI-driven route planning reduces fuel consumption and improves delivery times.'
        },
        {
            icon: AlertTriangle,
            title: 'Anomaly Detection',
            description: 'Automatically detect irregularities in sales, inventory, or shipments. Proactive alerts help you mitigate risks before they escalate.'
        },
        {
            icon: History,
            title: 'Sales History & Forecasting',
            description: 'Deep dive into historical data to predict future trends. Our forecasting engine helps you plan for seasonal spikes and market shifts.'
        },
        {
            icon: Smartphone,
            title: 'Mobile Driver API',
            description: 'Seamlessly connect your drivers with the platform. Real-time status updates, proof of delivery, and route navigation.'
        }
    ];

    const stats = [
        { value: '99.9%', label: 'System Uptime', icon: Zap },
        { value: '35%', label: 'Cost Reduction', icon: TrendingUp },
        { value: '10k+', label: 'Orders Processed', icon: Package },
        { value: '24/7', label: 'AI Monitoring', icon: Brain }
    ];

    return (
        <div className="min-h-screen bg-white text-gray-900 selection:bg-blue-100 selection:text-blue-900">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <Link href="/" className="flex items-center space-x-3 group">
                            <div className="relative w-10 h-10">
                                <Image src="/logo.png" alt="Warefy" width={40} height={40} className="rounded-lg relative z-10 shadow-sm" />
                            </div>
                            <div>
                                <span className="text-2xl font-bold text-gray-900 tracking-tight">Warefy</span>
                                <div className="text-[10px] uppercase tracking-widest text-blue-600 font-semibold">Intelligent Logistics</div>
                            </div>
                        </Link>
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-gray-600 hover:text-blue-600 transition text-sm font-medium">Platform</a>
                            <a href="#solutions" className="text-gray-600 hover:text-blue-600 transition text-sm font-medium">Solutions</a>
                            <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition text-sm font-medium">Customers</a>
                            <Link href="/login" className="text-gray-600 hover:text-gray-900 transition text-sm font-medium">Sign In</Link>
                            <Link
                                href="/dashboard"
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-40 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-white"></div>

                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 px-4 py-2 rounded-full mb-8">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                                <span className="text-sm text-blue-700 font-medium tracking-wide">AI-POWERED SUPPLY CHAIN</span>
                            </div>

                            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight tracking-tight">
                                Optimize Logistics with
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                    Intelligent Data
                                </span>
                            </h1>

                            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-lg">
                                Connect your entire supply chain—from inventory to delivery. Use our AI Command Center to predict demand, detect anomalies, and automate operations.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-5 mb-12">
                                <Link
                                    href="/dashboard"
                                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xl shadow-blue-600/20 transition text-center flex items-center justify-center group"
                                >
                                    Start Free Trial
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <a
                                    href="#features"
                                    className="px-8 py-4 bg-white border border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-600 rounded-lg font-bold transition text-center flex items-center justify-center shadow-sm hover:shadow-md"
                                >
                                    View Features
                                </a>
                            </div>

                            <div className="flex items-center space-x-8 text-sm font-medium text-gray-500">
                                <div className="flex items-center">
                                    <Shield className="h-5 w-5 text-blue-600 mr-2" />
                                    Enterprise Security
                                </div>
                                <div className="flex items-center">
                                    <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                                    Real-time Sync
                                </div>
                            </div>
                        </div>

                        <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition duration-1000"></div>
                            <div className="relative bg-white rounded-2xl border border-gray-100 p-3 shadow-2xl">
                                <Image
                                    src="/hero-blockchain.png"
                                    alt="Global Logistics Network"
                                    width={800}
                                    height={600}
                                    className="w-full h-auto rounded-xl"
                                    priority
                                />
                                {/* Floating Cards */}
                                <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-xl border border-gray-100 p-4 rounded-xl shadow-xl flex items-center space-x-4">
                                    <div className="bg-green-100 p-2 rounded-lg">
                                        <TrendingUp className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Efficiency Score</div>
                                        <div className="text-green-600 font-bold text-lg">+14.2%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 border-y border-gray-100 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center group cursor-default">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl mb-4 shadow-sm border border-gray-100 group-hover:border-blue-200 transition duration-300">
                                    <stat.icon className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">{stat.value}</div>
                                <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                            Complete Backend <span className="text-blue-600">Control</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Built on a robust Python/FastAPI architecture, Warefy gives you granular control over every aspect of your operations.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-xl hover:shadow-blue-900/5 transition group duration-300"
                            >
                                <div className="inline-flex p-3 bg-blue-50 rounded-xl mb-6 group-hover:bg-blue-600 transition duration-300">
                                    <feature.icon className="h-6 w-6 text-blue-600 group-hover:text-white transition duration-300" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                                {feature.title === 'Real-Time Inventory' && (
                                    <div className="mt-8 rounded-xl overflow-hidden border border-gray-100 shadow-lg">
                                        <div className="bg-gray-50 p-3 border-b border-gray-100 flex justify-between items-center">
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Live Feed</span>
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                            </div>
                                        </div>
                                        <Image
                                            src="/smart-package.png"
                                            alt="AI Tracked Package"
                                            width={400}
                                            height={250}
                                            className="w-full h-auto hover:scale-105 transition duration-700"
                                        />
                                        <div className="bg-white p-3 text-xs text-center text-gray-500 font-mono">
                                            ID: PKG-8829 • STATUS: IN_TRANSIT • ETA: 2H
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Trusted by Industry Leaders
                        </h2>
                        <p className="text-xl text-gray-600">
                            See how Warefy is transforming supply chains worldwide.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                name: 'Sarah Johnson',
                                role: 'Operations Director',
                                company: 'TechCorp',
                                content: 'The AI Command Center is a game changer. I can just ask "How is inventory?" and get a detailed report instantly.',
                                image: '/avatar-sarah.png'
                            },
                            {
                                name: 'Michael Chen',
                                role: 'Logistics Manager',
                                company: 'GlobalShip',
                                content: 'We reduced our fleet fuel consumption by 15% in the first month using the route optimization features.',
                                image: '/avatar-michael.png'
                            },
                            {
                                name: 'Emma Wilson',
                                role: 'CEO',
                                company: 'FastFreight',
                                content: 'The anomaly detection saved us from a major stockout event during peak season. Highly recommended.',
                                image: '/avatar-emma.png'
                            }
                        ].map((testimonial, index) => (
                            <div key={index} className="bg-white border border-gray-100 rounded-2xl p-8 relative hover:-translate-y-2 transition duration-300 shadow-lg shadow-gray-200/50">
                                <div className="flex mb-6">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-8 leading-relaxed relative z-10 italic">
                                    "{testimonial.content}"
                                </p>
                                <div className="flex items-center border-t border-gray-100 pt-6">
                                    <div className="relative h-12 w-12 rounded-full mr-4 ring-2 ring-blue-100 p-0.5">
                                        <Image
                                            src={testimonial.image}
                                            alt={testimonial.name}
                                            width={48}
                                            height={48}
                                            className="rounded-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{testimonial.name}</div>
                                        <div className="text-xs text-blue-600 font-semibold">{testimonial.role} @ {testimonial.company}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-blue-900">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-[128px] opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full blur-[128px] opacity-20"></div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-5xl lg:text-6xl font-bold text-white mb-8 tracking-tight">
                        Ready to Modernize Your <br />
                        <span className="text-blue-200">Supply Chain?</span>
                    </h2>
                    <p className="text-xl mb-10 text-blue-100 max-w-2xl mx-auto">
                        Join hundreds of data-driven companies using Warefy to optimize their logistics.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center px-10 py-5 bg-white text-blue-900 rounded-xl font-bold text-lg shadow-2xl hover:shadow-white/20 transition hover:scale-105"
                        >
                            Start Free Trial
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </div>
                    <p className="text-blue-300 mt-8 text-sm font-medium">
                        NO CREDIT CARD REQUIRED • 14-DAY FREE TRIAL • CANCEL ANYTIME
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white text-gray-600 py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center space-x-2 mb-6">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold">W</span>
                                </div>
                                <span className="text-gray-900 font-bold text-xl tracking-tight">Warefy</span>
                            </div>
                            <p className="text-sm leading-relaxed mb-6">
                                Intelligent supply chain orchestration for the modern economy.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-6 text-gray-900 tracking-wider text-xs uppercase">Product</h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#" className="hover:text-blue-600 transition">Features</a></li>
                                <li><a href="#" className="hover:text-blue-600 transition">Integrations</a></li>
                                <li><a href="#" className="hover:text-blue-600 transition">Pricing</a></li>
                                <li><a href="#" className="hover:text-blue-600 transition">Changelog</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-6 text-gray-900 tracking-wider text-xs uppercase">Resources</h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#" className="hover:text-blue-600 transition">Documentation</a></li>
                                <li><a href="#" className="hover:text-blue-600 transition">API Reference</a></li>
                                <li><a href="#" className="hover:text-blue-600 transition">Community</a></li>
                                <li><a href="#" className="hover:text-blue-600 transition">Blog</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-6 text-gray-900 tracking-wider text-xs uppercase">Legal</h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#" className="hover:text-blue-600 transition">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-blue-600 transition">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-blue-600 transition">Security</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-100 pt-8 text-center text-sm font-medium">
                        <p>© 2025 Warefy Inc. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
