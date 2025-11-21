'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
    Sparkles,
    TrendingUp,
    BarChart3,
    Package,
    Truck,
    ArrowRight,
    CheckCircle,
    Star,
    User,
    Shield,
    Zap
} from 'lucide-react';

export default function LandingPage() {
    const features = [
        {
            icon: BarChart3,
            title: 'Demand Forecasting',
            description: 'Advanced AI models predict demand patterns to optimize inventory levels and reduce costs.'
        },
        {
            icon: Truck,
            title: 'Route Optimization',
            description: 'Smart algorithms find the most efficient delivery routes, saving time and fuel.'
        },
        {
            icon: Package,
            title: 'Inventory Management',
            description: 'Real-time tracking and automated reordering keep your stock levels perfect.'
        },
        {
            icon: User,
            title: 'Fleet Management',
            description: 'Monitor vehicle health, driver performance, and maintenance schedules.'
        },
        {
            icon: Shield,
            title: 'Risk Detection',
            description: 'Identify potential disruptions before they impact your operations.'
        },
        {
            icon: Zap,
            title: 'AI Recommendations',
            description: 'Get actionable insights powered by machine learning algorithms.'
        }
    ];

    const stats = [
        { value: '98%', label: 'Forecast Accuracy', icon: TrendingUp },
        { value: '40%', label: 'Cost Reduction', icon: BarChart3 },
        { value: '24/7', label: 'Real-time Monitoring', icon: Shield },
        { value: '500+', label: 'Happy Customers', icon: User }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <Sparkles className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <span className="text-xl font-bold text-gray-900">Warefy</span>
                                <div className="text-xs text-gray-500">Supply Chain Platform</div>
                            </div>
                        </Link>
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-gray-600 hover:text-gray-900 transition">Features</a>
                            <a href="#benefits" className="text-gray-600 hover:text-gray-900 transition">Benefits</a>
                            <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition">Testimonials</a>
                            <Link href="/login" className="text-gray-600 hover:text-gray-900 transition font-medium">Sign In</Link>
                            <Link
                                href="/dashboard"
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm hover:shadow transition"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-full mb-6">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm text-blue-700 font-medium">AI-Powered Platform</span>
                            </div>

                            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                                Smart Supply Chain
                                <span className="text-blue-600"> Management</span>
                            </h1>

                            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                Optimize your operations with AI-driven insights. Reduce costs, improve efficiency, and stay ahead of the competition.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-12">
                                <Link
                                    href="/dashboard"
                                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition text-center"
                                >
                                    Start Free Trial
                                    <ArrowRight className="inline-block ml-2 h-5 w-5" />
                                </Link>
                                <a
                                    href="#features"
                                    className="px-8 py-4 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg font-semibold hover:shadow-md transition text-center"
                                >
                                    Learn More
                                </a>
                            </div>

                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                    No credit card required
                                </div>
                                <div className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                    14-day free trial
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8">
                                <Image
                                    src="/dashboard-preview.png"
                                    alt="Dashboard Preview"
                                    width={600}
                                    height={400}
                                    className="w-full h-auto rounded-lg"
                                />
                            </div>
                            <div className="absolute -bottom-6 -left-6 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg">
                                <div className="text-sm font-medium">Trusted by 500+ companies</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white border-y border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                                    <stat.icon className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                                <div className="text-sm text-gray-600">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Everything You Need to Optimize Your Supply Chain
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Comprehensive tools to manage every aspect of your logistics operation
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition group"
                            >
                                <div className="inline-flex p-3 bg-blue-50 rounded-lg mb-6 group-hover:bg-blue-100 transition">
                                    <feature.icon className="h-6 w-6 text-blue-600" />
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
            <section id="benefits" className="py-20 bg-blue-50 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-6">
                                Why Choose Warefy?
                            </h2>
                            <p className="text-lg text-gray-600 mb-8">
                                Our platform combines cutting-edge AI technology with intuitive design to deliver measurable results for your business.
                            </p>
                            <div className="space-y-4">
                                {[
                                    'Real-time visibility across your entire supply chain',
                                    'Automated decision-making based on AI insights',
                                    'Seamless integration with existing systems',
                                    'Reduce operational costs by up to 40%',
                                    'Improve customer satisfaction with faster delivery',
                                    '24/7 support from our expert team'
                                ].map((benefit, index) => (
                                    <div key={index} className="flex items-start">
                                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700">{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                                    <span className="text-gray-700">Average Cost Savings</span>
                                    <span className="text-2xl font-bold text-green-600">42%</span>
                                </div>
                                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                                    <span className="text-gray-700">Delivery Time Reduction</span>
                                    <span className="text-2xl font-bold text-blue-600">38%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-700">Customer Satisfaction</span>
                                    <span className="text-2xl font-bold text-purple-600">95%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Loved by Supply Chain Professionals
                        </h2>
                        <p className="text-xl text-gray-600">
                            See what our customers have to say
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { name: 'Sarah Johnson', role: 'Operations Director', company: 'TechCorp', content: 'Warefy transformed our supply chain operations. We reduced costs by 45% in just 3 months.' },
                            { name: 'Michael Chen', role: 'Logistics Manager', company: 'GlobalShip', content: 'The AI recommendations are incredibly accurate. It\'s like having a team of data scientists working 24/7.' },
                            { name: 'Emma Wilson', role: 'CEO', company: 'FastFreight', content: 'Best investment we\'ve made. The ROI was visible within weeks.' }
                        ].map((testimonial, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition">
                                <div className="flex mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-6 leading-relaxed">
                                    "{testimonial.content}"
                                </p>
                                <div className="flex items-center">
                                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-4">
                                        {testimonial.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{testimonial.name}</div>
                                        <div className="text-sm text-gray-600">{testimonial.role}, {testimonial.company}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-700">
                <div className="max-w-4xl mx-auto text-center text-white">
                    <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                        Ready to Transform Your Supply Chain?
                    </h2>
                    <p className="text-xl mb-8 text-blue-100">
                        Join hundreds of companies using Warefy to optimize their operations
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center px-10 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg shadow-xl hover:shadow-2xl transition"
                    >
                        Start Free Trial
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                    <p className="text-blue-100 mt-6 text-sm">
                        No credit card required • 14-day free trial • Cancel anytime
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="bg-blue-600 p-2 rounded-lg">
                                    <Sparkles className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-white font-bold text-lg">Warefy</span>
                            </div>
                            <p className="text-sm">
                                AI-powered supply chain management platform
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4 text-white">Platform</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                                <li><a href="#benefits" className="hover:text-white transition">Benefits</a></li>
                                <li><a href="/dashboard" className="hover:text-white transition">Dashboard</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4 text-white">Company</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white transition">About</a></li>
                                <li><a href="#testimonials" className="hover:text-white transition">Testimonials</a></li>
                                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4 text-white">Legal</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                                <li><a href="#" className="hover:text-white transition">Security</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-sm">
                        © 2025 Warefy. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
