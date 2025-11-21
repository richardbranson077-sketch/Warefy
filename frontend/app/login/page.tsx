'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, Loader2, Shield, CheckCircle } from 'lucide-react';
import { auth } from '@/lib/api';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await auth.login(email, password);
            router.push('/dashboard');
        } catch (err: any) {
            console.error("Login failed:", err);
            setError('Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-700 p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]"></div>

                <div className="relative z-10">
                    <Link href="/" className="flex items-center space-x-3">
                        <Image src="/logo.png" alt="Warefy" width={48} height={48} className="rounded-lg" />
                        <div>
                            <h1 className="text-2xl font-bold text-white">Warefy</h1>
                            <p className="text-blue-100 text-sm">Supply Chain Platform</p>
                        </div>
                    </Link>
                </div>

                <div className="relative z-10">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Smart Supply Chain Management
                    </h2>
                    <p className="text-blue-100 text-lg mb-8">
                        Join hundreds of companies optimizing their operations with AI-powered insights.
                    </p>

                    <div className="space-y-4">
                        {[
                            'Real-time inventory tracking',
                            'AI-powered demand forecasting',
                            'Automated route optimization',
                            'Advanced analytics dashboard'
                        ].map((feature, index) => (
                            <div key={index} className="flex items-center text-white">
                                <CheckCircle className="h-5 w-5 mr-3 text-blue-200" />
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 flex items-center space-x-8">
                    <div>
                        <div className="text-3xl font-bold text-white">500+</div>
                        <div className="text-blue-100 text-sm">Active Users</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white">98%</div>
                        <div className="text-blue-100 text-sm">Satisfaction</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white">24/7</div>
                        <div className="text-blue-100 text-sm">Support</div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden mb-8 text-center">
                        <Link href="/" className="inline-flex items-center space-x-2">
                            <Image src="/logo.png" alt="Warefy" width={40} height={40} className="rounded-lg" />
                            <span className="text-2xl font-bold text-gray-900">Warefy</span>
                        </Link>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
                            <p className="text-gray-600">Sign in to access your dashboard</p>
                        </div>

                        {/* Demo Credentials Banner */}
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start">
                                <Shield className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-blue-900 mb-1">Demo Access</p>
                                    <p className="text-sm text-blue-700">
                                        Username: <code className="bg-blue-100 px-2 py-0.5 rounded font-mono">admin</code> |
                                        Password: <code className="bg-blue-100 px-2 py-0.5 rounded font-mono">admin123</code>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-300 rounded-lg py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="admin@warefy.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-300 rounded-lg py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center">
                                    <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                                </label>
                                <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                    Forgot password?
                                </a>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <p className="text-center text-gray-600 text-sm">
                                Don't have an account?{' '}
                                <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold">
                                    Contact Sales
                                </a>
                            </p>
                        </div>

                        <div className="mt-6 flex items-center justify-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center">
                                <Shield className="h-4 w-4 mr-1" />
                                Secure Login
                            </div>
                            <span>•</span>
                            <div>256-bit Encryption</div>
                        </div>
                    </div>

                    <p className="mt-8 text-center text-sm text-gray-500">
                        By signing in, you agree to our{' '}
                        <a href="#" className="text-gray-700 hover:text-gray-900">Terms</a>
                        {' '}and{' '}
                        <a href="#" className="text-gray-700 hover:text-gray-900">Privacy Policy</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
