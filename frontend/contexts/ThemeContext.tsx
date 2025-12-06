'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsService, UserSettings } from '@/services/settings.service';

interface ThemeContextType {
    theme: string;
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: string;
    loading: boolean;
    updateAppearance: (settings: Partial<UserSettings>) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState('light');
    const [language, setLanguage] = useState('en');
    const [timezone, setTimezone] = useState('UTC');
    const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
    const [timeFormat, setTimeFormat] = useState('12h');
    const [loading, setLoading] = useState(true);

    // Load settings on mount
    useEffect(() => {
        loadSettings();
    }, []);

    // Apply theme class to document
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
        } else {
            root.classList.add(theme);
        }
    }, [theme]);

    const loadSettings = async () => {
        try {
            const settings = await settingsService.getSettings();
            setTheme(settings.theme || 'light');
            setLanguage(settings.language || 'en');
            setTimezone(settings.timezone || 'UTC');
            setDateFormat(settings.date_format || 'MM/DD/YYYY');
            setTimeFormat(settings.time_format || '12h');
        } catch (error: any) {
            // If 401 (unauthenticated), silently use defaults
            // This allows the login page to work properly
            if (error?.response?.status === 401) {
                console.log('Not authenticated, using default theme settings');
            } else {
                console.error('Failed to load theme settings:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    const updateAppearance = async (newSettings: Partial<UserSettings>) => {
        try {
            // Optimistic update
            if (newSettings.theme) setTheme(newSettings.theme);
            if (newSettings.language) setLanguage(newSettings.language);
            if (newSettings.timezone) setTimezone(newSettings.timezone);
            if (newSettings.date_format) setDateFormat(newSettings.date_format);
            if (newSettings.time_format) setTimeFormat(newSettings.time_format);

            // Save to backend
            await settingsService.updateSettings(newSettings);
        } catch (error) {
            console.error('Failed to update appearance settings:', error);
            // Revert on failure (could be improved with previous state)
            loadSettings();
        }
    };

    return (
        <ThemeContext.Provider value={{
            theme,
            language,
            timezone,
            dateFormat,
            timeFormat,
            loading,
            updateAppearance
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
