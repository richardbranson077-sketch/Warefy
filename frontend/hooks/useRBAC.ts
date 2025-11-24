import { useState, useEffect } from 'react';
import * as rbacService from '../services/rbac.service';
import { Role, Permission, UserRole } from '../services/rbac.service';

export const useRBAC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const data = await rbacService.getRoles();
            setRoles(data);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const fetchPermissions = async () => {
        setLoading(true);
        try {
            const data = await rbacService.getPermissions();
            setPermissions(data);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const assignRole = async (assignment: UserRole) => {
        setLoading(true);
        try {
            await rbacService.assignRoleToUser(assignment);
            // Optionally refresh roles
            await fetchRoles();
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
        fetchPermissions();
    }, []);

    return { roles, permissions, loading, error, assignRole, fetchRoles, fetchPermissions };
};
