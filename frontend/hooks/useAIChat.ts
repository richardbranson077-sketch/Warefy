import { useState, useEffect } from 'react';
import * as aiChatService from '../services/aiChat.service';
import { AIChatSession, AIChatMessage } from '../services/aiChat.service';

export const useAIChat = () => {
    const [sessions, setSessions] = useState<AIChatSession[]>([]);
    const [currentSession, setCurrentSession] = useState<AIChatSession | null>(null);
    const [messages, setMessages] = useState<AIChatMessage[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const data = await aiChatService.getChatSessions();
            setSessions(data);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const createSession = async () => {
        setLoading(true);
        try {
            const newSession = await aiChatService.createChatSession();
            setSessions(prev => [...prev, newSession]);
            setCurrentSession(newSession);
            setMessages([]);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (sessionId: string) => {
        setLoading(true);
        try {
            const msgs = await aiChatService.getChatMessages(sessionId);
            setMessages(msgs);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (content: string) => {
        if (!currentSession) return;
        setLoading(true);
        try {
            const msg = await aiChatService.sendMessage(currentSession.id, content);
            setMessages(prev => [...prev, msg]);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const deleteSession = async (sessionId: string) => {
        setLoading(true);
        try {
            await aiChatService.deleteChatSession(sessionId);
            setSessions(prev => prev.filter(s => s.id !== sessionId));
            if (currentSession?.id === sessionId) {
                setCurrentSession(null);
                setMessages([]);
            }
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    return {
        sessions,
        currentSession,
        messages,
        loading,
        error,
        fetchSessions,
        createSession,
        loadMessages,
        sendMessage,
        deleteSession,
        setCurrentSession,
    };
};
