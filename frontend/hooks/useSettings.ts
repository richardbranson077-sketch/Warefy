import { useState, useEffect } from 'react';
import * as settingsService from '../services/settings.service';
import { Setting } from '../services/settings.service';

export const useSettings = () => {
    const [settings, setSettings] = useState<Setting[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const data = await settingsService.getSettings();
            setSettings(data);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = async (key: string, value: string) => {
        setLoading(true);
        try {
            const updated = await settingsService.updateSetting(key, value);
            setSettings(prev => prev.map(s => (s.key === key ? updated : s)));
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const deleteSetting = async (key: string) => {
        setLoading(true);
        try {
            await settingsService.deleteSetting(key);
            setSettings(prev => prev.filter(s => s.key !== key));
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return { settings, loading, error, fetchSettings, updateSetting, deleteSetting };
};
