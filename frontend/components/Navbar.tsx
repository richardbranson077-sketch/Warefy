'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { auth } from '../lib/api';

export default function Navbar() {
    const router = useRouter();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const handleLogout = () => {
        auth.logout();
        router.push('/login');
    };

    return (
        <nav className="bg-white border-b border-gray-200 h-16 fixed w-full z-30 top-0 left-0 shadow-sm">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center space-x-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg blur opacity-50"></div>
                                <div className="relative bg-gradient-to-r from-blue-600 to-cyan-500 p-2 rounded-lg">
                                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                                Warefy
                            </span>
                            <span className="ml-2 text-xs px-2 py-1 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 font-semibold border border-blue-200">
                                AI Powered
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border border-white"></span>
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50"
                            >
                                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                                    <User className="h-5 w-5" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 hidden md:block">Manager</span>
                            </button>

                            {showProfileMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-100">
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
