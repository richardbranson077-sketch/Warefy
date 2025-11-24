'use client';

import { useState } from 'react';
import { useAIChat } from '@/hooks/useAIChat';
import { LoadingSpinner } from '@/components/LoadingStates';
import { ErrorAlert } from '@/components/ErrorStates';
import { MessageSquare, Send, Bot, RefreshCw } from 'lucide-react';

export default function AIChatPage() {
    const { data: chatData, loading, error, sendMessage } = useAIChat();
    const [message, setMessage] = useState('');

    const handleSend = async () => {
        if (message.trim()) {
            await sendMessage(message);
            setMessage('');
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
                                <Bot className="h-8 w-8 text-blue-400" />
                                AI Assistant Chat
                            </h1>
                            <p className="text-gray-400 mt-1">Conversational AI support</p>
                        </div>
                    </div>
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6 h-96 overflow-y-auto">
                        {chatData?.messages?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <MessageSquare className="h-12 w-12 mb-4" />
                                <p>Start a conversation with the AI assistant</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {chatData?.messages?.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] p-3 rounded-lg ${
                                            msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-700'
                                        }`}>
                                            <p className="text-sm">{msg.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type your message..."
                            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button onClick={handleSend} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2">
                            <Send className="h-4 w-4" />
                            Send
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
