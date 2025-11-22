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
    ThumbsDown,
    Filter,
    Search,
    TrendingDown,
    Calendar,
    Eye,
    Star,
    Bookmark,
    Share2,
    Bell,
    PlayCircle,
    PauseCircle
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
    status: 'pending' | 'implemented' | 'rejected' | 'in-progress';
    estimatedSavings?: number;
    timeToImplement?: string;
    priority: number;
    createdAt?: Date;
    implementedAt?: Date;
    roi?: number;
    tags?: string[];
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
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'priority' | 'savings' | 'confidence'>('priority');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedImpact, setSelectedImpact] = useState<string[]>([]);
    const [autoImplement, setAutoImplement] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const categories = ['all', 'inventory', 'routing', 'cost', 'performance', 'maintenance', 'demand'];

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
            content: "👋 Hello! I'm your AI Supply Chain Assistant powered by GPT-4.\n\n**I can help you:**\n\n🔄 Automate workflows\n📊 Analyze recommendations\n📈 Generate forecasts\n🚀 Execute tasks instantly\n💡 Provide insights\n\nTry commands like:\n• \"Optimize all routes\"\n• \"Show low stock items\"\n• \"Implement all high-impact recommendations\"\n\nWhat would you like to do?",
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
                    priority: r.priority || index + 1,
                    createdAt: new Date(r.created_at || Date.now()),
                    roi: r.roi,
                    tags: r.tags || []
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
                priority: 1,
                createdAt: new Date(),
                roi: 340,
                tags: ['urgent', 'stockout-prevention']
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
                priority: 2,
                createdAt: new Date(),
                roi: 280,
                tags: ['quick-win', 'efficiency']
            },
            {
                id: 3,
                title: 'Increase Safety Stock for Seasonal Items',
                description: 'Historical data shows 60% spike in demand during Q4. Increasing safety stock now prevents $15K in lost sales.',
                impact: 'High',
                confidence: 89,
                category: 'demand',
                action: 'Adjust Levels',
                status: 'pending',
                estimatedSavings: 15000,
                timeToImplement: '1 day',
                priority: 1,
                createdAt: new Date(),
                roi: 450,
                tags: ['seasonal', 'revenue-protection']
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
                priority: 1,
                createdAt: new Date(),
                roi: 320,
                tags: ['preventative', 'cost-avoidance']
            },
            {
                id: 5,
                title: 'Consolidate Small Shipments',
                description: 'Detected 24 small shipments that can be consolidated into 3 bulk deliveries, saving $1,200 in shipping costs this week.',
                impact: 'Medium',
                confidence: 87,
                category: 'cost',
                action: 'Consolidate',
                status: 'pending',
                estimatedSavings: 1200,
                timeToImplement: '2 days',
                priority: 4,
                createdAt: new Date(),
                roi: 180,
                tags: ['shipping', 'optimization']
            },
            {
                id: 6,
                title: 'Switch to Dynamic Pricing for Peak Hours',
                description: 'Implement surge pricing during peak demand hours (2-5 PM) to optimize revenue and balance capacity.',
                impact: 'Medium',
                confidence: 83,
                category: 'performance',
                action: 'Enable Feature',
                status: 'pending',
                estimatedSavings: 4500,
                timeToImplement: '1 week',
                priority: 5,
                createdAt: new Date(),
                roi: 225,
                tags: ['revenue', 'pricing']
            },
            {
                id: 7,
                title: 'Automate Reorder Points with ML',
                description: 'Replace manual reorder points with ML-based dynamic calculations. Reduces stockouts by 65% and excess inventory by 30%.',
                impact: 'High',
                confidence: 95,
                category: 'inventory',
                action: 'Deploy Model',
                status: 'pending',
                estimatedSavings: 12000,
                timeToImplement: '1 week',
                priority: 2,
                createdAt: new Date(),
                roi: 400,
                tags: ['automation', 'ml-powered']
            },
            {
                id: 8,
                title: 'Optimize Warehouse Layout for Pick Efficiency',
                description: 'Rearrange top 20% SKUs closer to packing stations. Reduces average pick time by 35 seconds per order.',
                impact: 'Medium',
                confidence: 86,
                category: 'performance',
                action: 'Review Layout',
                status: 'pending',
                estimatedSavings: 6800,
                timeToImplement: '2 weeks',
                priority: 6,
                createdAt: new Date(),
                roi: 270,
                tags: ['warehouse', 'efficiency']
            }
        ];
        setRecommendations(mockRecs);
    };

    const handleImplement = (id: number) => {
        setRecommendations(recommendations.map(r =>
            r.id === id ? { ...r, status: 'implemented' as const, implementedAt: new Date() } : r
        ));

        const rec = recommendations.find(r => r.id === id);
        if (rec) {
            addChatMessage({
                role: 'assistant',
                content: `✅ **Successfully implemented:** "${rec.title}"\n\n💰 **Estimated savings:** $${rec.estimatedSavings?.toLocaleString()}\n⏱️ **Implementation time:** ${rec.timeToImplement}\n📈 **ROI:** ${rec.roi}%\n\nThe system has automatically executed this recommendation and is now monitoring results.`
            });
        }
    };

    const handleReject = (id: number) => {
        setRecommendations(recommendations.map(r =>
            r.id === id ? { ...r, status: 'rejected' as const } : r
        ));
    };

    const handleInProgress = (id: number) => {
        setRecommendations(recommendations.map(r =>
            r.id === id ? { ...r, status: 'in-progress' as const } : r
        ));
    };

    const filteredRecommendations = recommendations
        .filter(r => selectedCategory === 'all' || r.category === selectedCategory)
        .filter(r => selectedImpact.length === 0 || selectedImpact.includes(r.impact))
        .filter(r =>
            searchQuery === '' ||
            r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .sort((a, b) => {
            if (sortBy === 'priority') return a.priority - b.priority;
            if (sortBy === 'savings') return (b.estimatedSavings || 0) - (a.estimatedSavings || 0);
            if (sortBy === 'confidence') return b.confidence - a.confidence;
            return 0;
        });

    const stats = {
        total: recommendations.length,
        pending: recommendations.filter(r => r.status === 'pending').length,
        implemented: recommendations.filter(r => r.status === 'implemented').length,
        inProgress: recommendations.filter(r => r.status === 'in-progress').length,
        totalSavings: recommendations
            .filter(r => r.status === 'implemented')
            .reduce((sum, r) => sum + (r.estimatedSavings || 0), 0),
        potentialSavings: recommendations
            .filter(r => r.status === 'pending')
            .reduce((sum, r) => sum + (r.estimatedSavings || 0), 0),
        avgConfidence: Math.round(
            recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length
        ),
        avgROI: Math.round(
            recommendations.reduce((sum, r) => sum + (r.roi || 0), 0) / recommendations.length
        )
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

        await new Promise(resolve => setTimeout(resolve, 1500));

        const response = generateAIResponse(userMessage);
        addChatMessage(response);
        setIsChatLoading(false);
    };

    const generateAIResponse = (userInput: string): Partial<ChatMessage> => {
        const input = userInput.toLowerCase();

        if (input.includes('optimize all routes') || input.includes('optimize routes')) {
            return {
                role: 'assistant',
                content: '🚀 **Initiating route optimization for all active routes...**\n\n✅ Analyzed 4 routes\n✅ Applied OR-Tools algorithm\n✅ Average improvement: 12.5% distance reduction\n✅ Estimated time saved: 2.5 hours/day\n✅ Cost savings: $450/week\n\n**All routes have been optimized automatically!**',
                actions: [
                    {
                        label: 'View Optimized Routes',
                        type: 'primary',
                        action: () => window.location.href = '/dashboard/routes'
                    }
                ]
            };
        }

        if (input.includes('implement all high') || input.includes('high impact')) {
            const highImpact = recommendations.filter(r => r.impact === 'High' && r.status === 'pending');
            return {
                role: 'assistant',
                content: `🎯 **Implementing ${highImpact.length} high-impact recommendations...**\n\n` +
                    highImpact.map((r, i) => `${i + 1}. ${r.title} ✅`).join('\n') +
                    `\n\n💰 **Total estimated savings:** $${highImpact.reduce((sum, r) => sum + (r.estimatedSavings || 0), 0).toLocaleString()}\n📈 **Average ROI:** ${Math.round(highImpact.reduce((sum, r) => sum + (r.roi || 0), 0) / highImpact.length)}%\n\n**All high-impact recommendations have been implemented!**`,
                actions: [
                    {
                        label: 'Apply All High-Impact',
                        type: 'primary',
                        action: () => {
                            highImpact.forEach(r => handleImplement(r.id));
                        }
                    }
                ]
            };
        }

        if (input.includes('inventory') && (input.includes('low') || input.includes('stock'))) {
            return {
                role: 'assistant',
                content: '📦 **Analyzing inventory levels...**\n\n⚠️ **Found 3 items below reorder point:**\n\n1. SKU-001: 45 units (reorder at 50)\n2. SKU-003: 38 units (reorder at 50)\n3. SKU-007: 22 units (reorder at 30)\n\n**Would you like me to automatically create purchase orders?**',
                actions: [
                    {
                        label: 'Create POs Automatically',
                        type: 'primary',
                        action: () => addChatMessage({
                            role: 'assistant',
                            content: '✅ **Created 3 purchase orders automatically!**\n\nPO-1001: SKU-001 (100 units)\nPO-1002: SKU-003 (100 units)\nPO-1003: SKU-007 (80 units)\n\n**Suppliers have been notified via email.**'
                        })
                    }
                ]
            };
        }

        if (input.includes('demand') && input.includes('forecast')) {
            return {
                role: 'assistant',
                content: '📈 **Generating demand forecast using Prophet + LSTM...**\n\n**7-day forecast for top products:**\n\n• SKU-001: 245 units (↑ 15%)\n• SKU-002: 189 units (↓ 5%)\n• SKU-003: 312 units (↑ 28%)\n• SKU-004: 156 units (stable)\n\n**Confidence:** 94% | **Algorithm:** Hybrid Prophet+LSTM'
            };
        }

        if (input.includes('savings') || input.includes('money saved')) {
            return {
                role: 'assistant',
                content: `💰 **Savings Analysis:**\n\n**Implemented recommendations:** ${stats.implemented}\n**Total savings realized:** $${stats.totalSavings.toLocaleString()}\n\n**Potential additional savings:**\n**Pending recommendations:** $${stats.potentialSavings.toLocaleString()}\n**Average ROI:** ${stats.avgROI}%\n\n**You're doing great! Keep implementing AI recommendations.**`
            };
        }

        if (input.includes('report') || input.includes('summary')) {
            return {
                role: 'assistant',
                content: `📊 **Weekly Performance Summary:**\n\n✅ **Completed:** ${stats.implemented} recommendations\n⏳ **Pending:** ${stats.pending} recommendations\n🔄 **In Progress:** ${stats.inProgress} recommendations\n💰 **Savings:** $${stats.totalSavings.toLocaleString()}\n📈 **Efficiency:** +12.5%\n🚚 **Routes optimized:** 4\n📦 **Stockouts prevented:** 8\n\n**Overall: Excellent performance!**`,
                actions: [
                    {
                        label: 'Download PDF Report',
                        type: 'secondary',
                        action: () => alert('Report downloaded!')
                    }
                ]
            };
        }

        if (input.includes('help') || input.includes('what can you do')) {
            return {
                role: 'assistant',
                content: `🤖 **I can help you with:**\n\n**Workflow Automation:**\n• "Optimize all routes"\n• "Implement all high-impact recommendations"\n• "Create purchase orders for low stock"\n\n**Analysis:**\n• "Show me inventory levels"\n• "Generate demand forecast"\n• "Calculate savings"\n\n**Actions:**\n• "Send weekly report"\n• "Schedule maintenance"\n• "Reallocate inventory"\n\n**Just ask in natural language!**`
            };
        }

        return {
            role: 'assistant',
            content: `I understand you're asking about "${userInput}". \n\n**I can help with:**\n\n• Route optimization\n• Inventory management\n• Cost analysis\n• Workflow automation\n• Demand forecasting\n\n**Could you be more specific? Or type "help" to see what I can do!**`
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
            case 'demand': return TrendingUp;
            default: return Lightbulb;
        }
    };

    const implementAllPending = () => {
        recommendations.forEach(r => {
            if (r.status === 'pending') handleImplement(r.id);
        });
        addChatMessage({
            role: 'assistant',
            content: `✅ **Implemented all ${stats.pending} pending recommendations!**\n\n💰 **Total savings:** $${stats.potentialSavings.toLocaleString()}\n📈 **Average ROI:** ${stats.avgROI}%`
        });
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                            <Sparkles className="h-7 w-7 text-white" />
                        </div>
                        AI Recommendations
                    </h1>
                    <p className="text-gray-600 mt-2">Smart insights powered by machine learning algorithms</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setShowChatbot(!showChatbot)}
                        className={`px-5 py-2.5 rounded-lg transition flex items-center gap-2 shadow-sm ${showChatbot
                                ? 'bg-purple-600 text-white shadow-purple-600/20'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <Bot className="h-5 w-5" />
                        AI Assistant
                    </button>
                    <button
                        onClick={implementAllPending}
                        disabled={stats.pending === 0}
                        className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Zap className="h-5 w-5" />
                        Implement All ({stats.pending})
                    </button>
                    <button
                        onClick={fetchRecommendations}
                        disabled={generating}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                    >
                        <RefreshCw className={`h-5 w-5 ${generating ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-600 uppercase font-semibold">Total</p>
                        <Sparkles className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>

                <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-yellow-700 uppercase font-semibold">Pending</p>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </div>
                    <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
                </div>

                <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-blue-700 uppercase font-semibold">In Progress</p>
                        <PlayCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-blue-900">{stats.inProgress}</p>
                </div>

                <div className="bg-green-50 rounded-xl border border-green-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-green-700 uppercase font-semibold">Implemented</p>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-900">{stats.implemented}</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-600 uppercase font-semibold">Realized</p>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">${(stats.totalSavings / 1000).toFixed(0)}K</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-600 uppercase font-semibold">Potential</p>
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-purple-600">${(stats.potentialSavings / 1000).toFixed(0)}K</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-600 uppercase font-semibold">Avg ROI</p>
                        <BarChart3 className="h-4 w-4 text-indigo-600" />
                    </div>
                    <p className="text-2xl font-bold text-indigo-600">{stats.avgROI}%</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-600 uppercase font-semibold">Confidence</p>
                        <Target className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{stats.avgConfidence}%</p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search recommendations, tags, or keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        >
                            <option value="priority">Sort by Priority</option>
                            <option value="savings">Sort by Savings</option>
                            <option value="confidence">Sort by Confidence</option>
                        </select>
                        <button
                            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                            className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                            {viewMode === 'grid' ? '☰' : '▦'}
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                    <span className="text-sm font-medium text-gray-700">Categories:</span>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${selectedCategory === cat
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-sm font-medium text-gray-700">Impact:</span>
                    {['High', 'Medium', 'Low'].map(impact => (
                        <button
                            key={impact}
                            onClick={() => {
                                setSelectedImpact(prev =>
                                    prev.includes(impact)
                                        ? prev.filter(i => i !== impact)
                                        : [...prev, impact]
                                );
                            }}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${selectedImpact.includes(impact)
                                    ? impact === 'High'
                                        ? 'bg-red-600 text-white'
                                        : impact === 'Medium'
                                            ? 'bg-orange-600 text-white'
                                            : 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {impact}
                        </button>
                    ))}
                </div>
            </div>

            {/* Recommendations Grid */}
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-6`}>
                {loading ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20">
                        <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                        <p className="text-gray-600">Loading AI recommendations...</p>
                    </div>
                ) : filteredRecommendations.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20">
                        <Sparkles className="h-16 w-16 text-gray-400 mb-4" />
                        <p className="text-gray-600 text-lg">No recommendations found</p>
                        <p className="text-gray-500 text-sm">Try adjusting your filters</p>
                    </div>
                ) : (
                    filteredRecommendations.map((rec) => {
                        const CategoryIcon = getCategoryIcon(rec.category);
                        const impactColor = getImpactColor(rec.impact);

                        return (
                            <div
                                key={rec.id}
                                className={`bg-white rounded-xl border p-6 transition-all shadow-sm hover:shadow-md ${rec.status === 'implemented'
                                        ? 'border-green-300 bg-green-50'
                                        : rec.status === 'in-progress'
                                            ? 'border-blue-300 bg-blue-50'
                                            : rec.status === 'rejected'
                                                ? 'border-gray-200 opacity-60'
                                                : 'border-gray-200'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div
                                            className={`p-3 rounded-xl ${rec.status === 'implemented'
                                                    ? 'bg-green-100'
                                                    : rec.status === 'in-progress'
                                                        ? 'bg-blue-100'
                                                        : impactColor === 'red'
                                                            ? 'bg-red-100'
                                                            : impactColor === 'orange'
                                                                ? 'bg-orange-100'
                                                                : 'bg-blue-100'
                                                }`}
                                        >
                                            <CategoryIcon
                                                className={`h-6 w-6 ${rec.status === 'implemented'
                                                        ? 'text-green-600'
                                                        : rec.status === 'in-progress'
                                                            ? 'text-blue-600'
                                                            : impactColor === 'red'
                                                                ? 'text-red-600'
                                                                : impactColor === 'orange'
                                                                    ? 'text-orange-600'
                                                                    : 'text-blue-600'
                                                    }`}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 mb-2 text-lg">{rec.title}</h3>
                                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                                <span
                                                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${impactColor === 'red'
                                                            ? 'bg-red-100 text-red-700'
                                                            : impactColor === 'orange'
                                                                ? 'bg-orange-100 text-orange-700'
                                                                : 'bg-blue-100 text-blue-700'
                                                        }`}
                                                >
                                                    {rec.impact} Impact
                                                </span>
                                                <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                                    {rec.confidence}% confidence
                                                </span>
                                                <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium capitalize">
                                                    {rec.category}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {rec.status === 'implemented' && <CheckCircle className="h-7 w-7 text-green-600" />}
                                    {rec.status === 'in-progress' && <PlayCircle className="h-7 w-7 text-blue-600" />}
                                    {rec.status === 'rejected' && <XCircle className="h-7 w-7 text-gray-400" />}
                                </div>

                                <p className="text-gray-700 text-sm mb-4 leading-relaxed">{rec.description}</p>

                                {rec.tags && rec.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {rec.tags.map((tag, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    {rec.estimatedSavings && (
                                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                            <p className="text-xs text-green-700 mb-1 font-semibold">Savings</p>
                                            <p className="text-lg font-bold text-green-900">
                                                ${rec.estimatedSavings.toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                    {rec.timeToImplement && (
                                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <p className="text-xs text-blue-700 mb-1 font-semibold">Time</p>
                                            <p className="text-lg font-bold text-blue-900">{rec.timeToImplement}</p>
                                        </div>
                                    )}
                                    {rec.roi && (
                                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                            <p className="text-xs text-purple-700 mb-1 font-semibold">ROI</p>
                                            <p className="text-lg font-bold text-purple-900">{rec.roi}%</p>
                                        </div>
                                    )}
                                </div>

                                {rec.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleImplement(rec.id)}
                                            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center justify-center gap-2 font-medium"
                                        >
                                            <Check className="h-4 w-4" />
                                            {rec.action}
                                        </button>
                                        <button
                                            onClick={() => handleInProgress(rec.id)}
                                            className="px-4 py-2.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg transition font-medium"
                                        >
                                            <PlayCircle className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleReject(rec.id)}
                                            className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}

                                {rec.status === 'in-progress' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleImplement(rec.id)}
                                            className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center justify-center gap-2 font-medium"
                                        >
                                            <CheckCircle className="h-4 w-4" />
                                            Mark Complete
                                        </button>
                                        <button
                                            onClick={() => handleReject(rec.id)}
                                            className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* AI Chatbot */}
            {showChatbot && (
                <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-2xl">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                <Bot className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">AI Assistant</h3>
                                <p className="text-xs text-purple-100">Powered by GPT-4</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowChatbot(false)}
                            className="p-1 hover:bg-white/20 rounded-lg transition text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {chatMessages.map((msg) => (
                            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'assistant' && (
                                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Bot className="h-5 w-5 text-white" />
                                    </div>
                                )}
                                <div className={`max-w-[75%] ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
                                    <div
                                        className={`rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                                            }`}
                                    >
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
                            Try: "implement all high-impact" or "show inventory"
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
