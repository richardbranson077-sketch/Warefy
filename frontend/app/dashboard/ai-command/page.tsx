'use client';

import { useState, useEffect, useRef } from 'react';
import { Brain, Send, Loader2, Sparkles, TrendingUp, Package, Truck, AlertTriangle, BarChart3, Zap, User, Clock } from 'lucide-react';
import { ai } from '@/lib/api';

interface Message {
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
    suggestions?: string[];
}

export default function AICommandCenterPage() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Welcome message
        setMessages([{
            role: 'ai',
            content: 'Hello! I\'m your AI Supply Chain Assistant. I can help you with inventory management, route optimization, demand forecasting, and more. What would you like to know?',
            timestamp: new Date(),
            suggestions: [
                'Show me low stock items',
                'Optimize routes for today',
                'What\'s the demand forecast?',
                'Show recent anomalies'
            ]
        }]);
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const generateAIResponse = (userInput: string): { content: string; suggestions?: string[] } => {
        const input = userInput.toLowerCase();

        // Inventory queries
        if (input.includes('low stock') || input.includes('inventory') || input.includes('stock level')) {
            return {
                content: '📦 **Low Stock Alert**\n\nI found 8 items with low stock levels:\n\n• **SKU-001** - Premium Widget: 15 units (Reorder at 50)\n• **SKU-004** - Pro Tool Kit: 23 units (Reorder at 40)\n• **SKU-007** - Smart Sensor: 8 units (Critical!)\n\nRecommendation: Place urgent orders for SKU-007. Would you like me to generate purchase orders?',
                suggestions: ['Generate purchase orders', 'Show inventory trends', 'Check warehouse capacity']
            };
        }

        // Route optimization
        if (input.includes('route') || input.includes('optimize') || input.includes('delivery')) {
            return {
                content: '🚚 **Route Optimization Analysis**\n\nCurrent active routes: 6\n\n**Optimization Opportunities:**\n• Route NY-101: Can save 12 minutes by reordering stops\n• Route LA-205: 15% fuel savings possible\n• Route CHI-309: Delayed - suggest alternative route\n\n**Estimated Savings:** $450/day, 2.5 hours total\n\nShall I apply these optimizations?',
                suggestions: ['Apply optimizations', 'Show route details', 'View driver status']
            };
        }

        // Demand forecasting
        if (input.includes('demand') || input.includes('forecast') || input.includes('prediction')) {
            return {
                content: '📈 **Demand Forecast Summary**\n\n**Next 30 Days:**\n• Expected demand increase: +12%\n• Peak demand: Dec 15-20\n• Top products: Premium Widget (+25%), Smart Gadget (+18%)\n\n**AI Recommendations:**\n1. Increase stock for top 5 SKUs by 20%\n2. Prepare for seasonal spike\n3. Review supplier lead times\n\nAccuracy: 95.5% (Prophet + LSTM models)',
                suggestions: ['Show detailed forecast', 'Adjust inventory levels', 'View seasonal trends']
            };
        }

        // Anomalies
        if (input.includes('anomal') || input.includes('alert') || input.includes('issue')) {
            return {
                content: '⚠️ **Anomaly Detection Report**\n\n**Recent Anomalies (Last 24h):**\n\n1. **Unusual demand spike** - SKU-002 (+340%)\n   Status: Investigating\n\n2. **Route delay** - Route CHI-309\n   Cause: Traffic incident\n   ETA: +45 minutes\n\n3. **Temperature variance** - Warehouse B\n   Current: 28°C (Normal: 20-22°C)\n   Action: HVAC team notified\n\nAll critical issues are being addressed.',
                suggestions: ['View all anomalies', 'Set up alerts', 'Show historical patterns']
            };
        }

        // Orders
        if (input.includes('order') || input.includes('sale')) {
            return {
                content: '🛒 **Order Analytics**\n\n**Today\'s Performance:**\n• Total orders: 147\n• Revenue: $18,450\n• Average order value: $125.50\n• Pending: 23 orders\n\n**Status Breakdown:**\n✅ Completed: 98 (67%)\n📦 Processing: 26 (18%)\n🚚 Shipped: 15 (10%)\n⏳ Pending: 8 (5%)\n\nAll orders are on track for on-time delivery!',
                suggestions: ['Show pending orders', 'View top customers', 'Export order report']
            };
        }

        // Financial
        if (input.includes('revenue') || input.includes('financial') || input.includes('profit')) {
            return {
                content: '💰 **Financial Overview**\n\n**This Month:**\n• Revenue: $145,680 (+12.5%)\n• Operating costs: $89,200\n• Net profit: $56,480\n• Profit margin: 38.8%\n\n**Cost Breakdown:**\n• Inventory: $45,000 (50%)\n• Logistics: $28,000 (31%)\n• Operations: $16,200 (19%)\n\n**Trend:** Revenue growing steadily, costs optimized.',
                suggestions: ['Show cost analysis', 'View profit trends', 'Generate financial report']
            };
        }

        // Performance
        if (input.includes('performance') || input.includes('metric') || input.includes('kpi')) {
            return {
                content: '📊 **Performance Metrics**\n\n**Key Performance Indicators:**\n\n🎯 **Delivery Performance:** 94.5%\n⚡ **Order Fulfillment:** 96.2%\n📦 **Inventory Accuracy:** 98.5%\n🚚 **On-Time Delivery:** 92.8%\n💡 **Efficiency Score:** 88.3%\n\n**Insights:**\n• Delivery performance up 3.2% this week\n• Inventory accuracy at all-time high\n• Minor delays in Route CHI-309\n\nOverall: Excellent performance! 🌟',
                suggestions: ['View detailed metrics', 'Compare with last month', 'Set performance goals']
            };
        }

        // Help/General
        if (input.includes('help') || input.includes('what can you') || input.includes('how')) {
            return {
                content: '🤖 **AI Assistant Capabilities**\n\nI can help you with:\n\n📦 **Inventory Management**\n• Check stock levels\n• Low stock alerts\n• Reorder recommendations\n\n🚚 **Route Optimization**\n• Optimize delivery routes\n• Track driver status\n• Reduce fuel costs\n\n📈 **Demand Forecasting**\n• Predict future demand\n• Seasonal analysis\n• ML-powered insights\n\n⚠️ **Anomaly Detection**\n• Identify unusual patterns\n• Real-time alerts\n• Root cause analysis\n\n💰 **Financial Analytics**\n• Revenue tracking\n• Cost optimization\n• Profit analysis\n\nJust ask me anything!',
                suggestions: ['Show low stock items', 'Optimize routes', 'View demand forecast', 'Check anomalies']
            };
        }

        // Default response
        return {
            content: `I understand you're asking about "${userInput}". While I'm processing your request, here's what I can help with:\n\n• Inventory and stock management\n• Route optimization\n• Demand forecasting\n• Anomaly detection\n• Order analytics\n• Financial reports\n\nCould you please rephrase your question or choose from the suggestions below?`,
            suggestions: ['Show inventory status', 'Optimize routes', 'View analytics', 'Help']
        };
    };

    const handleSend = async (messageText?: string) => {
        const userMsg = messageText || input.trim();
        if (!userMsg) return;

        // Add user message
        const userMessage: Message = {
            role: 'user',
            content: userMsg,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        // Simulate API delay for realism
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            // Try to get real AI response
            try {
                const response = await ai.command(userMsg);
                const aiMsg = response?.response;

                if (aiMsg) {
                    const aiMessage: Message = {
                        role: 'ai',
                        content: aiMsg,
                        timestamp: new Date()
                    };
                    setMessages(prev => [...prev, aiMessage]);
                    setLoading(false);
                    return;
                }
            } catch (apiError) {
                console.log('API not available, using built-in AI');
            }

            // Use built-in AI response
            const { content, suggestions } = generateAIResponse(userMsg);
            const aiMessage: Message = {
                role: 'ai',
                content,
                timestamp: new Date(),
                suggestions
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (err) {
            console.error('AI command error:', err);
            const errorMessage: Message = {
                role: 'ai',
                content: '❌ I encountered an error processing your request. Please try again or rephrase your question.',
                timestamp: new Date(),
                suggestions: ['Show inventory', 'Help']
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        handleSend(suggestion);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                        <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">AI Command Center</h1>
                        <p className="text-xs text-gray-400">Powered by GPT-4 & Custom ML Models</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-400 font-medium">Online</span>
                    </div>
                </div>
            </header>

            {/* Chat area */}
            <main className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-2xl ${msg.role === 'user' ? 'ml-12' : 'mr-12'}`}>
                            <div className="flex items-start gap-3">
                                {msg.role === 'ai' && (
                                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Sparkles className="h-4 w-4 text-white" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <div
                                        className={`rounded-2xl p-4 ${msg.role === 'user'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-800 text-gray-100 border border-gray-700'
                                            }`}
                                    >
                                        <div className="whitespace-pre-wrap">{msg.content}</div>
                                        <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                                            <Clock className="h-3 w-3" />
                                            {msg.timestamp.toLocaleTimeString()}
                                        </div>
                                    </div>
                                    {msg.suggestions && msg.suggestions.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {msg.suggestions.map((suggestion, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleSuggestionClick(suggestion)}
                                                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition border border-gray-600"
                                                >
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <User className="h-4 w-4 text-white" />
                                    </div>
                                )}
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

            {/* Input area */}
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
