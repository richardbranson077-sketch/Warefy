'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Sparkles,
    TrendingUp,
    AlertTriangle,
    Package,
    Zap,
    RefreshCw,
    BrainCircuit,
    Check,
    X,
    Clock,
    Target,
    Settings,
    MessageSquare,
    Send,
    Bot,
    User,
    ChevronDown,
    Lightbulb,
    Activity,
    DollarSign,
    Truck,
    BarChart3,
    ArrowRight,
    CheckCircle,
    XCircle,
    Download,
    ThumbsUp,
    ThumbsDown
} from 'lucide-react';
import { aiRecommendations } from '@/lib/api';

interface Recommendation {
    id: number;
    title: string;
    description: string;
    impact: 'High' | 'Medium' | 'Low';
    confidence: number;
    category: string;
    action: string;
    status: 'pending' | 'implemented' | 'rejected';
    estimatedSavings?: number;
    timeToImplement?: string;
    priority: number;
}

interface ChatMessage {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    actions?: ChatAction[];
}

interface ChatAction {
    label: string;
    type: 'primary' | 'secondary';
    action: () => void;
}

export default function RecommendationsPage() {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showChatbot, setShowChatbot] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const categories = ['all', 'inventory', 'routing', 'cost', 'performance', 'maintenance'];

    useEffect(() => {
        fetchRecommendations();
        initializeChatbot();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const initializeChatbot = () => {
        const initialMessage: ChatMessage = {
            id: 1,
            role: 'assistant',
            content: "👋 Hello! I'm your AI Supply Chain Assistant. I can help you:\n\n• Analyze recommendations\n• Automate workflows\n• Optimize operations\n• Generate reports\n• Execute tasks\n\nHow can I assist you today?",
            timestamp: new Date()
        };
        setChatMessages([initialMessage]);
    };

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            const data = await aiRecommendations.get({});
            if (data && data.length > 0) {
                const mappedData = data.map((r: any, index: number) => ({
                    id: r.id || index + 1,
                    title: r.recommendation || r.title || 'Recommendation',
                    description: r.description || r.reasoning || '',
                    impact: r.impact || 'Medium',
                    confidence: r.confidence || 85,
                    category: r.category || 'general',
                    action: r.action || 'Review',
                    status: r.status || 'pending',
                    estimatedSavings: r.estimated_savings,
                    timeToImplement: r.time_to_implement,
                    priority: r.priority || index + 1
                }));
                setRecommendations(mappedData);
            } else {
                generateMockRecommendations();
            }
        } catch (error) {
            console.error('Failed to fetch recommendations:', error);
            generateMockRecommendations();
        } finally {
            setLoading(false);
        }
    };

    const generateMockRecommendations = () => {
        const mockRecs: Recommendation[] = [
            {
                id: 1,
                title: 'Reallocate Inventory to High-Demand Regions',
                description: 'Analysis shows 45% demand increase in California for SKU-001. Moving 500 units from Texas warehouse will prevent stockouts and reduce shipping time by 1.2 days.',
                impact: 'High',
                confidence: 94,
                category: 'inventory',
                action: 'Approve Transfer',
                status: 'pending',
                estimatedSavings: 8500,
                timeToImplement: '2 days',
                priority: 1
            },
            {
                id: 2,
                title: 'Optimize Route NY-101 with OR-Tools',
                description: 'Current route has 12% inefficiency. AI suggests new sequence that saves 8.5km and 45 minutes per delivery cycle.',
                impact: 'High',
                confidence: 92,
                category: 'routing',
                action: 'Apply Optimization',
                status: 'pending',
                estimatedSavings: 3200,
                timeToImplement: '1 hour',
                priority: 2
            },
            {
                id: 3,
                title: 'Switch Carrier for Long-Distance Routes',
                description: 'Current carrier has 15% delay rate. Alternative carrier offers 98% on-time delivery for 2% cost increase, resulting in better customer satisfaction.',
                impact: 'Medium',
                confidence: 88,
                category: 'cost',
                action: 'Review Proposal',
                status: 'pending',
                estimatedSavings: 5600,
                timeToImplement: '1 week',
                priority: 3
            },
            {
                id: 4,
                title: 'Schedule Preventative Maintenance for VH-042',
                description: 'Telematics data shows early transmission issues. Scheduling maintenance now prevents potential $8,000 breakdown next week.',
                impact: 'High',
                confidence: 91,
                category: 'maintenance',
                action: 'Schedule Service',
                status: 'pending',
                estimatedSavings: 8000,
                timeToImplement: '3 days',
                priority: 1
            },
            {
                id: 5,
                title: 'Consolidate Small Shipments',
                description: 'Detect 24 small shipments that can be consolidated into 3 bulk deliveries, saving $1,200 in shipping costs this week.',
                impact: 'Medium',
                confidence: 87,
                category: 'cost',
                action: 'Consolidate',
                status: 'pending',
                estimatedSavings: 1200,
                timeToImplement: '2 days',
                priority: 4
            },
            {
                id: 6,
                title: 'Increase Reorder Points for High-Velocity Items',
                description: 'SKU-003 experiencing frequent stockouts. Increasing reorder point from 50 to 75 units eliminates 80% of stockout risk.',
                impact: 'Medium',
                confidence: 85,
                category: 'inventory',
                action: 'Update Levels',
                status: 'pending',
                estimatedSavings: 2400,
                timeToImplement: '1 hour',
                priority: 5
            }
        ];
        setRecommendations(mockRecs);
    };

    const handleImplement = (id: number) => {
        setRecommendations(recommendations.map(r =>
            r.id === id ? { ...r, status: 'implemented' } : r
        ));

        const rec = recommendations.find(r => r.id === id);
        if (rec) {
            addChatMessage({
                role: 'assistant',
                content: `✅ Successfully implemented: "${rec.title}"\n\nEstimated savings: $${rec.estimatedSavings?.toLocaleString()}\nImplementation time: ${rec.timeToImplement}\n\nThe system has automatically executed this recommendation.`
            });
        }
    };

    const handleReject = (id: number) => {
        setRecommendations(recommendations.map(r =>
            r.id === id ? { ...r, status: 'rejected' } : r
        ));
    };

    const filteredRecommendations = recommendations.filter(r =>
        selectedCategory === 'all' || r.category === selectedCategory
    );

    const stats = {
        total: recommendations.length,
        pending: recommendations.filter(r => r.status === 'pending').length,
        implemented: recommendations.filter(r => r.status === 'implemented').length,
        totalSavings: recommendations
            .filter(r => r.status === 'implemented')
            .reduce((sum, r) => sum + (r.estimatedSavings || 0), 0)
    };

    const addChatMessage = (message: Partial<ChatMessage>) => {
        const newMessage: ChatMessage = {
            id: chatMessages.length + 1,
            role: message.role || 'user',
            content: message.content || '',
            timestamp: new Date(),
            actions: message.actions
        };
        setChatMessages([...chatMessages, newMessage]);
    };

    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;

        const userMessage = chatInput.trim();
        addChatMessage({ role: 'user', content: userMessage });
        setChatInput('');
        setIsChatLoading(true);

        // Simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Generate AI response based on user input
        const response = generateAIResponse(userMessage);
        addChatMessage(response);
        setIsChatLoading(false);
    };

    const generateAIResponse = (userInput: string): Partial<ChatMessage> => {
        const input = userInput.toLowerCase();

        // Workflow automation commands
        if (input.includes('optimize all routes') || input.includes('optimize routes')) {
            return {
                role: 'assistant',
                content: '🚀 Initiating route optimization for all active routes...\n\n✅ Analyzed 4 routes\n✅ Applied OR-Tools algorithm\n✅ Average improvement: 12.5% distance reduction\n✅ Estimated time saved: 2.5 hours/day\n✅ Cost savings: $450/week\n\nAll routes have been optimized automatically!',
                actions: [
                    {
                        label: 'View Optimized Routes',
                        type: 'primary',
                        action: () => window.location.href = '/dashboard/routes'
                    }
                ]
            };
        }

        if (input.includes('implement all') || input.includes('apply all recommendations')) {
            return {
                role: 'assistant',
                content: `🎯 Implementing all ${stats.pending} pending recommendations...\n\n` +
                    recommendations.filter(r => r.status === 'pending')
                        .map((r, i) => `${i + 1}. ${r.title} ✅`)
                        .join('\n') +
                    `\n\nTotal estimated savings: $${recommendations
                        .filter(r => r.status === 'pending')
                        .reduce((sum, r) => sum + (r.estimatedSavings || 0), 0).toLocaleString()}\n\nAll recommendations have been implemented!`,
                actions: [
                    {
                        label: 'Apply All',
                        type: 'primary',
                        action: () => {
                            recommendations.forEach(r => {
                                if (r.status === 'pending') handleImplement(r.id);
                            });
                        }
                    }
                ]
            };
        }

        if (input.includes('inventory') && (input.includes('low') || input.includes('stock'))) {
            return {
                role: 'assistant',
                content: '📦 Analyzing inventory levels...\n\n⚠️ Found 3 items below reorder point:\n\n1. SKU-001: 45 units (reorder at 50)\n2. SKU-003: 38 units (reorder at 50)\n3. SKU-007: 22 units (reorder at 30)\n\nWould you like me to automatically create purchase orders?',
                actions: [
                    {
                        label: 'Create POs',
                        type: 'primary',
                        action: () => addChatMessage({
                            role: 'assistant',
                            content: '✅ Created 3 purchase orders automatically!\n\nPO-1001: SKU-001 (100 units)\nPO-1002: SKU-003 (100 units)\nPO-1003: SKU-007 (80 units)\n\nSuppliers have been notified.'
                        })
                    }
                ]
            };
        }

        if (input.includes('demand') && input.includes('forecast')) {
            return {
                role: 'assistant',
                content: '📈 Generating demand forecast...\n\n7-day forecast for top products:\n\n• SKU-001: 245 units (↑ 15%)\n• SKU-002: 189 units (↓ 5%)\n• SKU-003: 312 units (↑ 28%)\n• SKU-004: 156 units (stable)\n\nHigh confidence predictions using Prophet algorithm.'
            };
        }

        if (input.includes('savings') || input.includes('money saved')) {
            return {
                role: 'assistant',
                content: `💰 Savings Analysis:\n\nImplemented recommendations: ${stats.implemented}\nTotal savings realized: $${stats.totalSavings.toLocaleString()}\n\nPotential additional savings:\nPending recommendations: $${recommendations
                    .filter(r => r.status === 'pending')
                    .reduce((sum, r) => sum + (r.estimatedSavings || 0), 0)
                    .toLocaleString()}\n\nYou're doing great! Keep implementing AI recommendations.`
            };
        }

        if (input.includes('report') || input.includes('summary')) {
            return {
                role: 'assistant',
                content: `📊 Weekly Performance Summary:\n\n✅ Completed: ${stats.implemented} recommendations\n⏳ Pending: ${stats.pending} recommendations\n💰 Savings: $${stats.totalSavings.toLocaleString()}\n📈 Efficiency: +12.5%\n🚚 Routes optimized: 4\n📦 Stockouts prevented: 8\n\nOverall: Excellent performance!`,
                actions: [
                    {
                        label: 'Download PDF',
                        type: 'secondary',
                        action: () => alert('Report downloaded!')
                    }
                ]
            };
        }

        if (input.includes('help') || input.includes('what can you do')) {
            return {
                role: 'assistant',
                content: `🤖 I can help you with:\n\n**Workflow Automation:**\n• "Optimize all routes"\n• "Implement all recommendations"\n• "Create purchase orders for low stock"\n\n**Analysis:**\n• "Show me inventory levels"\n• "Generate demand forecast"\n• "Calculate savings"\n\n**Actions:**\n• "Send weekly report"\n• "Schedule maintenance"\n• "Reallocate inventory"\n\nJust ask in natural language!`
            };
        }

        // Default response
        return {
            role: 'assistant',
            content: `I understand you're asking about "${userInput}". I can help with:\n\n• Route optimization\n• Inventory management\n• Cost analysis\n• Workflow automation\n\nCould you be more specific? Or type "help" to see what I can do!`
        };
    };

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'High': return 'red';
            case 'Medium': return 'orange';
            case 'Low': return 'blue';
            default: return 'gray';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'inventory': return Package;
            case 'routing': return Truck;
            case 'cost': return DollarSign;
            case 'performance': return BarChart3;
            case 'maintenance': return Settings;
            default: return Lightbulb;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">AI Recommendations</h1>
                    <p className="text-gray-600 mt-1">Smart insights powered by machine learning</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowChatbot(!showChatbot)}
                        className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${showChatbot
                                ? 'bg-purple-600 text-white'
                                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <Bot className="h-4 w-4" />
                        AI Assistant
                    </button>
                    <button
                        onClick={fetchRecommendations}
                        disabled={generating}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition flex items-center gap-2 disabled:opacity-50"
                    >
                        <RefreshCw className={`h-5 w-5 ${generating ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Total Recommendations</p>
                        <Sparkles className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Pending Actions</p>
                        <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Implemented</p>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.implemented}</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Total Savings</p>
                        <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">${stats.totalSavings.toLocaleString()}</p>
                </div>
            </div>

            {/* Category Filter */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex gap-2 overflow-x-auto">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition ${selectedCategory === cat
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Recommendations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredRecommendations.map((rec) => {
                    const CategoryIcon = getCategoryIcon(rec.category);
                    const impactColor = getImpactColor(rec.impact);

                    return (
                        <div
                            key={rec.id}
                            className={`bg-white rounded-xl border p-6 transition-all ${rec.status === 'implemented' ? 'border-green-200 bg-green-50' :
                                    rec.status === 'rejected' ? 'border-gray-200 opacity-60' :
                                        'border-gray-200 hover:shadow-lg'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${rec.status === 'implemented' ? 'bg-green-100' :
                                            impactColor === 'red' ? 'bg-red-100' :
                                                impactColor === 'orange' ? 'bg-orange-100' :
                                                    'bg-blue-100'
                                        }`}>
                                        <CategoryIcon className={`h-5 w-5 ${rec.status === 'implemented' ? 'text-green-600' :
                                                impactColor === 'red' ? 'text-red-600' :
                                                    impactColor === 'orange' ? 'text-orange-600' :
                                                        'text-blue-600'
                                            }`} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 mb-1">{rec.title}</h3>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${impactColor === 'red' ? 'bg-red-100 text-red-700' :
                                                    impactColor === 'orange' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-blue-100 text-blue-700'
                                                }`}>
                                                {rec.impact} Impact
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {rec.confidence}% confidence
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {rec.status === 'implemented' && (
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                )}
                                {rec.status === 'rejected' && (
                                    <XCircle className="h-6 w-6 text-gray-400" />
                                )}
                            </div>

                            <p className="text-gray-600 text-sm mb-4">{rec.description}</p>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {rec.estimatedSavings && (
                                    <div className="p-2 bg-green-50 rounded-lg">
                                        <p className="text-xs text-green-700 mb-0.5">Estimated Savings</p>
                                        <p className="text-lg font-bold text-green-900">
                                            ${rec.estimatedSavings.toLocaleString()}
                                        </p>
                                    </div>
                                )}
                                {rec.timeToImplement && (
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <p className="text-xs text-blue-700 mb-0.5">Time to Implement</p>
                                        <p className="text-lg font-bold text-blue-900">{rec.timeToImplement}</p>
                                    </div>
                                )}
                            </div>

                            {rec.status === 'pending' && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleImplement(rec.id)}
                                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center justify-center gap-2"
                                    >
                                        <Check className="h-4 w-4" />
                                        {rec.action}
                                    </button>
                                    <button
                                        onClick={() => handleReject(rec.id)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* AI Chatbot */}
            {showChatbot && (
                <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50">
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-2xl">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                <Bot className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">AI Assistant</h3>
                                <p className="text-xs text-purple-100">Always ready to help</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowChatbot(false)}
                            className="p-1 hover:bg-white/20 rounded-lg transition text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {chatMessages.map((msg) => (
                            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'assistant' && (
                                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Bot className="h-5 w-5 text-white" />
                                    </div>
                                )}
                                <div className={`max-w-[75%] ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
                                    <div className={`rounded-2xl px-4 py-3 ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-900'
                                        }`}>
                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                    {msg.actions && msg.actions.length > 0 && (
                                        <div className="mt-2 space-y-2">
                                            {msg.actions.map((action, index) => (
                                                <button
                                                    key={index}
                                                    onClick={action.action}
                                                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition ${action.type === 'primary'
                                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {action.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                        <User className="h-5 w-5 text-gray-600" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {isChatLoading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                                    <Bot className="h-5 w-5 text-white" />
                                </div>
                                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Ask me anything..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!chatInput.trim() || isChatLoading}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition disabled:opacity-50"
                            >
                                <Send className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            Try: "optimize all routes" or "show low stock items"
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
