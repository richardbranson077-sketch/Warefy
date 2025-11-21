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
    Zap,
    Globe,
    Cpu
} from 'lucide-react';

export default function LandingPage() {
    const features = [
        {
            icon: Package,
            title: 'Immutable Ledger',
            description: 'Every transaction and movement is recorded on a secure, decentralized ledger, ensuring absolute transparency and trust across your supply chain.'
        },
        {
            icon: Cpu,
            title: 'Smart Contracts',
            description: 'Automate payments and compliance with self-executing smart contracts that trigger instantly when delivery conditions are met.'
        },
        {
            icon: Package,
            title: 'Asset Tokenization',
            description: 'Digital twins of your physical inventory allow for fractional ownership, easier financing, and real-time provenance tracking.'
        },
        {
            icon: Globe,
            title: 'Global Traceability',
            description: 'End-to-end visibility from raw material sourcing to final delivery, verified by blockchain for authentic sustainability claims.'
        },
        {
            icon: Shield,
            title: 'Fraud Prevention',
            description: 'Cryptographic verification eliminates counterfeit goods and unauthorized modifications to shipping documents.'
        },
        {
            icon: Zap,
            title: 'AI-Driven Optimization',
            description: 'Machine learning algorithms analyze blockchain data to predict disruptions and optimize routes in real-time.'
        }
    ];

    const stats = [
        { value: '100%', label: 'Data Integrity', icon: Shield },
        { value: '0.01s', label: 'Transaction Speed', icon: Zap },
        { value: '24/7', label: 'Network Uptime', icon: Globe },
        { value: '500+', label: 'Verified Partners', icon: User }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500 selection:text-slate-900">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <Link href="/" className="flex items-center space-x-3 group">
                            <div className="relative w-10 h-10">
                                <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-20 group-hover:opacity-40 transition duration-500"></div>
                                <Image src="/logo.png" alt="Warefy" width={40} height={40} className="rounded-lg relative z-10" />
                            </div>
                            <div>
                                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">Warefy</span>
                                <div className="text-[10px] uppercase tracking-widest text-slate-400">Blockchain Logistics</div>
                            </div>
                        </Link>
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-slate-300 hover:text-cyan-400 transition text-sm font-medium tracking-wide">PROTOCOL</a>
                            <a href="#benefits" className="text-slate-300 hover:text-cyan-400 transition text-sm font-medium tracking-wide">NETWORK</a>
                            <a href="#testimonials" className="text-slate-300 hover:text-cyan-400 transition text-sm font-medium tracking-wide">COMMUNITY</a>
                            <Link href="/login" className="text-slate-300 hover:text-white transition text-sm font-medium tracking-wide">ACCESS NODE</Link>
                            <Link
                                href="/dashboard"
                                className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:shadow-[0_0_30px_rgba(8,145,178,0.5)] transition border border-cyan-400/20"
                            >
                                LAUNCH DAPP
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-40 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[128px]"></div>
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                </div>

                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center space-x-2 bg-slate-900/50 border border-cyan-500/30 px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
                                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_10px_#06b6d4]"></div>
                                <span className="text-sm text-cyan-400 font-mono tracking-wider">GENESIS BLOCK VERIFIED</span>
                            </div>

                            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight tracking-tight">
                                Decentralized
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                                    Supply Chain
                                </span>
                            </h1>

                            <p className="text-xl text-slate-400 mb-10 leading-relaxed max-w-lg border-l-2 border-slate-800 pl-6">
                                The world's first AI-powered logistics protocol. Secure, transparent, and immutable record-keeping for the modern era of trade.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-5 mb-12">
                                <Link
                                    href="/dashboard"
                                    className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-bold shadow-lg hover:shadow-cyan-500/25 transition text-center flex items-center justify-center group"
                                >
                                    Start Mining Data
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <a
                                    href="#features"
                                    className="px-8 py-4 bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-white rounded-lg font-bold transition text-center flex items-center justify-center hover:bg-slate-800"
                                >
                                    View Whitepaper
                                </a>
                            </div>

                            <div className="flex items-center space-x-8 text-sm font-mono text-slate-500">
                                <div className="flex items-center">
                                    <Shield className="h-4 w-4 text-cyan-500 mr-2" />
                                    AUDITED
                                </div>
                                <div className="flex items-center">
                                    <Shield className="h-4 w-4 text-purple-500 mr-2" />
                                    ENCRYPTED
                                </div>
                                <div className="flex items-center">
                                    <Zap className="h-4 w-4 text-yellow-500 mr-2" />
                                    LIGHTNING FAST
                                </div>
                            </div>
                        </div>

                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                            <div className="relative bg-slate-900 rounded-2xl border border-slate-800 p-2 shadow-2xl">
                                <Image
                                    src="/hero-blockchain.png"
                                    alt="Blockchain Supply Chain Network"
                                    width={800}
                                    height={600}
                                    className="w-full h-auto rounded-xl"
                                    priority
                                />
                                {/* Floating Cards */}
                                <div className="absolute -bottom-6 -left-6 bg-slate-800/90 backdrop-blur-xl border border-slate-700 p-4 rounded-xl shadow-xl flex items-center space-x-4">
                                    <div className="bg-green-500/20 p-2 rounded-lg">
                                        <TrendingUp className="h-6 w-6 text-green-400" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-400 uppercase tracking-wider">Network Status</div>
                                        <div className="text-green-400 font-mono font-bold">OPERATIONAL</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 border-y border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center group cursor-default">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-800 rounded-xl mb-4 group-hover:bg-cyan-900/30 group-hover:scale-110 transition duration-300 border border-slate-700 group-hover:border-cyan-500/50">
                                    <stat.icon className="h-6 w-6 text-cyan-500" />
                                </div>
                                <div className="text-3xl font-bold text-white mb-1 font-mono tracking-tight">{stat.value}</div>
                                <div className="text-sm text-slate-500 uppercase tracking-wider">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Protocol <span className="text-cyan-500">Features</span>
                        </h2>
                        <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                            The infrastructure layer for the next generation of global trade.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:bg-slate-800 hover:border-cyan-500/30 transition group duration-300"
                            >
                                <div className="inline-flex p-3 bg-slate-800 rounded-xl mb-6 group-hover:bg-cyan-900/20 transition border border-slate-700 group-hover:border-cyan-500/50">
                                    <feature.icon className="h-6 w-6 text-cyan-400 group-hover:text-cyan-300" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-400 leading-relaxed">
                                    {feature.description}
                                </p>
                                {feature.title === 'Asset Tokenization' && (
                                    <div className="mt-6 rounded-lg overflow-hidden border border-slate-700 shadow-lg">
                                        <Image
                                            src="/smart-package.png"
                                            alt="Smart Package Asset"
                                            width={400}
                                            height={250}
                                            className="w-full h-auto hover:scale-105 transition duration-500"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-bold text-white mb-4">
                            Node <span className="text-purple-500">Validators</span>
                        </h2>
                        <p className="text-xl text-slate-400">
                            Trusted by industry leaders running the Warefy protocol
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                name: 'Sarah Johnson',
                                role: 'Operations Director',
                                company: 'TechCorp',
                                content: 'The immutable ledger has completely eliminated disputes with our suppliers. Transparency is now our default state.',
                                image: '/avatar-sarah.png'
                            },
                            {
                                name: 'Michael Chen',
                                role: 'Logistics Manager',
                                company: 'GlobalShip',
                                content: 'Smart contracts have automated 90% of our payment processing. The efficiency gains are exponential.',
                                image: '/avatar-michael.png'
                            },
                            {
                                name: 'Emma Wilson',
                                role: 'CEO',
                                company: 'FastFreight',
                                content: 'We\'ve tokenized our entire fleet. Financing is easier, and we have real-time asset tracking like never before.',
                                image: '/avatar-emma.png'
                            }
                        ].map((testimonial, index) => (
                            <div key={index} className="bg-slate-950 border border-slate-800 rounded-2xl p-8 relative hover:-translate-y-2 transition duration-300 shadow-xl">
                                <div className="absolute top-0 right-0 p-4 opacity-20">
                                    <Package className="h-24 w-24 text-slate-700" />
                                </div>
                                <div className="flex mb-6">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-4 w-4 text-cyan-500 fill-current" />
                                    ))}
                                </div>
                                <p className="text-slate-300 mb-8 leading-relaxed relative z-10">
                                    "{testimonial.content}"
                                </p>
                                <div className="flex items-center border-t border-slate-800 pt-6">
                                    <div className="relative h-12 w-12 rounded-full mr-4 border-2 border-cyan-500/30 p-0.5">
                                        <Image
                                            src={testimonial.image}
                                            alt={testimonial.name}
                                            width={48}
                                            height={48}
                                            className="rounded-full object-cover"
                                        />
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-950 rounded-full"></div>
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">{testimonial.name}</div>
                                        <div className="text-xs text-cyan-400 font-mono">{testimonial.role} @ {testimonial.company}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-900 to-blue-900 opacity-50"></div>
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-5xl lg:text-6xl font-bold text-white mb-8 tracking-tight">
                        Ready to Join the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Future of Logistics?</span>
                    </h2>
                    <p className="text-xl mb-10 text-cyan-100 max-w-2xl mx-auto">
                        Deploy your first node today and experience the power of decentralized supply chain management.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center px-10 py-5 bg-white text-slate-900 rounded-xl font-bold text-lg shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] transition hover:scale-105"
                        >
                            Initialize Protocol
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </div>
                    <p className="text-slate-400 mt-8 text-sm font-mono">
                        BLOCK HEIGHT: 18,249,102 • HASH RATE: 450 TH/s • ACTIVE NODES: 12,405
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 text-slate-500 py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-900">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center space-x-2 mb-6">
                                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold">W</span>
                                </div>
                                <span className="text-white font-bold text-xl tracking-tight">Warefy</span>
                            </div>
                            <p className="text-sm leading-relaxed mb-6">
                                Decentralized supply chain orchestration for the autonomous economy.
                            </p>
                            <div className="flex space-x-4">
                                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 hover:border-cyan-500 hover:text-cyan-500 transition cursor-pointer">
                                    <Globe className="h-4 w-4" />
                                </div>
                                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 hover:border-cyan-500 hover:text-cyan-500 transition cursor-pointer">
                                    <Package className="h-4 w-4" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold mb-6 text-white tracking-wider text-xs uppercase">Protocol</h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#" className="hover:text-cyan-400 transition">Consensus</a></li>
                                <li><a href="#" className="hover:text-cyan-400 transition">Tokenomics</a></li>
                                <li><a href="#" className="hover:text-cyan-400 transition">Governance</a></li>
                                <li><a href="#" className="hover:text-cyan-400 transition">Developers</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-6 text-white tracking-wider text-xs uppercase">Ecosystem</h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#" className="hover:text-cyan-400 transition">Wallets</a></li>
                                <li><a href="#" className="hover:text-cyan-400 transition">Explorers</a></li>
                                <li><a href="#" className="hover:text-cyan-400 transition">DApps</a></li>
                                <li><a href="#" className="hover:text-cyan-400 transition">Exchanges</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-6 text-white tracking-wider text-xs uppercase">Legal</h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#" className="hover:text-cyan-400 transition">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-cyan-400 transition">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-cyan-400 transition">Smart Contract Audit</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-900 pt-8 text-center text-sm font-mono">
                        <p>© 2025 Warefy Decentralized Foundation. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
