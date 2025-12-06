'use client';

import { useState, useEffect } from 'react';
import {
    Shield,
    Plus,
    Edit2,
    Trash2,
    Check,
    X,
    Lock,
    Eye,
    Save,
    AlertTriangle
} from 'lucide-react';
import { rbacService, Role, CreateRoleDTO, PermissionData } from '@/services/rbac.service';
import { LoadingSpinner } from '@/components/LoadingStates';

export default function RBACPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [meta, setMeta] = useState<PermissionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [error, setError] = useState('');

    // Form state
    const [formData, setFormData] = useState<CreateRoleDTO>({
        name: '',
        description: '',
        permissions: {},
        field_restrictions: {}
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [rolesData, metaData] = await Promise.all([
                rbacService.getAllRoles(),
                rbacService.getPermissions()
            ]);
            setRoles(rolesData);
            setMeta(metaData);

            // Initialize empty permissions structure
            if (metaData) {
                const initialPerms: Record<string, string[]> = {};
                metaData.modules.forEach(m => initialPerms[m] = []);
                setFormData(prev => ({ ...prev, permissions: initialPerms }));
            }
        } catch (err) {
            console.error('Failed to load RBAC data:', err);
            setError('Failed to load roles and permissions');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveRole = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingRole) {
                await rbacService.updateRole(editingRole.id, formData);
            } else {
                await rbacService.createRole(formData);
            }
            setShowModal(false);
            setEditingRole(null);
            resetForm();
            loadData();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to save role');
        }
    };

    const handleDeleteRole = async (id: string) => {
        if (!confirm('Are you sure you want to delete this role?')) return;
        try {
            await rbacService.deleteRole(id);
            loadData();
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Failed to delete role');
        }
    };

    const togglePermission = (module: string, perm: string) => {
        setFormData(prev => {
            const currentPerms = prev.permissions[module] || [];
            const newPerms = currentPerms.includes(perm)
                ? currentPerms.filter(p => p !== perm)
                : [...currentPerms, perm];

            return {
                ...prev,
                permissions: {
                    ...prev.permissions,
                    [module]: newPerms
                }
            };
        });
    };

    const resetForm = () => {
        const initialPerms: Record<string, string[]> = {};
        if (meta) {
            meta.modules.forEach(m => initialPerms[m] = []);
        }
        setFormData({
            name: '',
            description: '',
            permissions: initialPerms,
            field_restrictions: {}
        });
        setError('');
    };

    const openEditModal = (role: Role) => {
        setEditingRole(role);
        // Ensure all modules exist in permissions object
        const permissions = { ...role.permissions };
        if (meta) {
            meta.modules.forEach(m => {
                if (!permissions[m]) permissions[m] = [];
            });
        }

        setFormData({
            name: role.name,
            description: role.description,
            permissions,
            field_restrictions: role.field_restrictions
        });
        setShowModal(true);
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Shield className="h-8 w-8 text-rose-600" />
                        Role-Based Access Control
                    </h1>
                    <p className="text-gray-500 mt-1">Manage roles, permissions, and security policies</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg transition shadow-sm"
                >
                    <Plus className="h-5 w-5" />
                    Create New Role
                </button>
            </div>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {roles.map((role) => (
                    <div key={role.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{role.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                                </div>
                                <div className={`p-2 rounded-lg ${role.id === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                                    <Lock className="h-5 w-5" />
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Access Highlights</div>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(role.permissions).slice(0, 4).map(([module, perms]) => (
                                        perms.length > 0 && (
                                            <span key={module} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded border border-gray-100 capitalize">
                                                {module} ({perms.length})
                                            </span>
                                        )
                                    ))}
                                    {Object.keys(role.permissions).length > 4 && (
                                        <span className="px-2 py-1 bg-gray-50 text-gray-400 text-xs rounded border border-gray-100">
                                            +{Object.keys(role.permissions).length - 4} more
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => openEditModal(role)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    <Edit2 className="h-4 w-4" />
                                    Configure
                                </button>
                                {role.id !== 'admin' && (
                                    <button
                                        onClick={() => handleDeleteRole(role.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Permission Matrix Modal */}
            {showModal && meta && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingRole ? 'Configure Role' : 'Create New Role'}
                            </h2>
                            <button
                                onClick={() => { setShowModal(false); setEditingRole(null); }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveRole} className="flex-1 overflow-hidden flex flex-col">
                            <div className="p-6 overflow-y-auto flex-1">
                                {error && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                                            placeholder="e.g. Senior Auditor"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                                            placeholder="e.g. Can view all records but edit none"
                                        />
                                    </div>
                                </div>

                                <div className="border rounded-xl overflow-hidden">
                                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                                        <h3 className="font-semibold text-gray-900">Permission Matrix</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                                <tr>
                                                    <th className="px-6 py-3 font-medium">Module</th>
                                                    {meta.permissions.map(perm => (
                                                        <th key={perm} className="px-6 py-3 font-medium text-center">{perm}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {meta.modules.map(module => (
                                                    <tr key={module} className="bg-white hover:bg-gray-50">
                                                        <td className="px-6 py-4 font-medium text-gray-900 capitalize">
                                                            {module}
                                                        </td>
                                                        {meta.permissions.map(perm => {
                                                            const isChecked = formData.permissions[module]?.includes(perm);
                                                            return (
                                                                <td key={`${module}-${perm}`} className="px-6 py-4 text-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => togglePermission(module, perm)}
                                                                        className={`w-6 h-6 rounded border flex items-center justify-center transition-colors mx-auto
                                                                            ${isChecked
                                                                                ? 'bg-rose-600 border-rose-600 text-white'
                                                                                : 'bg-white border-gray-300 text-transparent hover:border-rose-400'}`}
                                                                    >
                                                                        <Check className="h-4 w-4" />
                                                                    </button>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); setEditingRole(null); }}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-2"
                                >
                                    <Save className="h-4 w-4" />
                                    Save Configuration
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
