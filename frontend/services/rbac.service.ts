import apiClient from '../lib/api';

export interface Role {
    id: string;
    name: string;
    description?: string;
}

export interface Permission {
    id: string;
    action: string;
    resource: string;
}

export interface UserRole {
    userId: string;
    roleId: string;
}

export const getRoles = async (): Promise<Role[]> => {
    const response = await apiClient.get<Role[]>('/api/v1/rbac/roles');
    return response.data;
};

export const createRole = async (role: Partial<Role>): Promise<Role> => {
    const response = await apiClient.post<Role>('/api/v1/rbac/roles', role);
    return response.data;
};

export const updateRole = async (id: string, role: Partial<Role>): Promise<Role> => {
    const response = await apiClient.put<Role>(`/api/v1/rbac/roles/${id}`, role);
    return response.data;
};

export const deleteRole = async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/rbac/roles/${id}`);
};

export const getPermissions = async (): Promise<Permission[]> => {
    const response = await apiClient.get<Permission[]>('/api/v1/rbac/permissions');
    return response.data;
};

export const assignRoleToUser = async (assignment: UserRole): Promise<void> => {
    await apiClient.post('/api/v1/rbac/assign', assignment);
};
