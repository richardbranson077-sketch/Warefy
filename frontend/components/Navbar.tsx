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
        <nav className="bg-white border-b border-gray-200 h-16 fixed w-full z-30 top-0 left-0 shadow-sm">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <span className="text-xl font-bold text-gray-900">
                                    Warefy
                                </span>
                                <div className="text-xs text-gray-500 font-medium">Supply Chain</div>
                            </div>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600"></span>
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition"
                            >
                                <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                    <User className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 hidden md:block">
                                    {user ? user.username : 'Admin'}
                                </span>
                            </button>

                            {showProfileMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Logout
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
