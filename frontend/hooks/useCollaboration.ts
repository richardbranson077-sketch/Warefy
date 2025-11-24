import { useState, useEffect } from 'react';
import * as collabService from '../services/collaboration.service';
import { CollaborationSession } from '../services/collaboration.service';

export const useCollaboration = () => {
    const [sessions, setSessions] = useState<CollaborationSession[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const data = await collabService.getSessions();
            setSessions(data);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const createSession = async (session: Partial<CollaborationSession>) => {
        setLoading(true);
        try {
            const newSession = await collabService.createSession(session);
            setSessions(prev => [...prev, newSession]);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const deleteSession = async (id: string) => {
        setLoading(true);
        try {
            await collabService.deleteSession(id);
            setSessions(prev => prev.filter(s => s.id !== id));
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    return { sessions, loading, error, fetchSessions, createSession, deleteSession };
};
