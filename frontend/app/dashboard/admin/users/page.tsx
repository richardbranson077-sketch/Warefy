'use client';

import { useEffect, useState } from 'react';
import {
    User,
    updateUser,
    getAllUsers,
    getUserUsage,
    getAuditLogs,
} from '@/lib/api';
import {
    Edit,
    CheckCircle,
    XCircle,
    Loader2,
    ShieldCheck,
    Activity,
    FileText,
    Users,
} from 'lucide-react';

interface EditableUser extends User {
    editing?: boolean;
    tempRole?: string;
    tempActive?: boolean;
    temp2FA?: boolean;
    usage?: { total_requests: number; requests_24h: number };
}

interface AuditLogEntry {
    id: number;
    user_id: number;
    target_user_id?: number;
    action: string;
    details?: string;
    timestamp: string;
}

export default function UsersAdminPage() {
    const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users');
    const [users, setUsers] = useState<EditableUser[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [savingId, setSavingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Load data based on active tab
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                if (activeTab === 'users') {
                    const data = await getAllUsers();
                    // Fetch usage for each user
                    const usersWithUsage = await Promise.all(
                        data.map(async (u) => {
                            try {
                                const usage = await getUserUsage(u.id);
                                return { ...u, usage };
                            } catch {
                                return { ...u, usage: { total_requests: 0, requests_24h: 0 } };
                            }
                        })
                    );
                    setUsers(usersWithUsage);
                } else {
                    const logs = await getAuditLogs();
                    setAuditLogs(logs);
                }
            } catch (e: any) {
                setError(e.message ?? 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [activeTab]);

    const startEdit = (id: number) => {
        setUsers((prev) =>
            prev.map((u) =>
                u.id === id
                    ? {
                        ...u,
                        editing: true,
                        tempRole: u.role,
                        tempActive: u.is_active,
                        temp2FA: u.is_2fa_enabled,
                    }
                    : u
            )
        );
    };

    const cancelEdit = (id: number) => {
        setUsers((prev) =>
            prev.map((u) => (u.id === id ? { ...u, editing: false } : u))
        );
    };

    const saveChanges = async (id: number) => {
        const user = users.find((u) => u.id === id);
        if (!user) return;
        setSavingId(id);
        try {
            await updateUser(id, {
                role: user.tempRole,
                is_active: user.tempActive,
                is_2fa_enabled: user.temp2FA,
            });
            // Refresh list
            const refreshed = await getAllUsers();
            // Re-fetch usage (optimization: could just copy old usage)
            const usersWithUsage = await Promise.all(
                refreshed.map(async (u) => {
                    try {
                        const usage = await getUserUsage(u.id);
                        return { ...u, usage };
                    } catch {
                        return { ...u, usage: { total_requests: 0, requests_24h: 0 } };
                    }
                })
            );
            setUsers(usersWithUsage);
        } catch (e: any) {
            setError(e.message ?? 'Save failed');
        } finally {
            setSavingId(null);
        }
    };

    return (
        <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <ShieldCheck className="h-6 w-6 text-purple-400" />
                    Admin Console
                </h1>

                {/* Tab Switcher */}
                <div className="flex bg-gray-800 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition ${activeTab === 'users'
                                ? 'bg-gray-700 text-white shadow'
                                : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        <Users className="h-4 w-4" />
                        Users
                    </button>
                    <button
                        onClick={() => setActiveTab('audit')}
                        className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition ${activeTab === 'audit'
                                ? 'bg-gray-700 text-white shadow'
                                : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        <FileText className="h-4 w-4" />
                        Audit Logs
                    </button>
                </div>
            </div>

            {error && (
                <p className="mb-4 rounded bg-red-600 p-2 text-center text-sm">{error}</p>
            )}

            {loading ? (
                <div className="flex h-64 items-center justify-center text-gray-300">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : activeTab === 'users' ? (
                /* Users Table */
                <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800">
                    <table className="w-full table-auto text-left">
                        <thead className="bg-gray-900 text-gray-400 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-4 py-3">ID</th>
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-center">2FA</th>
                                <th className="px-4 py-3 text-center">API Usage (24h)</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-750">
                                    <td className="px-4 py-3 text-gray-500">#{u.id}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-white">{u.username}</div>
                                        <div className="text-xs text-gray-500">{u.email}</div>
                                    </td>

                                    {/* Role */}
                                    <td className="px-4 py-3">
                                        {u.editing ? (
                                            <select
                                                value={u.tempRole}
                                                onChange={(e) =>
                                                    setUsers((prev) =>
                                                        prev.map((x) =>
                                                            x.id === u.id ? { ...x, tempRole: e.target.value } : x
                                                        )
                                                    )
                                                }
                                                className="rounded bg-gray-700 px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            >
                                                <option value="admin">Admin</option>
                                                <option value="manager">Manager</option>
                                                <option value="driver">Driver</option>
                                                <option value="viewer">Viewer</option>
                                            </select>
                                        ) : (
                                            <span
                                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${u.role === 'admin'
                                                        ? 'bg-purple-900 text-purple-200'
                                                        : u.role === 'manager'
                                                            ? 'bg-blue-900 text-blue-200'
                                                            : 'bg-gray-700 text-gray-300'
                                                    }`}
                                            >
                                                {u.role}
                                            </span>
                                        )}
                                    </td>

                                    {/* Active Status */}
                                    <td className="px-4 py-3 text-center">
                                        {u.editing ? (
                                            <input
                                                type="checkbox"
                                                checked={u.tempActive}
                                                onChange={(e) =>
                                                    setUsers((prev) =>
                                                        prev.map((x) =>
                                                            x.id === u.id
                                                                ? { ...x, tempActive: e.target.checked }
                                                                : x
                                                        )
                                                    )
                                                }
                                                className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                                            />
                                        ) : u.is_active ? (
                                            <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                                        ) : (
                                            <XCircle className="mx-auto h-5 w-5 text-red-500" />
                                        )}
                                    </td>

                                    {/* 2FA Status */}
                                    <td className="px-4 py-3 text-center">
                                        {u.editing ? (
                                            <input
                                                type="checkbox"
                                                checked={u.temp2FA}
                                                onChange={(e) =>
                                                    setUsers((prev) =>
                                                        prev.map((x) =>
                                                            x.id === u.id
                                                                ? { ...x, temp2FA: e.target.checked }
                                                                : x
                                                        )
                                                    )
                                                }
                                                className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                                            />
                                        ) : u.is_2fa_enabled ? (
                                            <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                                        ) : (
                                            <span className="text-xs text-gray-500">Off</span>
                                        )}
                                    </td>

                                    {/* API Usage Badge */}
                                    <td className="px-4 py-3 text-center">
                                        <div className="inline-flex items-center gap-1 rounded-full bg-gray-700 px-2 py-1 text-xs font-medium text-gray-300">
                                            <Activity className="h-3 w-3 text-blue-400" />
                                            {u.usage?.requests_24h ?? 0} / 24h
                                        </div>
                                        <div className="text-[10px] text-gray-500 mt-0.5">
                                            Total: {u.usage?.total_requests ?? 0}
                                        </div>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-4 py-3 text-right">
                                        {u.editing ? (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => saveChanges(u.id)}
                                                    disabled={savingId === u.id}
                                                    className="rounded bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                                                >
                                                    {savingId === u.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        'Save'
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => cancelEdit(u.id)}
                                                    className="rounded bg-gray-600 px-2 py-1 text-xs font-medium text-white hover:bg-gray-500"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => startEdit(u.id)}
                                                className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
                                            >
                                                <Edit className="inline h-3 w-3 mr-1" /> Edit
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                /* Audit Logs Table */
                <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800">
                    <table className="w-full table-auto text-left">
                        <thead className="bg-gray-900 text-gray-400 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-4 py-3">Time</th>
                                <th className="px-4 py-3">Actor (ID)</th>
                                <th className="px-4 py-3">Action</th>
                                <th className="px-4 py-3">Target (ID)</th>
                                <th className="px-4 py-3">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {auditLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                        No audit logs found.
                                    </td>
                                </tr>
                            ) : (
                                auditLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-750">
                                        <td className="px-4 py-3 text-sm text-gray-400">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-blue-400 font-medium">
                                            User #{log.user_id}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center rounded-md bg-gray-700 px-2 py-1 text-xs font-medium text-gray-200 border border-gray-600">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-400">
                                            {log.target_user_id ? `User #${log.target_user_id}` : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500 font-mono max-w-xs truncate">
                                            {log.details || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
