import { useState, useEffect } from 'react';
import * as aiCommandService from '../services/aiCommand.service';
import { AICommand } from '../services/aiCommand.service';

export const useAICommand = () => {
    const [commands, setCommands] = useState<AICommand[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCommands = async () => {
        setLoading(true);
        try {
            const data = await aiCommandService.getCommands();
            setCommands(data);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const executeCommand = async (commandId: string, payload: any) => {
        setLoading(true);
        try {
            const result = await aiCommandService.executeCommand(commandId, payload);
            return result;
        } catch (e) {
            setError((e as Error).message);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    const createCommand = async (cmd: Partial<AICommand>) => {
        setLoading(true);
        try {
            const newCmd = await aiCommandService.createCommand(cmd);
            setCommands(prev => [...prev, newCmd]);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const deleteCommand = async (commandId: string) => {
        setLoading(true);
        try {
            await aiCommandService.deleteCommand(commandId);
            setCommands(prev => prev.filter(c => c.id !== commandId));
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommands();
    }, []);

    return { commands, loading, error, fetchCommands, executeCommand, createCommand, deleteCommand };
};
