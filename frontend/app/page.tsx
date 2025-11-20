'use client';

import Link from 'next/link';
import {
    TrendingUp,
    Package,
    Truck,
    Brain,
    BarChart3,
    Shield,
    Zap,
    Globe,
    ArrowRight,
    CheckCircle,
    Star,
    Users,
    Clock,
    Target
} from 'lucide-react';

export default function LandingPage() {
    const features = [
        {
            icon: Brain,
            title: 'AI-Powered Forecasting',
            description: 'Leverage advanced machine learning to predict demand with 95% accuracy. Make data-driven decisions with confidence.',
            color: 'from-purple-500 to-pink-500'
        },
        {
            icon: Package,
            title: 'Smart Inventory Management',
            description: 'Real-time tracking across multiple warehouses with automated reordering and stock optimization.',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            icon: Truck,
            title: 'Route Optimization',
            description: 'Reduce delivery costs by 30% with AI-powered route planning and real-time traffic analysis.',
            color: 'from-green-500 to-emerald-500'
        },
        {
            icon: BarChart3,
            title: 'Advanced Analytics',
            description: 'Comprehensive dashboards with actionable insights, KPIs, and customizable reports.',
            color: 'from-orange-500 to-red-500'
        },
        {
            icon: Shield,
            title: 'Anomaly Detection',
            description: 'Identify supply chain disruptions before they impact operations with predictive alerts.',
            color: 'from-indigo-500 to-purple-500'
        },
        {
            icon: Zap,
            title: 'Real-Time Updates',
            description: 'Live data synchronization across all operations with instant notifications and alerts.',
            color: 'from-yellow-500 to-orange-500'
        }
    ];

    const stats = [
        { value: '95%', label: 'Forecast Accuracy', icon: Target },
        { value: '30%', label: 'Cost Reduction', icon: TrendingUp },
        { value: '24/7', label: 'Monitoring', icon: Clock },
        { value: '500+', label: 'Companies', icon: Users }
    ];

    const testimonials = [
        {
            name: 'Sarah Johnson',
            role: 'Supply Chain Director',
            company: 'TechCorp Inc.',
            content: 'Warefy transformed our operations. We reduced costs by 35% and improved delivery times significantly.',
            rating: 5
        },
        {
            name: 'Michael Chen',
            role: 'Operations Manager',
            company: 'Global Logistics',
            content: 'The AI forecasting is incredibly accurate. We\'ve eliminated stockouts and reduced excess inventory.',
            rating: 5
        },
        {
            name: 'Emily Rodriguez',
            role: 'CEO',
            company: 'FastShip Solutions',
            content: 'Best investment we\'ve made. The ROI was visible within the first month of implementation.',
            rating: 5
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-2 rounded-lg">
                                <Package className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">Warefy</span>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-gray-600 hover:text-gray-900 transition">Features</a>
                            <a href="#benefits" className="text-gray-600 hover:text-gray-900 transition">Benefits</a>
                            <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition">Testimonials</a>
                            <Link
                                href="/dashboard"
                                className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                                <Zap className="h-4 w-4" />
                                <span>AI-Powered Supply Chain Platform</span>
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                                Optimize Your Supply Chain with{' '}
                                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                                    Artificial Intelligence
                                </span>
                            </h1>
                            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                Transform your operations with cutting-edge AI technology. Predict demand, optimize routes,
                                and maximize efficiency—all in one powerful platform.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl hover:shadow-xl transition transform hover:-translate-y-0.5"
                                >
                                    Start Free Trial
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                                <a
                                    href="#features"
                                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:text-blue-600 transition"
                                >
                                    Learn More
                                </a>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-3xl blur-3xl opacity-20"></div>
                            <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                                <div className="grid grid-cols-2 gap-6">
                                    {stats.map((stat, index) => (
                                        <div key={index} className="text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
                                            <stat.icon className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                                            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-1">
                                                {stat.value}
                                            </div>
                                            <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                            Powerful Features for Modern Supply Chains
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Everything you need to optimize, automate, and scale your supply chain operations
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group bg-white rounded-2xl p-8 border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300"
                            >
                                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.color} mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                                    <feature.icon className="h-7 w-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-cyan-500">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="text-white">
                            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                                Why Leading Companies Choose Warefy
                            </h2>
                            <p className="text-xl text-blue-100 mb-8">
                                Join hundreds of companies optimizing their supply chains with AI-powered intelligence
                            </p>
                            <div className="space-y-4">
                                {[
                                    'Reduce operational costs by up to 30%',
                                    'Improve forecast accuracy to 95%+',
                                    'Real-time visibility across all operations',
                                    'Seamless integration with existing systems',
                                    'Enterprise-grade security and compliance',
                                    '24/7 dedicated customer support'
                                ].map((benefit, index) => (
                                    <div key={index} className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 mt-1">
                                            <CheckCircle className="h-6 w-6 text-cyan-300" />
                                        </div>
                                        <span className="text-lg text-blue-50">{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-10 border border-white/20">
                            <div className="text-center text-white mb-8">
                                <Globe className="h-16 w-16 mx-auto mb-6 text-cyan-300" />
                                <h3 className="text-3xl font-bold mb-4">Trusted Globally</h3>
                                <p className="text-blue-100 text-lg mb-8">
                                    Managing supply chains across 50+ countries with proven results
                                </p>
                            </div>
                            <Link
                                href="/dashboard"
                                className="w-full inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-xl hover:bg-blue-50 transition shadow-lg"
                            >
                                Start Your Free Trial
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                            Loved by Supply Chain Professionals
                        </h2>
                        <p className="text-xl text-gray-600">
                            See what our customers have to say about Warefy
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                                <div className="flex mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-6 leading-relaxed">
                                    "{testimonial.content}"
                                </p>
                                <div className="flex items-center">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg mr-4">
                                        {testimonial.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                                        <div className="text-sm text-gray-600">{testimonial.role}</div>
                                        <div className="text-sm text-gray-500">{testimonial.company}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-12 lg:p-16 shadow-2xl">
                        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                            Ready to Transform Your Supply Chain?
                        </h2>
                        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                            Join the future of supply chain management. Start your free trial today—no credit card required.
                        </p>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center justify-center px-10 py-5 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl hover:shadow-2xl transition transform hover:-translate-y-1"
                        >
                            Access Dashboard Now
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                        <p className="text-gray-400 mt-6 text-sm">
                            Free 14-day trial • No credit card required • Cancel anytime
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-2 rounded-lg">
                                    <Package className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-white font-bold text-lg">Warefy</span>
                            </div>
                            <p className="text-sm text-gray-500">
                                AI-powered supply chain optimization platform for modern businesses.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                                <li><a href="#benefits" className="hover:text-white transition">Benefits</a></li>
                                <li><a href="/dashboard" className="hover:text-white transition">Dashboard</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                                <li><a href="#testimonials" className="hover:text-white transition">Testimonials</a></li>
                                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-white transition">Security</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm">© 2025 Warefy. All rights reserved. Powered by AI.</p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <a href="#" className="hover:text-white transition">Twitter</a>
                            <a href="#" className="hover:text-white transition">LinkedIn</a>
                            <a href="#" className="hover:text-white transition">GitHub</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
