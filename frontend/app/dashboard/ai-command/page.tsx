'use client';

import { useState, useEffect, useRef } from 'react';
import { Brain, Send, Loader2 } from 'lucide-react';
import { ai } from '@/lib/api';

// Message type for chat UI
interface Message {
    role: 'user' | 'ai';
    content: string;
}

export default function AICommandCenterPage() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        const userMsg = input.trim();
        // Add user message
        setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setLoading(true);
        try {
            const response = await ai.command(userMsg);
            const aiMsg = response?.response ?? 'Sorry, I could not generate a reply.';
            setMessages((prev) => [...prev, { role: 'ai', content: aiMsg }]);
        } catch (err) {
            console.error('AI command error:', err);
            setMessages((prev) => [...prev, { role: 'ai', content: 'Error: unable to reach AI service.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
            {/* Header */}
            <header className="flex items-center gap-2 px-6 py-4 bg-gray-800 border-b border-gray-700">
                <Brain className="h-6 w-6 text-purple-400" />
                <h1 className="text-xl font-semibold">AI Command Center</h1>
            </header>

            {/* Chat area */}
            <main className="flex-1 overflow-y-auto p-6">
                {messages.length === 0 && (
                    <p className="text-center text-gray-500 mt-12">
                        Ask anything about your supply chain – e.g. "Show low‑stock items" or "Optimize routes for tomorrow".
                    </p>
                )}
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-xs rounded-lg p-3 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-100'
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </main>

            {/* Input area */}
            <footer className="flex items-center gap-2 px-4 py-3 bg-gray-800 border-t border-gray-700">
                <form onSubmit={handleSend} className="flex flex-1 items-center gap-2">
                    <input
                        type="text"
                        placeholder="Ask the AI..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                        className="flex-1 rounded-md bg-gray-700 px-4 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="p-2 rounded-md bg-purple-600 hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin text-gray-100" />
                        ) : (
                            <Send className="h-5 w-5 text-gray-100" />
                        )}
                    </button>
                </form>
            </footer>
        </div>
    );
}
