'use client';

import { useState, useRef, useEffect } from 'react';
import { Brain, Send, Loader2, Sparkles, User, AlertTriangle, Mic, Box, Truck, FileText } from 'lucide-react';
import { ai } from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        setMessages([{
            role: 'ai',
            content: '👋 **Hello! I am your Warefy AI.**\n\nI can help you track inventory 📦, optimize routes 🚚, or detect anomalies 🚨.\n\n**Try a quick action below or ask me anything!**',
            timestamp: new Date()
        }]);
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (text: string = input) => {
        if (!text.trim()) return;

        const userMsg = text.trim();
        const userMessage: Message = { role: 'user', content: userMsg, timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // Format history for Gemini API
            const history = messages.map(msg => ({
                role: msg.role === 'ai' ? 'model' : 'user',
                parts: [msg.content]
            }));

            const response = await ai.command(userMsg, history);

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
            const backendError = err.response?.data?.detail || err.message || JSON.stringify(err);

            const errorMessage: Message = {
                role: 'ai',
                content: `❌ **Connection Error**\n\nI couldn't reach the AI brain.\n**Details:** ${backendError}\n\nPlease check if the backend is running.`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const startListening = () => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new (window as any).webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                handleSend(transcript);
            };
            recognition.start();
        } else {
            alert('Voice input is not supported in this browser.');
        }
    };

    const quickActions = [
        { icon: <Box className="w-4 h-4" />, label: 'Check Inventory', prompt: 'Check inventory status for low stock items' },
        { icon: <Truck className="w-4 h-4" />, label: 'Route Status', prompt: 'What is the status of active routes?' },
        { icon: <AlertTriangle className="w-4 h-4" />, label: 'Anomalies', prompt: 'Are there any security anomalies?' },
        { icon: <FileText className="w-4 h-4" />, label: 'Daily Report', prompt: 'Generate a daily executive summary' },
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            <header className="px-6 py-4 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">AI Command Center</h1>
                        <p className="text-xs text-gray-400">Powered by Gemini 1.5 Flash ⚡️</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full border border-green-500/30">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400 font-medium">Online</span>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`max-w-2xl flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            {msg.role === 'ai' && (
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                                    <Sparkles className="h-4 w-4 text-white" />
                                </div>
                            )}
                            {msg.role === 'user' && (
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                                    <User className="h-4 w-4 text-white" />
                                </div>
                            )}

                            <div className={`rounded-2xl p-4 shadow-sm ${msg.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-800 text-gray-100 border border-gray-700'
                                }`}>
                                <div className="prose prose-invert prose-sm max-w-none leading-relaxed">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            // Style tables
                                            table: ({ node, ...props }) => (
                                                <table className="w-full border-collapse border border-gray-600 my-2" {...props} />
                                            ),
                                            thead: ({ node, ...props }) => (
                                                <thead className="bg-gray-700" {...props} />
                                            ),
                                            th: ({ node, ...props }) => (
                                                <th className="border border-gray-600 px-3 py-2 text-left font-semibold" {...props} />
                                            ),
                                            td: ({ node, ...props }) => (
                                                <td className="border border-gray-600 px-3 py-2" {...props} />
                                            ),
                                            // Style lists
                                            ul: ({ node, ...props }) => (
                                                <ul className="list-disc list-inside my-2 space-y-1" {...props} />
                                            ),
                                            ol: ({ node, ...props }) => (
                                                <ol className="list-decimal list-inside my-2 space-y-1" {...props} />
                                            ),
                                            // Style headings
                                            h1: ({ node, ...props }) => (
                                                <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />
                                            ),
                                            h2: ({ node, ...props }) => (
                                                <h2 className="text-xl font-bold mt-3 mb-2" {...props} />
                                            ),
                                            h3: ({ node, ...props }) => (
                                                <h3 className="text-lg font-semibold mt-2 mb-1" {...props} />
                                            ),
                                            // Style paragraphs
                                            p: ({ node, ...props }) => (
                                                <p className="my-2" {...props} />
                                            ),
                                            // Style strong/bold
                                            strong: ({ node, ...props }) => (
                                                <strong className="font-bold text-purple-300" {...props} />
                                            ),
                                            // Style code blocks
                                            code: ({ node, inline, ...props }: any) =>
                                                inline ? (
                                                    <code className="bg-gray-700 px-1.5 py-0.5 rounded text-sm" {...props} />
                                                ) : (
                                                    <code className="block bg-gray-900 p-3 rounded my-2 overflow-x-auto" {...props} />
                                                ),
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                                <div className="flex items-center gap-2 mt-2 text-[10px] opacity-60 uppercase tracking-wider">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start animate-in fade-in duration-300">
                        <div className="flex items-start gap-3 max-w-2xl">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                                <Sparkles className="h-4 w-4 text-white" />
                            </div>
                            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 flex items-center gap-3">
                                <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                                <span className="text-sm text-gray-300">Thinking...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </main>

            <footer className="px-6 py-4 bg-gray-800/80 backdrop-blur-md border-t border-gray-700 space-y-3">
                {/* Quick Actions */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {quickActions.map((action, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSend(action.prompt)}
                            disabled={loading}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-full text-xs text-gray-200 transition-colors whitespace-nowrap"
                        >
                            {action.icon}
                            {action.label}
                        </button>
                    ))}
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Ask me anything..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                            className="w-full rounded-xl bg-gray-900 border border-gray-700 pl-4 pr-12 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                        <button
                            type="button"
                            onClick={startListening}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                            title="Voice Input"
                        >
                            <Mic className="h-4 w-4" />
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white font-medium transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Send className="h-5 w-5" />
                        )}
                    </button>
                </form>
            </footer>
        </div>
    );
}
