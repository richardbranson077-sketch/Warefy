import { useState } from 'react';
import * as aiCommandService from '../services/aiCommand.service';

export interface ChatMessage {
    command: string;
    response: string;
    timestamp: string;
}

export const useAICommand = () => {
    const [commandHistory, setCommandHistory] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const executeCommand = async (prompt: string) => {
        setLoading(true);
        setError(null);
        try {
            // Convert history to format expected by backend
            // Backend expects: [{"role": "user"|"model", "parts": ["message"]}]
            const history = commandHistory.map(msg => [
                { role: 'user', parts: [msg.command] },
                { role: 'model', parts: [msg.response] }
            ]).flat();

            const result = await aiCommandService.sendCommand(prompt, history);

            const newMessage: ChatMessage = {
                command: prompt,
                response: result.response,
                timestamp: new Date().toISOString()
            };

            setCommandHistory(prev => {
                // Check if the last message is an optimistic placeholder for this command
                const lastMsg = prev[prev.length - 1];
                if (lastMsg && lastMsg.command === prompt && lastMsg.response === "...") {
                    // Replace the placeholder
                    return [...prev.slice(0, -1), newMessage];
                }
                // Otherwise append
                return [...prev, newMessage];
            });
            return result;
        } catch (e) {
            const errorMsg = (e as Error).message || 'Failed to execute command';
            setError(errorMsg);
            // Add error message to chat so user sees it
            setCommandHistory(prev => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg && lastMsg.command === prompt && lastMsg.response === "...") {
                    return [...prev.slice(0, -1), {
                        command: prompt,
                        response: `Error: ${errorMsg}`,
                        timestamp: new Date().toISOString()
                    }];
                }
                return [...prev, {
                    command: prompt,
                    response: `Error: ${errorMsg}`,
                    timestamp: new Date().toISOString()
                }];
            });
        } finally {
            setLoading(false);
        }
    };

    const clearHistory = () => {
        setCommandHistory([]);
    };

    return {
        data: commandHistory,
        loading,
        error,
        executeCommand,
        clearHistory,
        setData: setCommandHistory
    };
};
