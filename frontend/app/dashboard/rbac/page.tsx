'use client';

import { useState, useEffect } from 'react';
import {
    Shield,
    Users,
    Key,
    Lock,
    Unlock,
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    CheckCircle,
    XCircle,
    Settings,
    UserPlus,
    RefreshCw,
    X,
    AlertTriangle,
    Copy
} from 'lucide-react';

interface Role {
    id: number;
    name: string;
    description: string;
    permissions: string[];
    user_count: number;
    created_at: string;
    is_system_role: boolean;
}

interface User {
    id: number;
    username: string;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
    last_login?: string;
}

interface Permission {
    id: string;
    name: string;
    category: string;
    description: string;
}

const PERMISSION_CATEGORIES = {
    inventory: 'Inventory Management',
    orders: 'Order Management',
    shipping: 'Shipping & Logistics',
    reports: 'Reports & Analytics',
    users: 'User Management',
    settings: 'System Settings',
    quality: 'Quality Control',
    returns: 'Returns Management'
};

const ALL_PERMISSIONS: Permission[] = [
    // Inventory
    { id: 'inventory.view', name: 'View Inventory', category: 'inventory', description: 'View inventory items and stock levels' },
    { id: 'inventory.create', name: 'Create Items', category: 'inventory', description: 'Add new inventory items' },
    { id: 'inventory.edit', name: 'Edit Items', category: 'inventory', description: 'Modify inventory items' },
    { id: 'inventory.delete', name: 'Delete Items', category: 'inventory', description: 'Remove inventory items' },
    { id: 'inventory.adjust', name: 'Adjust Stock', category: 'inventory', description: 'Adjust stock levels' },

    // Orders
    { id: 'orders.view', name: 'View Orders', category: 'orders', description: 'View all orders' },
    { id: 'orders.create', name: 'Create Orders', category: 'orders', description: 'Create new orders' },
    { id: 'orders.edit', name: 'Edit Orders', category: 'orders', description: 'Modify existing orders' },
    { id: 'orders.cancel', name: 'Cancel Orders', category: 'orders', description: 'Cancel orders' },
    { id: 'orders.fulfill', name: 'Fulfill Orders', category: 'orders', description: 'Mark orders as fulfilled' },

    // Shipping
    { id: 'shipping.view', name: 'View Shipments', category: 'shipping', description: 'View shipment information' },
    { id: 'shipping.create', name: 'Create Shipments', category: 'shipping', description: 'Create new shipments' },
    { id: 'shipping.track', name: 'Track Shipments', category: 'shipping', description: 'Track shipment status' },
    { id: 'shipping.labels', name: 'Print Labels', category: 'shipping', description: 'Generate shipping labels' },

    // Reports
    { id: 'reports.view', name: 'View Reports', category: 'reports', description: 'Access reports and analytics' },
    { id: 'reports.export', name: 'Export Reports', category: 'reports', description: 'Export report data' },
    { id: 'reports.create', name: 'Create Reports', category: 'reports', description: 'Create custom reports' },

    // Users
    { id: 'users.view', name: 'View Users', category: 'users', description: 'View user accounts' },
    { id: 'users.create', name: 'Create Users', category: 'users', description: 'Add new users' },
    { id: 'users.edit', name: 'Edit Users', category: 'users', description: 'Modify user accounts' },
    { id: 'users.delete', name: 'Delete Users', category: 'users', description: 'Remove user accounts' },
    { id: 'users.roles', name: 'Manage Roles', category: 'users', description: 'Assign and manage user roles' },

    // Settings
    { id: 'settings.view', name: 'View Settings', category: 'settings', description: 'View system settings' },
    { id: 'settings.edit', name: 'Edit Settings', category: 'settings', description: 'Modify system settings' },
    { id: 'settings.integrations', name: 'Manage Integrations', category: 'settings', description: 'Configure integrations' },

    // Quality
    { id: 'quality.view', name: 'View Inspections', category: 'quality', description: 'View quality inspections' },
    { id: 'quality.create', name: 'Create Inspections', category: 'quality', description: 'Perform quality inspections' },
    { id: 'quality.approve', name: 'Approve/Reject', category: 'quality', description: 'Approve or reject items' },

    // Returns
    { id: 'returns.view', name: 'View Returns', category: 'returns', description: 'View return requests' },
    { id: 'returns.create', name: 'Create RMAs', category: 'returns', description: 'Create return authorizations' },
    { id: 'returns.approve', name: 'Approve Returns', category: 'returns', description: 'Approve or reject returns' }
];

