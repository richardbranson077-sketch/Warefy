import apiClient from '@/lib/api';

// Types
export interface UserSettings {
    theme: string;
    language: string;
    timezone: string;
    date_format: string;
    time_format: string;
    notifications_email: boolean;
    notifications_push: boolean;
    notifications_sms: boolean;
    notification_frequency: string;
    notify_low_stock: boolean;
    notify_anomalies: boolean;
    notify_route_delays: boolean;
    notify_system_updates: boolean;
    two_factor_enabled: boolean;
    session_timeout: number;
    api_rate_limit?: number;
    data_retention_days?: number;
}

export interface UserProfile {
    id: number;
    email: string;
    username: string;
    full_name: string;
    role: string;
    is_active: boolean;
    is_2fa_enabled: boolean;
    created_at: string;
}

export interface PasswordChangeData {
    old_password: string;
    new_password: string;
}

export interface ActiveSession {
    id: number;
    device: string;
    ip_address: string;
    location: string;
    last_active: string;
    is_current: boolean;
}

export const settingsService = {
    // Settings
    async getSettings(): Promise<UserSettings> {
        const response = await apiClient.get('/api/v1/settings');
        return response.data;
    },

    async updateSettings(data: Partial<UserSettings>): Promise<UserSettings> {
        const response = await apiClient.put('/api/v1/settings', data);
        return response.data;
    },

    // Profile
    async getProfile(): Promise<UserProfile> {
        const response = await apiClient.get('/api/v1/settings/profile');
        return response.data;
    },

    async updateProfile(data: { full_name?: string; email?: string }): Promise<UserProfile> {
        const response = await apiClient.put('/api/v1/settings/profile', data);
        return response.data;
    },

    // Security
    async changePassword(data: PasswordChangeData): Promise<{ message: string }> {
        const response = await apiClient.post('/api/v1/settings/password', data);
        return response.data;
    },

    async enable2FA(): Promise<{ message: string; qr_code: string; secret: string }> {
        const response = await apiClient.post('/api/v1/settings/2fa/enable');
        return response.data;
    },

    async disable2FA(code?: string): Promise<{ message: string }> {
        const response = await apiClient.post('/api/v1/settings/2fa/disable', { code });
        return response.data;
    },

    async getActiveSessions(): Promise<ActiveSession[]> {
        const response = await apiClient.get('/api/v1/settings/sessions');
        return response.data;
    }
};

// Enhanced Security Types
export interface LoginHistoryEntry {
    id: number;
    ip_address: string;
    user_agent: string;
    location?: string;
    device?: string;
    status: string;
    login_at: string;
}

export interface Session {
    id: number;
    ip_address: string;
    user_agent: string;
    device?: string;
    location?: string;
    created_at: string;
    last_active: string;
    expires_at: string;
    is_current: boolean;
}

export interface APIKeyData {
    id: number;
    name: string;
    key_prefix: string;
    permissions: string[];
    last_used?: string;
    created_at: string;
    expires_at?: string;
    is_active: boolean;
}

export interface APIKeyCreateData {
    name: string;
    permissions?: string[];
    expires_in_days?: number;
}

export interface SecurityAuditLog {
    id: number;
    action: string;
    details?: any;
    ip_address: string;
    user_agent?: string;
    created_at: string;
}

export interface TrustedDevice {
    id: number;
    name: string;
    device_type: string;
    last_used: string;
    added_at: string;
    is_current: boolean;
}

// Enhanced Security Service
export const securityService = {
    // Login History
    async getLoginHistory(limit: number = 50): Promise<LoginHistoryEntry[]> {
        const response = await apiClient.get(`/api/v1/settings/security/login-history?limit=${limit}`);
        return response.data;
    },

    // Sessions
    async getSessions(): Promise<Session[]> {
        const response = await apiClient.get('/api/v1/settings/security/sessions');
        return response.data;
    },

    async revokeSession(sessionId: number): Promise<{ message: string }> {
        const response = await apiClient.delete(`/api/v1/settings/security/sessions/${sessionId}`);
        return response.data;
    },

    async revokeAllSessions(): Promise<{ message: string }> {
        const response = await apiClient.delete('/api/v1/settings/security/sessions');
        return response.data;
    },

    // API Keys
    async getAPIKeys(): Promise<APIKeyData[]> {
        const response = await apiClient.get('/api/v1/settings/security/api-keys');
        return response.data;
    },

    async createAPIKey(data: APIKeyCreateData): Promise<any> {
        const response = await apiClient.post('/api/v1/settings/security/api-keys', data);
        return response.data;
    },

    async revokeAPIKey(keyId: number): Promise<{ message: string }> {
        const response = await apiClient.delete(`/api/v1/settings/security/api-keys/${keyId}`);
        return response.data;
    },

    // Audit Logs
    async getAuditLogs(limit: number = 100, action?: string): Promise<SecurityAuditLog[]> {
        const params = new URLSearchParams();
        params.append('limit', limit.toString());
        if (action) params.append('action', action);
        const response = await apiClient.get(`/api/v1/settings/security/audit-logs?${params.toString()}`);
        return response.data;
    },

    // Trusted Devices
    async getTrustedDevices(): Promise<TrustedDevice[]> {
        const response = await apiClient.get('/api/v1/settings/security/trusted-devices');
        return response.data;
    },

    async removeTrustedDevice(deviceId: number): Promise<{ message: string }> {
        const response = await apiClient.post(`/api/v1/settings/security/trusted-devices/${deviceId}/remove`);
        return response.data;
    }
};
