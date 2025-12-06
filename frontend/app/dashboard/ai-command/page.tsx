'use client';

import { useState, useRef, useEffect } from 'react';
import { useAICommand } from '@/hooks/useAICommand';
import { useVoice } from '@/hooks/useVoice';
import { LoadingSpinner } from '@/components/LoadingStates';
import { ErrorAlert } from '@/components/ErrorStates';
import { Terminal, Send, Sparkles, User, Bot, Trash2, ArrowRight, MessageSquare, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AICommandPage() {
    const { data: commandHistory, loading, error, executeCommand, setData } = useAICommand();
    const { isListening, transcript, startListening, stopListening, speak, cancelSpeech, isSupported } = useVoice();
    const [command, setCommand] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [commandHistory, loading]);

    // Add useSearchParams
    const searchParams = require('next/navigation').useSearchParams();
    const initialQuery = searchParams.get('q');
    const hasExecutedRef = useRef(false);

    // Auto-execute query from URL
    useEffect(() => {
        if (initialQuery && !hasExecutedRef.current) {
            hasExecutedRef.current = true;
            handleExecute(initialQuery);
            // Optional: Clear the query param so it doesn't re-run on refresh
            // router.replace('/dashboard/ai-command', undefined, { shallow: true });
        }
    }, [initialQuery]);

    // Update command input with voice transcript
    useEffect(() => {
        if (transcript) {
            setCommand(transcript);
        }
    }, [transcript]);

    // Speak AI response when new message arrives
    useEffect(() => {
        if (!isMuted && commandHistory && commandHistory.length > 0) {
            const lastMsg = commandHistory[commandHistory.length - 1];
            // Only speak if it's a recent message (within last 2 seconds) to avoid speaking on load
            const msgTime = new Date(lastMsg.timestamp).getTime();
            if (Date.now() - msgTime < 2000) {
                speak(lastMsg.response);
            }
        }
    }, [commandHistory, isMuted, speak]);

    const handleExecute = async (cmdOverride?: string) => {
        const cmdToRun = cmdOverride || command;
        if (cmdToRun.trim()) {
            cancelSpeech(); // Stop speaking if user interrupts

            // Optimistic Update: Show user message immediately
            const optimisticMsg = {
                command: cmdToRun,
                response: "...", // Placeholder
                timestamp: new Date().toISOString()
            };

            // We need to manually update the local state if useAICommand exposes a setter or we manage it here.
            // Since useAICommand manages state, we rely on it. 
            // For now, we'll clear the input immediately.
            setData(prev => [...(prev || []), optimisticMsg]);
            setCommand('');

            await executeCommand(cmdToRun);
        }
    };

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const suggestedCommands = [
        "Show me low stock items",
        "Check active routes",
        "Analyze recent anomalies",
        "What is today's revenue?"
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-900 text-gray-100">
            {/* Header */}
            <div className="p-6 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-violet-400" />
                            AI Command Center
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">Powered by Gemini • Ask anything about your supply chain</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                setIsMuted(!isMuted);
                                cancelSpeech();
                            }}
                            className={`p-2 rounded-full transition-colors ${isMuted ? 'bg-gray-800 text-gray-400' : 'bg-violet-900/30 text-violet-400'}`}
                            title={isMuted ? "Unmute AI Voice" : "Mute AI Voice"}
                        >
                            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {error && <ErrorAlert message={error} />}

                {(!commandHistory || commandHistory.length === 0) && (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                        <Bot className="h-16 w-16 text-violet-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">How can I help you today?</h3>
                        <p className="max-w-md">I can analyze inventory, track shipments, detect anomalies, and summarize reports.</p>
                    </div>
                )}

                {commandHistory?.map((msg, idx) => (
                    <div key={idx} className="space-y-4">
                        {/* User Message */}
                        <div className="flex justify-end">
                            <div className="flex items-end gap-2 max-w-[80%] flex-row-reverse">
                                <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 border border-gray-600">
                                    <User className="h-4 w-4 text-gray-300" />
                                </div>
                                <div className="bg-violet-600 text-white px-5 py-3 rounded-2xl rounded-tr-none shadow-lg">
                                    <p className="text-sm leading-relaxed">{msg.command}</p>
                                </div>
                            </div>
                        </div>

                        {/* AI Response */}
                        {/* Only show response if it's not the optimistic placeholder "..." OR if we want to show a loading state differently */}
                        {msg.response !== "..." && (
                            <div className="flex justify-start">
                                <div className="flex items-end gap-2 max-w-[90%]">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-900/20 ring-2 ring-violet-500/20">
                                        <Sparkles className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="bg-gray-800/90 backdrop-blur-md border border-gray-700/50 text-gray-100 px-6 py-5 rounded-2xl rounded-tl-none shadow-xl">
                                        <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-violet-200 prose-strong:text-violet-300 prose-a:text-violet-400">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    // Custom Table Styling
                                                    table: ({ node, ...props }) => (
                                                        <div className="overflow-x-auto my-4 rounded-xl border border-gray-700/50 shadow-lg bg-gray-900/50">
                                                            <table className="w-full border-collapse text-sm" {...props} />
                                                        </div>
                                                    ),
                                                    thead: ({ node, ...props }) => (
                                                        <thead className="bg-violet-900/20 text-violet-100 uppercase tracking-wider font-semibold" {...props} />
                                                    ),
                                                    tbody: ({ node, ...props }) => (
                                                        <tbody className="divide-y divide-gray-700/50" {...props} />
                                                    ),
                                                    tr: ({ node, ...props }) => (
                                                        <tr className="hover:bg-violet-900/10 transition-colors" {...props} />
                                                    ),
                                                    th: ({ node, ...props }) => (
                                                        <th className="px-4 py-3 text-left text-xs font-bold text-violet-300 uppercase tracking-wider" {...props} />
                                                    ),
                                                    td: ({ node, ...props }) => (
                                                        <td className="px-4 py-3 whitespace-nowrap text-gray-300" {...props} />
                                                    ),
                                                    // Custom Code Styling
                                                    code: ({ node, inline, className, children, ...props }: any) => {
                                                        return inline ? (
                                                            <code className="bg-gray-900/80 px-1.5 py-0.5 rounded text-violet-300 font-mono text-xs border border-gray-700/50" {...props}>
                                                                {children}
                                                            </code>
                                                        ) : (
                                                            <div className="relative group">
                                                                <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                                                                <pre className="relative bg-gray-950 rounded-lg p-4 overflow-x-auto border border-gray-800 text-gray-300 text-xs font-mono shadow-inner">
                                                                    <code {...props}>{children}</code>
                                                                </pre>
                                                            </div>
                                                        )
                                                    },
                                                    // Custom List Styling
                                                    ul: ({ node, ...props }) => (
                                                        <ul className="list-none space-y-2 my-2 pl-0" {...props} />
                                                    ),
                                                    li: ({ node, ...props }) => (
                                                        <li className="flex items-start gap-2 text-gray-300">
                                                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-violet-500 flex-shrink-0" />
                                                            <span className="flex-1">{props.children}</span>
                                                        </li>
                                                    ),
                                                    // Paragraph Styling
                                                    p: ({ node, ...props }) => (
                                                        <p className="mb-3 last:mb-0" {...props} />
                                                    ),
                                                }}
                                            >
                                                {msg.response}
                                            </ReactMarkdown>
                                        </div>
                                        <p className="text-[10px] text-gray-500 mt-3 text-right font-medium flex items-center justify-end gap-1">
                                            <span>AI Generated</span>
                                            <span className="w-1 h-1 rounded-full bg-violet-500"></span>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="flex items-end gap-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-900/20">
                                <Sparkles className="h-4 w-4 text-white animate-pulse" />
                            </div>
                            <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 px-4 py-3 rounded-2xl rounded-tl-none shadow-lg flex items-center gap-1">
                                <span className="text-xs text-gray-400 mr-2 font-medium">Warefy AI is typing</span>
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-gray-900 border-t border-gray-800">
                {/* Suggested Commands */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                    {suggestedCommands.map((cmd, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleExecute(cmd)}
                            className="whitespace-nowrap px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-full text-xs text-violet-300 transition-colors"
                        >
                            {cmd}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2 max-w-4xl mx-auto">
                    {isSupported && (
                        <button
                            onClick={toggleListening}
                            className={`px-4 py-3 rounded-xl transition-all flex items-center justify-center shadow-lg ${isListening
                                ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse'
                                : 'bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400'
                                }`}
                            title={isListening ? "Stop Listening" : "Start Voice Input"}
                        >
                            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                        </button>
                    )}

                    <input
                        type="text"
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleExecute()}
                        placeholder={isListening ? "Listening..." : "Ask Warefy AI..."}
                        disabled={loading}
                        className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-100 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none placeholder-gray-500 disabled:opacity-50"
                    />
                    <button
                        onClick={() => handleExecute()}
                        disabled={!command.trim() || loading}
                        className="px-4 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-xl transition-all flex items-center justify-center shadow-lg shadow-violet-900/20"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