export default function RBACPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'roles' | 'users' | 'permissions'>('roles');
    const [searchTerm, setSearchTerm] = useState('');
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Form state
    const [roleForm, setRoleForm] = useState({
        name: '',
        description: '',
        permissions: [] as string[]
    });

    const [userForm, setUserForm] = useState({
        username: '',
        email: '',
        full_name: '',
        role: '',
        password: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Simulated data - replace with actual API calls
            const mockRoles: Role[] = [
                {
                    id: 1,
                    name: 'Administrator',
                    description: 'Full system access with all permissions',
                    permissions: ALL_PERMISSIONS.map(p => p.id),
                    user_count: 2,
                    created_at: new Date().toISOString(),
                    is_system_role: true
                },
                {
                    id: 2,
                    name: 'Warehouse Manager',
                    description: 'Manage inventory, orders, and warehouse operations',
                    permissions: [
                        'inventory.view', 'inventory.create', 'inventory.edit', 'inventory.adjust',
                        'orders.view', 'orders.create', 'orders.edit', 'orders.fulfill',
                        'shipping.view', 'shipping.create', 'shipping.track',
                        'reports.view', 'reports.export'
                    ],
                    user_count: 5,
                    created_at: new Date().toISOString(),
                    is_system_role: false
                },
                {
                    id: 3,
                    name: 'Warehouse Associate',
                    description: 'Basic warehouse operations and order fulfillment',
                    permissions: [
                        'inventory.view', 'orders.view', 'orders.fulfill',
                        'shipping.view', 'shipping.labels'
                    ],
                    user_count: 15,
                    created_at: new Date().toISOString(),
                    is_system_role: false
                },
                {
                    id: 4,
                    name: 'Quality Inspector',
                    description: 'Quality control and inspection operations',
                    permissions: [
                        'inventory.view', 'quality.view', 'quality.create', 'quality.approve',
                        'returns.view', 'returns.create'
                    ],
                    user_count: 3,
                    created_at: new Date().toISOString(),
                    is_system_role: false
                }
            ];

            const mockUsers: User[] = [
                {
                    id: 1,
                    username: 'admin',
                    email: 'admin@warefy.com',
                    full_name: 'System Administrator',
                    role: 'Administrator',
                    is_active: true,
                    last_login: new Date().toISOString()
                },
                {
                    id: 2,
                    username: 'jsmith',
                    email: 'john.smith@warefy.com',
                    full_name: 'John Smith',
                    role: 'Warehouse Manager',
                    is_active: true,
                    last_login: new Date(Date.now() - 3600000).toISOString()
                },
                {
                    id: 3,
                    username: 'sjohnson',
                    email: 'sarah.johnson@warefy.com',
                    full_name: 'Sarah Johnson',
                    role: 'Warehouse Associate',
                    is_active: true,
                    last_login: new Date(Date.now() - 7200000).toISOString()
                },
                {
                    id: 4,
                    username: 'mdavis',
                    email: 'mike.davis@warefy.com',
                    full_name: 'Mike Davis',
                    role: 'Quality Inspector',
                    is_active: false
                }
            ];

            setRoles(mockRoles);
            setUsers(mockUsers);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRole = async () => {
        try {
            // In production, make API call
            console.log('Creating role:', roleForm);
            await fetchData();
            setShowRoleModal(false);
            setRoleForm({ name: '', description: '', permissions: [] });
        } catch (error) {
            console.error('Error creating role:', error);
        }
    };

    const handleCreateUser = async () => {
        try {
            // In production, make API call
            console.log('Creating user:', userForm);
            await fetchData();
            setShowUserModal(false);
            setUserForm({ username: '', email: '', full_name: '', role: '', password: '' });
        } catch (error) {
            console.error('Error creating user:', error);
        }
    };

    const handleDeleteRole = async (roleId: number) => {
        if (confirm('Are you sure you want to delete this role?')) {
            try {
                // In production, make API call
                console.log('Deleting role:', roleId);
                await fetchData();
            } catch (error) {
                console.error('Error deleting role:', error);
            }
        }
    };

    const handleToggleUserStatus = async (userId: number) => {
        try {
            // In production, make API call
            console.log('Toggling user status:', userId);
            await fetchData();
        } catch (error) {
            console.error('Error toggling user status:', error);
        }
    };

    const togglePermission = (permissionId: string) => {
        setRoleForm(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permissionId)
                ? prev.permissions.filter(p => p !== permissionId)
                : [...prev.permissions, permissionId]
        }));
    };

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">RBAC Management</h1>
                    <p className="text-gray-600 mt-1">Manage roles, permissions, and user access</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </button>
                    {activeTab === 'roles' && (
                        <button
                            onClick={() => setShowRoleModal(true)}
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition flex items-center gap-2"
                        >
                            <Plus className="h-5 w-5" />
                            Create Role
                        </button>
                    )}
                    {activeTab === 'users' && (
                        <button
                            onClick={() => setShowUserModal(true)}
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition flex items-center gap-2"
                        >
                            <UserPlus className="h-5 w-5" />
                            Add User
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Total Roles</p>
                        <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Active roles</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Total Users</p>
                        <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                    <p className="text-xs text-green-600 mt-1">Registered users</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Active Users</p>
                        <CheckCircle className="h-5 w-5 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {users.filter(u => u.is_active).length}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">Currently active</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Permissions</p>
                        <Key className="h-5 w-5 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{ALL_PERMISSIONS.length}</p>
                    <p className="text-xs text-orange-600 mt-1">Available permissions</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="border-b border-gray-200">
                    <div className="flex gap-4 px-6">
                        {[
                            { id: 'roles', label: 'Roles', icon: Shield },
                            { id: 'users', label: 'Users', icon: Users },
                            { id: 'permissions', label: 'Permissions', icon: Key }
                        ].map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${activeTab === tab.id
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="p-6">
                    {/* Roles Tab */}
                    {activeTab === 'roles' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search roles..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredRoles.map((role) => (
                                    <div key={role.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                                                    {role.is_system_role && (
                                                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                                                            System
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600">{role.description}</p>
                                            </div>
                                            <Shield className="h-6 w-6 text-blue-600" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-xs text-gray-600">Users</p>
                                                <p className="text-lg font-bold text-gray-900">{role.user_count}</p>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-xs text-gray-600">Permissions</p>
                                                <p className="text-lg font-bold text-gray-900">{role.permissions.length}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedRole(role);
                                                    setShowPermissionsModal(true);
                                                }}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition flex items-center justify-center gap-2"
                                            >
                                                <Eye className="h-4 w-4" />
                                                View Permissions
                                            </button>
                                            {!role.is_system_role && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRole(role);
                                                            setRoleForm({
                                                                name: role.name,
                                                                description: role.description,
                                                                permissions: role.permissions
                                                            });
                                                            setShowRoleModal(true);
                                                        }}
                                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteRole(role.id)}
                                                        className="px-3 py-2 border border-red-300 rounded-lg text-sm hover:bg-red-50 transition text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Last Login</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                                                        <p className="text-xs text-gray-500">@{user.username}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                                                <td className="px-4 py-3">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {user.is_active ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                            <CheckCircle className="h-3 w-3" />
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                                            <XCircle className="h-3 w-3" />
                                                            Inactive
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleToggleUserStatus(user.id)}
                                                            className="p-1 hover:bg-gray-100 rounded transition"
                                                            title={user.is_active ? 'Deactivate' : 'Activate'}
                                                        >
                                                            {user.is_active ? (
                                                                <Lock className="h-4 w-4 text-red-600" />
                                                            ) : (
                                                                <Unlock className="h-4 w-4 text-green-600" />
                                                            )}
                                                        </button>
                                                        <button className="p-1 hover:bg-gray-100 rounded transition">
                                                            <Edit className="h-4 w-4 text-gray-600" />
                                                        </button>
                                                        <button className="p-1 hover:bg-red-50 rounded transition">
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Permissions Tab */}
                    {activeTab === 'permissions' && (
                        <div className="space-y-6">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">All System Permissions</h3>
                                <p className="text-sm text-gray-600">
                                    These permissions can be assigned to roles to control user access
                                </p>
                            </div>

                            {Object.entries(PERMISSION_CATEGORIES).map(([category, categoryName]) => {
                                const categoryPermissions = ALL_PERMISSIONS.filter(p => p.category === category);
                                return (
                                    <div key={category} className="border border-gray-200 rounded-lg p-6">
                                        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <Key className="h-5 w-5 text-blue-600" />
                                            {categoryName}
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {categoryPermissions.map((permission) => (
                                                <div key={permission.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                                                        <p className="text-xs text-gray-600">{permission.description}</p>
                                                        <p className="text-xs text-gray-500 font-mono mt-1">{permission.id}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Create/Edit Role Modal */}
            {showRoleModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                                {selectedRole ? 'Edit Role' : 'Create New Role'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowRoleModal(false);
                                    setSelectedRole(null);
                                    setRoleForm({ name: '', description: '', permissions: [] });
                                }}
                                className="p-1 hover:bg-gray-100 rounded transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                                <input
                                    type="text"
                                    value={roleForm.name}
                                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g., Warehouse Manager"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={roleForm.description}
                                    onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Describe the role and its responsibilities"
                                />
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-gray-900">Permissions</h3>
                                    <span className="text-sm text-gray-600">
                                        {roleForm.permissions.length} selected
                                    </span>
                                </div>

                                {Object.entries(PERMISSION_CATEGORIES).map(([category, categoryName]) => {
                                    const categoryPermissions = ALL_PERMISSIONS.filter(p => p.category === category);
                                    const selectedCount = categoryPermissions.filter(p =>
                                        roleForm.permissions.includes(p.id)
                                    ).length;

                                    return (
                                        <div key={category} className="mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-sm font-medium text-gray-700">{categoryName}</h4>
                                                <span className="text-xs text-gray-500">
                                                    {selectedCount}/{categoryPermissions.length}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {categoryPermissions.map((permission) => (
                                                    <label
                                                        key={permission.id}
                                                        className="flex items-start gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={roleForm.permissions.includes(permission.id)}
                                                            onChange={() => togglePermission(permission.id)}
                                                            className="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                                        />
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                                                            <p className="text-xs text-gray-600">{permission.description}</p>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowRoleModal(false);
                                    setSelectedRole(null);
                                    setRoleForm({ name: '', description: '', permissions: [] });
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateRole}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                            >
                                {selectedRole ? 'Update Role' : 'Create Role'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add User Modal */}
            {showUserModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
                            <button
                                onClick={() => setShowUserModal(false)}
                                className="p-1 hover:bg-gray-100 rounded transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    value={userForm.username}
                                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="jdoe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={userForm.full_name}
                                    onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={userForm.email}
                                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="john.doe@warefy.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={userForm.role}
                                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Select role</option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.name}>{role.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    value={userForm.password}
                                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => setShowUserModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateUser}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                            >
                                Add User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Permissions Modal */}
            {showPermissionsModal && selectedRole && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                                {selectedRole.name} - Permissions
                            </h2>
                            <button
                                onClick={() => {
                                    setShowPermissionsModal(false);
                                    setSelectedRole(null);
                                }}
                                className="p-1 hover:bg-gray-100 rounded transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <p className="text-sm text-gray-600 mb-4">
                                This role has {selectedRole.permissions.length} permissions assigned
                            </p>

                            {Object.entries(PERMISSION_CATEGORIES).map(([category, categoryName]) => {
                                const categoryPermissions = ALL_PERMISSIONS.filter(
                                    p => p.category === category && selectedRole.permissions.includes(p.id)
                                );

                                if (categoryPermissions.length === 0) return null;

                                return (
                                    <div key={category} className="mb-4">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-2">{categoryName}</h4>
                                        <div className="space-y-2">
                                            {categoryPermissions.map((permission) => (
                                                <div key={permission.id} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                                                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                                                        <p className="text-xs text-gray-600">{permission.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
