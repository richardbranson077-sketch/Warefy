'use client';

import { useState } from 'react';
import { User, Bell, Shield, CreditCard, Globe, Moon, Save } from 'lucide-react';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'billing', label: 'Billing', icon: CreditCard },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Settings</h1>
                <p className="text-gray-400 mt-1">Manage your account preferences and workspace settings</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="glass-panel rounded-2xl overflow-hidden">
                        <div className="p-2 space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === tab.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-500'}`} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
                    <div className="glass-panel rounded-2xl p-8 border border-white/10">
                        {activeTab === 'profile' && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-6">Profile Information</h2>
                                    <div className="flex items-center gap-6 mb-8">
                                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] border-2 border-white/10">
                                            JD
                                        </div>
                                        <div>
                                            <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors shadow-sm">
                                                Change Avatar
                                            </button>
                                            <p className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. Max size of 800K</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
                                            <input
                                                type="text"
                                                defaultValue="John"
                                                className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
                                            <input
                                                type="text"
                                                defaultValue="Doe"
                                                className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-500"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                                            <input
                                                type="email"
                                                defaultValue="john.doe@warefy.com"
                                                className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-500"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Bio</label>
                                            <textarea
                                                rows={4}
                                                defaultValue="Supply Chain Manager with 10+ years of experience."
                                                className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-white placeholder-gray-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-white/10 flex justify-end">
                                    <button className="flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all font-medium shadow-lg shadow-blue-500/20">
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-white mb-6">Notification Preferences</h2>
                                <div className="space-y-4">
                                    {['Email Notifications', 'Push Notifications', 'Weekly Reports', 'Critical Alerts'].map((item) => (
                                        <div key={item} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                            <div>
                                                <h3 className="font-medium text-white">{item}</h3>
                                                <p className="text-sm text-gray-400">Receive updates about {item.toLowerCase()}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Placeholders for other tabs */}
                        {(activeTab === 'security' || activeTab === 'billing') && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="p-4 bg-white/5 rounded-full mb-4 border border-white/10">
                                    <Shield className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-white">Coming Soon</h3>
                                <p className="text-gray-400 max-w-sm mt-2">This section is currently under development. Check back later for updates.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
