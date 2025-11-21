'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, User, LogOut, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth } from '../lib/api';

interface User {
    username: string;
    email?: string;
}

export default function Navbar() {
    const router = useRouter();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await auth.getCurrentUser();
                setUser(userData);
            } catch (error) {
                console.error("Failed to fetch user:", error);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = () => {
        auth.logout();
        router.push('/login');
    };

    return (
        <nav className="bg-gray-900/95 backdrop-blur-xl border-b border-white/10 h-16 fixed w-full z-30 top-0 left-0">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-3 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg blur-md opacity-75 group-hover:opacity-100 transition"></div>
                                <div className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-2 rounded-lg">
                                    <Sparkles className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div>
                                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    Warefy
                                </span>
                                <div className="text-xs text-gray-400 font-medium">AI Platform</div>
                            </div>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 border border-gray-900"></span>
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition"
                            >
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                                    <User className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-medium text-gray-300 hidden md:block">
                                    {user ? user.username : 'Admin'}
                                </span>
                            </button>

                            {showProfileMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-gray-800/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl py-1">
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition flex items-center gap-2"
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
