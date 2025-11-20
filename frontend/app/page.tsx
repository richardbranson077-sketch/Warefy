'use client';

import Link from 'next/link';
import {
    Sparkles,
    Cpu,
    Network,
    Zap,
    Shield,
    TrendingUp,
    BarChart3,
    Brain,
    Layers,
    ArrowRight,
    CheckCircle2,
    Star,
    ChevronRight,
    Activity,
    Target,
    Gauge
} from 'lucide-react';

export default function LandingPage() {
    const features = [
        {
            icon: Brain,
            title: 'Neural Demand Forecasting',
            description: 'Advanced deep learning models predict demand patterns with 98% accuracy using transformer architecture.',
            gradient: 'from-blue-500 via-purple-500 to-pink-500'
        },
        {
            icon: Network,
            title: 'Autonomous Supply Network',
            description: 'Self-optimizing supply chain that adapts in real-time to market changes and disruptions.',
            gradient: 'from-cyan-500 via-blue-500 to-purple-500'
        },
        {
            icon: Cpu,
            title: 'Quantum Route Optimization',
            description: 'Next-gen algorithms reduce delivery time by 40% and fuel costs by 35% simultaneously.',
            gradient: 'from-green-500 via-emerald-500 to-cyan-500'
        },
        {
            icon: Activity,
            title: 'Predictive Analytics Engine',
            description: 'AI-powered insights that forecast trends 6 months ahead with real-time data processing.',
            gradient: 'from-orange-500 via-red-500 to-pink-500'
        },
        {
            icon: Shield,
            title: 'Intelligent Risk Detection',
            description: 'Machine learning models identify potential disruptions before they impact operations.',
            gradient: 'from-purple-500 via-pink-500 to-red-500'
        },
        {
            icon: Layers,
            title: 'Multi-Modal Integration',
            description: 'Seamlessly connects with 500+ platforms through our advanced API infrastructure.',
            gradient: 'from-yellow-500 via-orange-500 to-red-500'
        }
    ];

    const stats = [
        { value: '98%', label: 'AI Accuracy', icon: Target, color: 'from-blue-500 to-cyan-500' },
        { value: '40%', label: 'Faster Delivery', icon: Zap, color: 'from-purple-500 to-pink-500' },
        { value: '24/7', label: 'Auto-Pilot', icon: Gauge, color: 'from-green-500 to-emerald-500' },
        { value: '1000+', label: 'Enterprises', icon: TrendingUp, color: 'from-orange-500 to-red-500' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-purple-950 text-white overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-gray-900/50 border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <Link href="/" className="flex items-center space-x-3 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition"></div>
                                <div className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-2.5 rounded-xl">
                                    <Sparkles className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    Warefy
                                </span>
                                <div className="text-xs text-gray-400 font-medium">AI Supply Chain</div>
                            </div>
                        </Link>
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-gray-300 hover:text-white transition">Features</a>
                            <a href="#technology" className="text-gray-300 hover:text-white transition">Technology</a>
                            <a href="#testimonials" className="text-gray-300 hover:text-white transition">Success Stories</a>
                            <Link href="/login" className="text-gray-300 hover:text-white transition font-medium">Sign In</Link>
                            <Link
                                href="/dashboard"
                                className="group relative px-6 py-2.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg font-semibold overflow-hidden"
                            >
                                <span className="relative z-10">Launch Platform</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition"></div>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full mb-8">
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-sm text-gray-300">Powered by Advanced AI</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                            <span className="text-sm bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-semibold">
                                Next-Gen Platform
                            </span>
                        </div>

                        <h1 className="text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Autonomous Supply Chain
                            </span>
                            <br />
                            <span className="text-white">Powered by Neural AI</span>
                        </h1>

                        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
                            Transform your operations with cutting-edge artificial intelligence.
                            Our neural networks predict, optimize, and automate your entire supply chain ecosystem.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                            <Link
                                href="/dashboard"
                                className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl font-semibold text-lg overflow-hidden shadow-2xl shadow-purple-500/50"
                            >
                                <span className="relative z-10 flex items-center justify-center">
                                    Start Free Trial
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition"></div>
                            </Link>
                            <a
                                href="#technology"
                                className="px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl font-semibold text-lg hover:bg-white/10 transition"
                            >
                                Explore Technology
                            </a>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                            {stats.map((stat, index) => (
                                <div
                                    key={index}
                                    className="relative group"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r ${stat.color} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition"></div>
                                    <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition">
                                        <stat.icon className={`h-8 w-8 mb-3 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text', backgroundClip: 'text' }} />
                                        <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
                                            {stat.value}
                                        </div>
                                        <div className="text-sm text-gray-400">{stat.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="relative py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full mb-6">
                            <Cpu className="h-4 w-4 text-purple-400" />
                            <span className="text-sm text-gray-300">Advanced Capabilities</span>
                        </div>
                        <h2 className="text-5xl font-bold mb-4">
                            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Next-Generation Features
                            </span>
                        </h2>
                        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                            Powered by state-of-the-art AI models and quantum-inspired algorithms
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group relative"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition duration-500`}></div>
                                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition h-full">
                                    <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${feature.gradient} mb-6 shadow-lg`}>
                                        <feature.icon className="h-7 w-7 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-400 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Technology Section */}
            <section id="technology" className="relative py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl"></div>
                        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 lg:p-16">
                            <div className="grid lg:grid-cols-2 gap-12 items-center">
                                <div>
                                    <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full mb-6">
                                        <Brain className="h-4 w-4 text-blue-400" />
                                        <span className="text-sm text-gray-300">AI Technology Stack</span>
                                    </div>
                                    <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                                        <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                            Built on Advanced AI
                                        </span>
                                    </h2>
                                    <p className="text-lg text-gray-300 mb-8">
                                        Our platform leverages cutting-edge machine learning, neural networks,
                                        and quantum-inspired algorithms to deliver unprecedented performance.
                                    </p>
                                    <div className="space-y-4">
                                        {[
                                            'Deep Learning Transformer Models',
                                            'Real-Time Neural Processing',
                                            'Quantum-Inspired Optimization',
                                            'Autonomous Decision Making',
                                            'Predictive Analytics Engine',
                                            'Multi-Agent Reinforcement Learning'
                                        ].map((tech, index) => (
                                            <div key={index} className="flex items-center space-x-3">
                                                <div className="flex-shrink-0">
                                                    <CheckCircle2 className="h-6 w-6 text-green-400" />
                                                </div>
                                                <span className="text-gray-300">{tech}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-2xl opacity-30"></div>
                                    <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-300">Neural Network Accuracy</span>
                                                <span className="text-green-400 font-bold">98.7%</span>
                                            </div>
                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: '98.7%' }}></div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-300">Processing Speed</span>
                                                <span className="text-blue-400 font-bold">10ms</span>
                                            </div>
                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: '95%' }}></div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-300">Cost Reduction</span>
                                                <span className="text-purple-400 font-bold">42%</span>
                                            </div>
                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: '85%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="relative py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-bold mb-4">
                            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Trusted by Industry Leaders
                            </span>
                        </h2>
                        <p className="text-xl text-gray-400">
                            See how AI is transforming supply chains worldwide
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { name: 'Alex Thompson', role: 'Chief Supply Chain Officer', company: 'TechCorp Global', content: 'Warefy\'s AI reduced our operational costs by 45% in just 3 months. The neural forecasting is incredibly accurate.' },
                            { name: 'Maria Garcia', role: 'VP of Operations', company: 'LogiTech Solutions', content: 'The autonomous optimization saved us millions. It\'s like having a team of data scientists working 24/7.' },
                            { name: 'James Chen', role: 'CEO', company: 'FastShip Logistics', content: 'Best AI platform we\'ve implemented. ROI was visible within weeks. The technology is truly next-generation.' }
                        ].map((testimonial, index) => (
                            <div key={index} className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition"></div>
                                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition">
                                    <div className="flex mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                                        ))}
                                    </div>
                                    <p className="text-gray-300 mb-6 leading-relaxed">
                                        "{testimonial.content}"
                                    </p>
                                    <div className="flex items-center">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold mr-4">
                                            {testimonial.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-white">{testimonial.name}</div>
                                            <div className="text-sm text-gray-400">{testimonial.role}</div>
                                            <div className="text-xs text-gray-500">{testimonial.company}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-3xl opacity-30"></div>
                        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 lg:p-16">
                            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    Ready to Transform Your Supply Chain?
                                </span>
                            </h2>
                            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                                Join 1000+ enterprises using AI to revolutionize their operations
                            </p>
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl font-semibold text-lg shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/75 transition"
                            >
                                Launch AI Platform
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                            <p className="text-gray-400 mt-6 text-sm">
                                Free 14-day trial • No credit card required • Full AI access
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-2 rounded-lg">
                                    <Sparkles className="h-5 w-5 text-white" />
                                </div>
                                <span className="font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Warefy</span>
                            </div>
                            <p className="text-sm text-gray-400">
                                Next-generation AI supply chain platform
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4 text-white">Platform</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                                <li><a href="#technology" className="hover:text-white transition">Technology</a></li>
                                <li><a href="/dashboard" className="hover:text-white transition">Dashboard</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4 text-white">Company</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white transition">About</a></li>
                                <li><a href="#testimonials" className="hover:text-white transition">Success Stories</a></li>
                                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4 text-white">Legal</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                                <li><a href="#" className="hover:text-white transition">Security</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-white/10 pt-8 text-center text-sm text-gray-400">
                        © 2025 Warefy. All rights reserved. Powered by Advanced AI.
                    </div>
                </div>
            </footer>
        </div>
    );
}
