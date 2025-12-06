import { apiClient } from '../lib/api';

export interface User {
    id: number;
    email: string;
    username: string;
    full_name: string;
    role: string;
    is_active: boolean;
    created_at: string;
}

export interface CreateUserDTO {
    email: string;
    username: string;
    password: string;
    full_name: string;
    role: string;
}

export const usersService = {
    getMe: async () => {
        const response = await apiClient.get('/api/v1/users/me');
        return response.data;
    },

    updateMe: async (data: any) => {
        const response = await apiClient.put('/api/v1/users/me', data);
        return response.data;
    },

    uploadAvatar: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post('/api/v1/users/me/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Admin User Management
    getUsers: async (): Promise<User[]> => {
        const response = await apiClient.get('/api/v1/users');
        return response.data;
    },

    // Alias for getUsers (for compatibility)
    getAllUsers: async (): Promise<User[]> => {
        const response = await apiClient.get('/api/v1/users');
        return response.data;
    },

    getRoles: () => {
        // Return hardcoded roles synchronously (not async)
        return [
            { value: 'admin', label: 'Admin' },
            { value: 'manager', label: 'Manager' },
            { value: 'driver', label: 'Driver' },
            { value: 'viewer', label: 'Viewer' }
        ];
    },

    createUser: async (data: CreateUserDTO) => {
        const response = await apiClient.post('/api/v1/users', data);
        return response.data;
    },

    updateUser: async (id: number, data: any) => {
        const response = await apiClient.put(`/api/v1/users/${id}`, data);
        return response.data;
    },

    deleteUser: async (id: number) => {
        const response = await apiClient.delete(`/api/v1/users/${id}`);
        return response.data;
    }
};
