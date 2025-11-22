'use client';

import { useState, useRef, useEffect } from 'react';
import { Brain, Send, Loader2, Sparkles, User } from 'lucide-react';
import { ai } from '@/lib/api';

interface Message {
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
}

export default function GeminiTestPage() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMessages([{
            role: 'ai',
            content: 'Hello! I am the Gemini Test Page. I am brand new. Ask me anything!',
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
                content: `❌ **API ERROR**\n\n${err.message || JSON.stringify(err)}`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-900 text-white">
            <header className="p-4 bg-gray-800 border-b border-gray-700 flex items-center gap-3">
                <Brain className="h-6 w-6 text-green-500" />
                <h1 className="text-xl font-bold">Gemini Test Page (New URL)</h1>
            </header>

            <main className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-2xl p-4 rounded-xl ${msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-800 border border-gray-700'}`}>
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                        </div>
                    </div>
                ))}
                {loading && <div className="text-gray-400 p-4">Thinking...</div>}
                <div ref={bottomRef} />
            </main>

            <footer className="p-4 bg-gray-800 border-t border-gray-700">
                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2"
                        placeholder="Ask Gemini..."
                    />
                    <button type="submit" className="bg-green-600 px-6 py-2 rounded-lg">Send</button>
                </form>
            </footer>
        </div>
    );
}
