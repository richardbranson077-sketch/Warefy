'use client';

import { Key } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="flex flex-col items-center gap-4">
                <Key className="h-24 w-24 text-purple-400" />
                <h1 className="text-2xl font-bold">Warefy Settings</h1>
                <p className="text-gray-400">Configure your platform via the admin panel.</p>
            </div>
        </div>
    );
}

const [user, setUser] = useState<any>(null);
const [activeTab, setActiveTab] = useState('profile');
const [loading, setLoading] = useState(false);
const [saving, setSaving] = useState(false);
const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

// Form states
const [fullName, setFullName] = useState('');
const [password, setPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [darkMode, setDarkMode] = useState(true); // Default to dark for this theme
const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false
});

useEffect(() => {
    const fetchUser = async () => {
        try {
            const userData = await auth.getCurrentUser();
            setUser(userData);
            setFullName(userData.full_name || '');
        } catch (e) {
            console.error(e);
        }
    };
    fetchUser();
}, []);

const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    if (password && password !== confirmPassword) {
        setMessage({ type: 'error', text: 'Passwords do not match' });
        setSaving(false);
        return;
    }

    try {
        await updateUser(user.id, {
            full_name: fullName,
            ...(password ? { password } : {})
        });
        setMessage({ type: 'success', text: 'Profile updated successfully' });
        setPassword('');
        setConfirmPassword('');
    } catch (e: any) {
        setMessage({ type: 'error', text: e.message || 'Update failed' });
    } finally {
        setSaving(false);
    }
};

return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Settings className="h-6 w-6 text-purple-400" />
            Settings
        </h1>

        <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-64 flex flex-col gap-2">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`p-3 rounded-lg text-left flex items-center gap-3 transition ${activeTab === 'profile' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                >
                    <UserIcon className="h-5 w-5" /> Profile
                </button>
                <button
                    onClick={() => setActiveTab('appearance')}
                    className={`p-3 rounded-lg text-left flex items-center gap-3 transition ${activeTab === 'appearance' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                >
                    {darkMode ? <Moon className="h-5 w-5" /> : <Settings className="h-5 w-5" />} Appearance
                </button>
                <button
                    onClick={() => setActiveTab('notifications')}
                    className={`p-3 rounded-lg text-left flex items-center gap-3 transition ${activeTab === 'notifications' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                >
                    <Bell className="h-5 w-5" /> Notifications
                </button>
                {user?.role === 'admin' && (
                    <button
                        onClick={() => setActiveTab('system')}
                        className={`p-3 rounded-lg text-left flex items-center gap-3 transition ${activeTab === 'system' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        <Shield className="h-5 w-5" /> System
                    </button>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-gray-800 rounded-lg p-6 shadow-lg">
                {message && (
                    <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                        {message.text}
                    </div>
                )}

                {activeTab === 'profile' && (
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                        <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-20 w-20 rounded-full bg-purple-600 flex items-center justify-center text-2xl font-bold">
                                {user?.username?.[0]?.toUpperCase()}
                            </div>
                            <button type="button" className="text-sm text-purple-400 hover:text-purple-300">
                                Change Avatar
                            </button>
                        </div>

                        <div className="grid gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full rounded bg-gray-700 border-gray-600 text-white p-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                                <input
                                    type="text"
                                    value={user?.username || ''}
                                    disabled
                                    className="w-full rounded bg-gray-700 border-gray-600 text-gray-400 p-2 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="w-full rounded bg-gray-700 border-gray-600 text-gray-400 p-2 cursor-not-allowed"
                                />
                            </div>

                            <div className="pt-4 border-t border-gray-700">
                                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                    <Shield className="h-4 w-4" /> Change Password
                                </h3>
                                <div className="grid gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">New Password</label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full rounded bg-gray-700 border-gray-600 text-white p-2 focus:ring-purple-500 focus:border-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Confirm Password</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full rounded bg-gray-700 border-gray-600 text-white p-2 focus:ring-purple-500 focus:border-purple-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                            >
                                {saving ? <Settings className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                )}

                {activeTab === 'appearance' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold mb-4">Appearance</h2>
                        <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                            <div>
                                <h3 className="font-medium">Dark Mode</h3>
                                <p className="text-sm text-gray-400">Use dark theme across the application</p>
                            </div>
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? 'bg-purple-600' : 'bg-gray-500'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
                        {Object.entries(notifications).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg capitalize">
                                <div>
                                    <h3 className="font-medium">{key} Notifications</h3>
                                    <p className="text-sm text-gray-400">Receive updates via {key}</p>
                                </div>
                                <button
                                    onClick={() => setNotifications(prev => ({ ...prev, [key]: !value }))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-purple-600' : 'bg-gray-500'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'system' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold mb-4">System Settings</h2>
                        <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                            <h3 className="font-medium mb-2">Backup & Restore</h3>
                            <p className="text-sm text-gray-400 mb-4">Create a full backup of the database and configuration.</p>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
                                Download Backup
                            </button>
                        </div>
                        <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                            <h3 className="font-medium mb-2">System Branding</h3>
                            <div className="grid gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Application Name</label>
                                    <input type="text" defaultValue="Warefy" className="w-full rounded bg-gray-600 p-2 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
);
}
