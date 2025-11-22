'use client';

import { useState, useRef, useEffect } from 'react';
import { Brain, Send, Loader2, Sparkles, User, AlertTriangle } from 'lucide-react';
import { ai } from '@/lib/api';

interface Message {
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
}

export default function AICommandCenterPage() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMessages([{
            role: 'ai',
            content: 'Hello! I am your AI Supply Chain Assistant (Powered by Gemini). I can help you with inventory, routes, and more. Ask me anything!',
            timestamp: new Date()
        }]);
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input.trim();
        const userMessage: Message = { role: 'user', content: userMsg, timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            console.log('Calling AI API...');
            const response = await ai.command(userMsg);
            console.log('API Response:', response);

            if (response && response.response) {
                const aiMessage: Message = {
                    role: 'ai',
                    content: response.response,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiMessage]);
            } else {
                throw new Error('API returned empty response');
            }
        } catch (err: any) {
            console.error('API Error:', err);
            const errorMessage: Message = {
                role: 'ai',
                content: `❌ **Connection Error**\n\nI couldn't reach the AI brain.\nError: ${err.message || JSON.stringify(err)}\n\nPlease check if the backend is running.`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            <header className="px-6 py-4 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                        <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">AI Command Center</h1>
                        <p className="text-xs text-gray-400">Powered by Gemini & Custom ML Models</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400 font-medium">Online</span>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-2xl flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            {msg.role === 'ai' && (
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Sparkles className="h-4 w-4 text-white" />
                                </div>
                            )}
                            {msg.role === 'user' && (
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <User className="h-4 w-4 text-white" />
                                </div>
                            )}

                            <div className={`rounded-2xl p-4 ${msg.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-800 text-gray-100 border border-gray-700'
                                }`}>
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                                <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                                    {msg.timestamp.toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="flex items-start gap-3 max-w-2xl">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                                <Sparkles className="h-4 w-4 text-white" />
                            </div>
                            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm">AI is thinking...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </main>

            <footer className="px-6 py-4 bg-gray-800/50 backdrop-blur-sm border-t border-gray-700">
                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-3">
                    <input
                        type="text"
                        placeholder="Ask me anything about your supply chain..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                        className="flex-1 rounded-xl bg-gray-900 border border-gray-700 px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white font-medium transition shadow-lg shadow-purple-500/20"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <Send className="h-5 w-5" />
                                Send
                            </>
                        )}
                    </button>
                </form>
            </footer>
        </div>
    );
}
