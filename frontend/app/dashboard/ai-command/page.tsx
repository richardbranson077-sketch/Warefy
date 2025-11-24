'use client';

import { useState } from 'react';
import { useAICommand } from '@/hooks/useAICommand';
import { LoadingSpinner } from '@/components/LoadingStates';
import { ErrorAlert } from '@/components/ErrorStates';
import { Terminal, Send, Sparkles, RefreshCw } from 'lucide-react';

export default function AICommandPage() {
    const { data: commandHistory, loading, error, executeCommand } = useAICommand();
    const [command, setCommand] = useState('');

    const handleExecute = async () => {
        if (command.trim()) {
            await executeCommand(command);
            setCommand('');
        }
    };

    return (
        <>
            {loading && <LoadingSpinner />}
            {error && <ErrorAlert message={error} />}
            {!loading && !error && (
                <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <Terminal className="h-8 w-8 text-violet-400" />
                                AI Command Center
                            </h1>
                            <p className="text-gray-400 mt-1">Natural language commands</p>
                        </div>
                    </div>
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={command}
                                onChange={(e) => setCommand(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleExecute()}
                                placeholder="Enter AI command (e.g., 'Show me low stock items')"
                                className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-violet-500 outline-none"
                            />
                            <button onClick={handleExecute} className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition flex items-center gap-2">
                                <Send className="h-4 w-4" />
                                Execute
                            </button>
                        </div>
                    </div>
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-violet-400" />
                            Command History
                        </h2>
                        <div className="space-y-2">
                            {commandHistory?.length === 0 ? (
                                <p className="text-gray-400 text-center py-8">No commands executed yet</p>
                            ) : (
                                commandHistory?.map((cmd, idx) => (
                                    <div key={idx} className="p-3 bg-gray-750 rounded-lg">
                                        <p className="text-sm font-mono text-violet-400">{cmd.command}</p>
                                        <p className="text-xs text-gray-500 mt-1">{new Date(cmd.timestamp).toLocaleString()}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
