'use client';

import { useState, useEffect } from 'react';
import { settingsService, UserSettings, UserProfile } from '@/services/settings.service';
import {
    User, Bell, Shield, Settings as SettingsIcon, Globe, Save, RefreshCw,
    Clock, AlertTriangle, Package, Truck
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // State
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    // Form state
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [settingsData, profileData] = await Promise.all([
                settingsService.getSettings(),
                settingsService.getProfile()
            ]);
            setSettings(settingsData);
            setProfile(profileData);
            setFullName(profileData.full_name);
            setEmail(profileData.email);
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await settingsService.updateProfile({ full_name: fullName, email });
            alert('Profile updated successfully!');
            await loadData();
        } catch (error: any) {
            alert('Failed to update profile: ' + (error.response?.data?.detail || error.message));
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSettings = async (updates: Partial<UserSettings>) => {
        setSaving(true);
        try {
            const updated = await settingsService.updateSettings(updates);
            setSettings(updated);
            alert('Settings saved successfully!');
        } catch (error) {
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        setSaving(true);
        try {
            await settingsService.changePassword({ old_password: oldPassword, new_password: newPassword });
            alert('Password changed successfully!');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            alert('Failed to change password: ' + (error.response?.data?.detail || error.message));
        } finally {
            setSaving(false);
        }
    };

    const handleToggle2FA = async () => {
        setSaving(true);
        try {
            if (settings?.two_factor_enabled) {
                await settingsService.disable2FA();
                alert('2FA disabled');
            } else {
                const result = await settingsService.enable2FA();
                alert('2FA enabled! Secret: ' + result.secret);
            }
            await loadData();
        } catch (error) {
            alert('Failed to toggle 2FA');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'appearance', label: 'Appearance', icon: SettingsIcon },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500 mt-1">Manage your account preferences and configuration</p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6" aria-label="Tabs">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition
                                        ${activeTab === tab.id
                                            ? 'border-indigo-600 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }
                                    `}
                                >
                                    <Icon className="h-5 w-5" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-6">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6 max-w-2xl">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Information</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                        <input
                                            type="text"
                                            value={profile?.username || ''}
                                            disabled
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                        <input
                                            type="text"
                                            value={profile?.role || ''}
                                            disabled
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 capitalize"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                                    >
                                        <Save className="h-4 w-4" />
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Appearance Tab */}
                    {activeTab === 'appearance' && settings && (
                        <AppearanceSection settings={settings} />
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && settings && (
                        <div className="space-y-6 max-w-2xl">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Notification Preferences</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">Email Notifications</p>
                                            <p className="text-sm text-gray-500">Receive notifications via email</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.notifications_email}
                                                onChange={(e) => handleSaveSettings({ notifications_email: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">Push Notifications</p>
                                            <p className="text-sm text-gray-500">Receive push notifications</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.notifications_push}
                                                onChange={(e) => handleSaveSettings({ notifications_push: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">SMS Notifications</p>
                                            <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.notifications_sms}
                                                onChange={(e) => handleSaveSettings({ notifications_sms: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </div>

                                    <div className="border-t border-gray-200 pt-4 mt-6">
                                        <h3 className="font-medium text-gray-900 mb-4">Alert Types</h3>
                                        <div className="space-y-3">
                                            {[
                                                { key: 'notify_low_stock', icon: Package, label: 'Low Stock Alerts', desc: 'Get notified when inventory is low' },
                                                { key: 'notify_anomalies', icon: AlertTriangle, label: 'Anomaly Alerts', desc: 'Get notified of system anomalies' },
                                                { key: 'notify_route_delays', icon: Truck, label: 'Route Delays', desc: 'Get notified of delivery delays' },
                                                { key: 'notify_system_updates', icon: Bell, label: 'System Updates', desc: 'Get notified of system updates' },
                                            ].map(({ key, icon: Icon, label, desc }) => (
                                                <div key={key} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Icon className="h-4 w-4 text-gray-500" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{label}</p>
                                                            <p className="text-xs text-gray-500">{desc}</p>
                                                        </div>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={settings[key as keyof UserSettings] as boolean}
                                                            onChange={(e) => handleSaveSettings({ [key]: e.target.checked })}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && settings && (
                        <div className="space-y-6 max-w-4xl">
                            <SecuritySection
                                settings={settings}
                                onChangePassword={handleChangePassword}
                                onToggle2FA={handleToggle2FA}
                                saving={saving}
                                oldPassword={oldPassword}
                                setOldPassword={setOldPassword}
                                newPassword={newPassword}
                                setNewPassword={setNewPassword}
                                confirmPassword={confirmPassword}
                                setConfirmPassword={setConfirmPassword}
                                onSaveSettings={handleSaveSettings}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Enhanced Security Section Component
function SecuritySection({
    settings,
    onChangePassword,
    onToggle2FA,
    saving,
    oldPassword,
    setOldPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    onSaveSettings
}: any) {
    const [securityTab, setSecurityTab] = useState('password');
    const [loginHistory, setLoginHistory] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [apiKeys, setAPIKeys] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [showCreateKeyModal, setShowCreateKeyModal] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [newKeyExpiry, setNewKeyExpiry] = useState('');
    const [createdKey, setCreatedKey] = useState<string | null>(null);

    useEffect(() => {
        if (securityTab === 'history') loadLoginHistory();
        if (securityTab === 'sessions') loadSessions();
        if (securityTab === 'api-keys') loadAPIKeys();
        if (securityTab === 'audit') loadAuditLogs();
    }, [securityTab]);

    const loadLoginHistory = async () => {
        try {
            const { securityService } = await import('@/services/settings.service');
            const data = await securityService.getLoginHistory();
            setLoginHistory(data);
        } catch (error) {
            console.error('Failed to load login history:', error);
        }
    };

    const loadSessions = async () => {
        try {
            const { securityService } = await import('@/services/settings.service');
            const data = await securityService.getSessions();
            setSessions(data);
        } catch (error) {
            console.error('Failed to load sessions:', error);
        }
    };

    const loadAPIKeys = async () => {
        try {
            const { securityService } = await import('@/services/settings.service');
            const data = await securityService.getAPIKeys();
            setAPIKeys(data);
        } catch (error) {
            console.error('Failed to load API keys:', error);
        }
    };

    const loadAuditLogs = async () => {
        try {
            const { securityService } = await import('@/services/settings.service');
            const data = await securityService.getAuditLogs();
            setAuditLogs(data);
        } catch (error) {
            console.error('Failed to load audit logs:', error);
        }
    };

    const handleCreateAPIKey = async () => {
        try {
            const { securityService } = await import('@/services/settings.service');
            const result = await securityService.createAPIKey({
                name: newKeyName,
                expires_in_days: newKeyExpiry ? parseInt(newKeyExpiry) : undefined
            });
            setCreatedKey(result.key);
            setNewKeyName('');
            setNewKeyExpiry('');
            await loadAPIKeys();
        } catch (error) {
            alert('Failed to create API key');
        }
    };

    const handleRevokeAPIKey = async (keyId: number) => {
        if (!confirm('Are you sure you want to revoke this API key?')) return;
        try {
            const { securityService } = await import('@/services/settings.service');
            await securityService.revokeAPIKey(keyId);
            await loadAPIKeys();
            alert('API key revoked successfully');
        } catch (error) {
            alert('Failed to revoke API key');
        }
    };

    const handleRevokeSession = async (sessionId: number) => {
        if (!confirm('Are you sure you want to revoke this session?')) return;
        try {
            const { securityService } = await import('@/services/settings.service');
            await securityService.revokeSession(sessionId);
            await loadSessions();
            alert('Session revoked successfully');
        } catch (error) {
            alert('Failed to revoke session');
        }
    };

    const securityTabs = [
        { id: 'password', label: 'Password & 2FA' },
        { id: 'sessions', label: 'Active Sessions' },
        { id: 'api-keys', label: 'API Keys' },
        { id: 'history', label: 'Login History' },
        { id: 'audit', label: 'Audit Logs' }
    ];

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Security Settings</h2>

            {/* Sub-tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-6">
                    {securityTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setSecurityTab(tab.id)}
                            className={`pb-3 px-1 border-b-2 font-medium text-sm transition ${securityTab === tab.id
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Password & 2FA */}
            {securityTab === 'password' && (
                <div className="space-y-6">
                    {/* Change Password */}
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="font-medium text-gray-900 mb-4">Change Password</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <button
                                onClick={onChangePassword}
                                disabled={saving || !oldPassword || !newPassword || !confirmPassword}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                            >
                                {saving ? 'Changing...' : 'Change Password'}
                            </button>
                        </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-gray-600" />
                                <div>
                                    <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                                    <p className="text-sm text-gray-500">Add an extra layer of security</p>
                                </div>
                            </div>
                            <button
                                onClick={onToggle2FA}
                                disabled={saving}
                                className={`px-4 py-2 rounded-lg transition ${settings.two_factor_enabled
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                    }`}
                            >
                                {settings.two_factor_enabled ? 'Disable' : 'Enable'}
                            </button>
                        </div>
                    </div>

                    {/* Session Timeout */}
                    <div className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Clock className="h-5 w-5 text-gray-600" />
                            <div>
                                <p className="font-medium text-gray-900">Session Timeout</p>
                                <p className="text-sm text-gray-500">Auto-logout after inactivity</p>
                            </div>
                        </div>
                        <select
                            value={settings.session_timeout}
                            onChange={(e) => onSaveSettings({ session_timeout: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={60}>1 hour</option>
                            <option value={120}>2 hours</option>
                            <option value={480}>8 hours</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Active Sessions */}
            {securityTab === 'sessions' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-gray-600">{sessions.length} active sessions</p>
                        <button
                            onClick={async () => {
                                if (!confirm('Revoke all sessions except current?')) return;
                                const { securityService } = await import('@/services/settings.service');
                                await securityService.revokeAllSessions();
                                await loadSessions();
                            }}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm"
                        >
                            Revoke All
                        </button>
                    </div>
                    {sessions.map((session) => (
                        <div key={session.id} className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                            <div>
                                <p className="font-medium text-gray-900">{session.device || 'Unknown Device'}</p>
                                <p className="text-sm text-gray-500">IP: {session.ip_address}</p>
                                <p className="text-sm text-gray-500">Last active: {new Date(session.last_active).toLocaleString()}</p>
                                {session.is_current && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Current</span>}
                            </div>
                            {!session.is_current && (
                                <button
                                    onClick={() => handleRevokeSession(session.id)}
                                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm"
                                >
                                    Revoke
                                </button>
                            )}
                        </div>
                    ))}
                    {sessions.length === 0 && <p className="text-gray-500 text-center py-8">No active sessions</p>}
                </div>
            )}

            {/* API Keys */}
            {securityTab === 'api-keys' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-gray-600">{apiKeys.length} API keys</p>
                        <button
                            onClick={() => setShowCreateKeyModal(true)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
                        >
                            Create New Key
                        </button>
                    </div>

                    {/* Created Key Modal */}
                    {createdKey && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                            <p className="font-medium text-yellow-900 mb-2">⚠️ Save this key - it won't be shown again!</p>
                            <code className="block bg-white p-3 rounded border border-yellow-300 text-sm break-all">{createdKey}</code>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(createdKey);
                                    alert('Copied to clipboard!');
                                }}
                                className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm"
                            >
                                Copy to Clipboard
                            </button>
                            <button
                                onClick={() => setCreatedKey(null)}
                                className="mt-2 ml-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
                            >
                                I've Saved It
                            </button>
                        </div>
                    )}

                    {/* Create Key Modal */}
                    {showCreateKeyModal && (
                        <div className="bg-gray-50 rounded-lg p-6 mb-4 border border-gray-200">
                            <h3 className="font-medium text-gray-900 mb-4">Create New API Key</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Key Name</label>
                                    <input
                                        type="text"
                                        value={newKeyName}
                                        onChange={(e) => setNewKeyName(e.target.value)}
                                        placeholder="e.g., Production API"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expires In (days, optional)</label>
                                    <input
                                        type="number"
                                        value={newKeyExpiry}
                                        onChange={(e) => setNewKeyExpiry(e.target.value)}
                                        placeholder="Leave empty for no expiration"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCreateAPIKey}
                                        disabled={!newKeyName}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                                    >
                                        Create Key
                                    </button>
                                    <button
                                        onClick={() => setShowCreateKeyModal(false)}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {apiKeys.map((key) => (
                        <div key={key.id} className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                            <div>
                                <p className="font-medium text-gray-900">{key.name}</p>
                                <p className="text-sm text-gray-500">Key: {key.key_prefix}...</p>
                                <p className="text-sm text-gray-500">Created: {new Date(key.created_at).toLocaleDateString()}</p>
                                {key.expires_at && <p className="text-sm text-gray-500">Expires: {new Date(key.expires_at).toLocaleDateString()}</p>}
                            </div>
                            <button
                                onClick={() => handleRevokeAPIKey(key.id)}
                                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm"
                            >
                                Revoke
                            </button>
                        </div>
                    ))}
                    {apiKeys.length === 0 && <p className="text-gray-500 text-center py-8">No API keys created</p>}
                </div>
            )}

            {/* Login History */}
            {securityTab === 'history' && (
                <div className="space-y-2">
                    {loginHistory.map((entry) => (
                        <div key={entry.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium text-gray-900">{entry.device || 'Unknown Device'}</p>
                                    <p className="text-sm text-gray-500">IP: {entry.ip_address}</p>
                                    {entry.location && <p className="text-sm text-gray-500">Location: {entry.location}</p>}
                                    <p className="text-sm text-gray-500">{new Date(entry.login_at).toLocaleString()}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded ${entry.status === 'success' ? 'bg-green-100 text-green-700' :
                                    entry.status === 'failed' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {entry.status}
                                </span>
                            </div>
                        </div>
                    ))}
                    {loginHistory.length === 0 && <p className="text-gray-500 text-center py-8">No login history available</p>}
                </div>
            )}

            {/* Audit Logs */}
            {securityTab === 'audit' && (
                <div className="space-y-2">
                    {auditLogs.map((log) => (
                        <div key={log.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium text-gray-900">{log.action.replace(/_/g, ' ').toUpperCase()}</p>
                                    <p className="text-sm text-gray-500">IP: {log.ip_address}</p>
                                    {log.details && <p className="text-sm text-gray-500">Details: {JSON.stringify(log.details)}</p>}
                                    <p className="text-sm text-gray-500">{new Date(log.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {auditLogs.length === 0 && <p className="text-gray-500 text-center py-8">No audit logs available</p>}
                </div>
            )}
        </div>
    );
}

function AppearanceSection({ settings }: { settings: UserSettings }) {
    const { updateAppearance } = useTheme();
    const [localSettings, setLocalSettings] = useState(settings);

    const handleChange = (key: keyof UserSettings, value: string) => {
        const newSettings = { ...localSettings, [key]: value };
        setLocalSettings(newSettings);
        updateAppearance({ [key]: value });
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Appearance</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                        <select
                            value={localSettings.theme}
                            onChange={(e) => handleChange('theme', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="system">System</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                        <select
                            value={localSettings.language}
                            onChange={(e) => handleChange('language', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="en">English</option>
                            <option value="es">Español</option>
                            <option value="fr">Français</option>
                            <option value="de">Deutsch</option>
                            <option value="zh">中文</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                        <select
                            value={localSettings.timezone}
                            onChange={(e) => handleChange('timezone', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="UTC">UTC</option>
                            <option value="America/New_York">Eastern Time (US & Canada)</option>
                            <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                            <option value="Europe/London">London</option>
                            <option value="Asia/Tokyo">Tokyo</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
