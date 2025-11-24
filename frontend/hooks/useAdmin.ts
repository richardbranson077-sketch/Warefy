import { useState, useEffect } from 'react';
import * as adminService from '../services/admin.service';
import { AdminUser } from '../services/admin.service';

export const useAdmin = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await adminService.getAdminUsers();
            setUsers(data);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const createUser = async (user: Partial<AdminUser>) => {
        setLoading(true);
        try {
            const newUser = await adminService.createAdminUser(user);
            setUsers(prev => [...prev, newUser]);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const updateUser = async (id: string, user: Partial<AdminUser>) => {
        setLoading(true);
        try {
            const updated = await adminService.updateAdminUser(id, user);
            setUsers(prev => prev.map(u => (u.id === id ? updated : u)));
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (id: string) => {
        setLoading(true);
        try {
            await adminService.deleteAdminUser(id);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return { users, loading, error, fetchUsers, createUser, updateUser, deleteUser };
};
