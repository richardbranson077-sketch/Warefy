import apiClient from '../lib/api';

export interface AdminUser {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
}

export const getAdminUsers = async (): Promise<AdminUser[]> => {
    const response = await apiClient.get<AdminUser[]>('/api/v1/admin/users');
    return response.data;
};

export const createAdminUser = async (user: Partial<AdminUser>): Promise<AdminUser> => {
    const response = await apiClient.post<AdminUser>('/api/v1/admin/users', user);
    return response.data;
};

export const updateAdminUser = async (id: string, user: Partial<AdminUser>): Promise<AdminUser> => {
    const response = await apiClient.put<AdminUser>(`/api/v1/admin/users/${id}`, user);
    return response.data;
};

export const deleteAdminUser = async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/admin/users/${id}`);
};
