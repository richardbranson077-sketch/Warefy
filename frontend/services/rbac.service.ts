/**
 * RBAC Service
 * Handles API calls for role management
 */

import apiClient from '@/lib/api';

export interface Role {
    id: string;
    name: string;
    description: string;
    permissions: Record<string, string[]>; // { module: [permissions] }
    field_restrictions: Record<string, string[]>; // { module: [fields] }
}

export interface CreateRoleDTO {
    name: string;
    description: string;
    permissions: Record<string, string[]>;
    field_restrictions?: Record<string, string[]>;
}

export interface PermissionData {
    modules: string[];
    permissions: string[];
}

export const rbacService = {
    /**
     * Get all roles
     */
    getAllRoles: async () => {
        const response = await apiClient.get<Role[]>('/api/v1/rbac/roles');
        return response.data;
    },

    /**
     * Create a new role
     */
    createRole: async (data: CreateRoleDTO) => {
        const response = await apiClient.post<Role>('/api/v1/rbac/roles', data);
        return response.data;
    },

    /**
     * Update a role
     */
    updateRole: async (id: string, data: CreateRoleDTO) => {
        const response = await apiClient.put<Role>(`/api/v1/rbac/roles/${id}`, data);
        return response.data;
    },

    /**
     * Delete a role
     */
    deleteRole: async (id: string) => {
        await apiClient.delete(`/api/v1/rbac/roles/${id}`);
    },

    /**
     * Get available permissions and modules
     */
    getPermissions: async () => {
        const response = await apiClient.get<PermissionData>('/api/v1/rbac/permissions');
        return response.data;
    }
};
