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
    CheckCircle
} from 'lucide-react';

export default function LandingPage() {
    const features = [
        {
            icon: Brain,
            title: 'AI-Powered Forecasting',
            description: 'Predict demand with 95% accuracy using advanced machine learning algorithms',
            color: 'bg-gradient-to-br from-purple-500 to-pink-500'
        },
        {
            icon: Package,
            title: 'Smart Inventory Management',
            description: 'Real-time tracking across multiple warehouses with automated reordering',
            color: 'bg-gradient-to-br from-blue-500 to-cyan-500'
        },
        {
            icon: Truck,
            title: 'Route Optimization',
            description: 'Reduce delivery costs by 30% with intelligent route planning',
            color: 'bg-gradient-to-br from-green-500 to-emerald-500'
        },
        {
            icon: BarChart3,
            title: 'Advanced Analytics',
            description: 'Comprehensive dashboards with actionable insights and KPIs',
            color: 'bg-gradient-to-br from-orange-500 to-red-500'
        },
        {
            icon: Shield,
            title: 'Anomaly Detection',
            description: 'Identify supply chain disruptions before they impact operations',
            color: 'bg-gradient-to-br from-indigo-500 to-purple-500'
        },
        {
            icon: Zap,
            title: 'Real-Time Updates',
            description: 'Live data synchronization across all your supply chain operations',
            color: 'bg-gradient-to-br from-yellow-500 to-orange-500'
        }
    ];

    const stats = [
        { value: '95%', label: 'Forecast Accuracy' },
        { value: '30%', label: 'Cost Reduction' },
        { value: '24/7', label: 'Monitoring' },
        { value: '50+', label: 'Integrations' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-70"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
                    {/* Logo */}
                    <div className="flex items-center justify-center mb-8">
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl blur-lg opacity-50"></div>
                                <div className="relative bg-gradient-to-r from-blue-600 to-cyan-500 p-3 rounded-xl">
                                    <Package className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                                Warefy
                            </h1>
                        </div>
                    </div>

                    {/* Hero Content */}
                    <div className="text-center max-w-4xl mx-auto">
                        <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
                            AI-Powered Supply Chain
                            <span className="block bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                                Optimization Platform
                            </span>
                        </h2>
                        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                            Transform your supply chain with cutting-edge AI technology.
                            Predict demand, optimize routes, and maximize efficiency—all in one platform.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                            <Link
                                href="/dashboard"
                                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                Get Started
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="#features"
                                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                Learn More
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Powerful Features for Modern Supply Chains
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Everything you need to optimize, automate, and scale your supply chain operations
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className={`inline-flex p-4 rounded-xl ${feature.color} mb-6 shadow-lg`}>
                                <feature.icon className="h-8 w-8 text-white" />
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

            {/* Benefits Section */}
            <div className="bg-gradient-to-br from-blue-600 to-cyan-500 py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="text-white">
                            <h2 className="text-4xl font-bold mb-6">
                                Why Choose Warefy?
                            </h2>
                            <p className="text-xl text-blue-100 mb-8">
                                Join hundreds of companies optimizing their supply chains with AI
                            </p>
                            <ul className="space-y-4">
                                {[
                                    'Reduce operational costs by up to 30%',
                                    'Improve forecast accuracy to 95%+',
                                    'Real-time visibility across all operations',
                                    'Seamless integration with existing systems',
                                    'Enterprise-grade security and compliance',
                                    '24/7 customer support and training'
                                ].map((benefit, index) => (
                                    <li key={index} className="flex items-start">
                                        <CheckCircle className="h-6 w-6 text-cyan-300 mr-3 flex-shrink-0 mt-0.5" />
                                        <span className="text-lg text-blue-50">{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                            <div className="text-center text-white">
                                <Globe className="h-16 w-16 mx-auto mb-6 text-cyan-300" />
                                <h3 className="text-2xl font-bold mb-4">Global Scale</h3>
                                <p className="text-blue-100 mb-6">
                                    Trusted by companies managing supply chains across 50+ countries
                                </p>
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg"
                                >
                                    Start Free Trial
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-12 md:p-16 text-center shadow-2xl">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Ready to Transform Your Supply Chain?
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                        Join the future of supply chain management. Get started in minutes.
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center px-10 py-5 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        Access Dashboard
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center space-x-2 mb-4 md:mb-0">
                            <Package className="h-6 w-6 text-cyan-500" />
                            <span className="text-white font-semibold text-lg">Warefy</span>
                        </div>
                        <div className="text-sm">
                            © 2025 Warefy. All rights reserved. Powered by AI.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
