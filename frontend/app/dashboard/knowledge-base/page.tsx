'use client';

import { useState } from 'react';
import {
    BookOpen,
    Search,
    FileText,
    Video,
    HelpCircle,
    Star,
    ThumbsUp,
    ThumbsDown,
    Share2,
    Bookmark,
    Clock,
    User,
    Tag,
    TrendingUp,
    Lightbulb,
    Code,
    Zap,
    Package,
    Truck,
    BarChart3,
    Settings,
    Download,
    Eye,
    MessageSquare,
    ChevronRight,
    Filter
} from 'lucide-react';

interface Article {
    id: string;
    title: string;
    category: string;
    description: string;
    views: number;
    helpful: number;
    lastUpdated: string;
    readTime: string;
    tags: string[];
    featured?: boolean;
}

interface Category {
    id: string;
    name: string;
    icon: any;
    count: number;
    color: string;
}

export default function KnowledgeBasePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

    const categories: Category[] = [
        { id: 'all', name: 'All Articles', icon: BookOpen, count: 48, color: 'gray' },
        { id: 'getting-started', name: 'Getting Started', icon: Zap, count: 12, color: 'blue' },
        { id: 'inventory', name: 'Inventory Management', icon: Package, count: 15, color: 'green' },
        { id: 'routes', name: 'Route Optimization', icon: Truck, count: 8, color: 'purple' },
        { id: 'analytics', name: 'Analytics & Reports', icon: BarChart3, count: 10, color: 'indigo' },
        { id: 'api', name: 'API Documentation', icon: Code, count: 6, color: 'orange' }
    ];

    const articles: Article[] = [
        {
            id: '1',
            title: 'Getting Started with Warefy',
            category: 'getting-started',
            description: 'Learn the basics of Warefy and set up your first warehouse in minutes.',
            views: 1245,
            helpful: 98,
            lastUpdated: '2 days ago',
            readTime: '5 min',
            tags: ['beginner', 'setup', 'tutorial'],
            featured: true
        },
        {
            id: '2',
            title: 'How to Optimize Delivery Routes',
            category: 'routes',
            description: 'Use AI-powered route optimization to reduce delivery time and fuel costs.',
            views: 892,
            helpful: 87,
            lastUpdated: '1 week ago',
            readTime: '8 min',
            tags: ['routes', 'optimization', 'ai'],
            featured: true
        },
        {
            id: '3',
            title: 'Inventory Tracking Best Practices',
            category: 'inventory',
            description: 'Master inventory management with real-time tracking and automated alerts.',
            views: 756,
            helpful: 92,
            lastUpdated: '3 days ago',
            readTime: '6 min',
            tags: ['inventory', 'tracking', 'automation']
        },
        {
            id: '4',
            title: 'Understanding AI Demand Forecasting',
            category: 'analytics',
            description: 'Learn how Prophet, LSTM, and XGBoost models predict future demand.',
            views: 634,
            helpful: 85,
            lastUpdated: '5 days ago',
            readTime: '10 min',
            tags: ['ai', 'forecasting', 'analytics'],
            featured: true
        },
        {
            id: '5',
            title: 'REST API Authentication Guide',
            category: 'api',
            description: 'Secure your API calls with JWT tokens and OAuth 2.0 authentication.',
            views: 523,
            helpful: 78,
            lastUpdated: '1 week ago',
            readTime: '7 min',
            tags: ['api', 'security', 'authentication']
        },
        {
            id: '6',
            title: 'Setting Up Barcode Scanning',
            category: 'inventory',
            description: 'Configure barcode and QR code scanning for faster package processing.',
            views: 445,
            helpful: 81,
            lastUpdated: '4 days ago',
            readTime: '5 min',
            tags: ['scanning', 'barcode', 'setup']
        },
        {
            id: '7',
            title: 'Creating Custom Reports',
            category: 'analytics',
            description: 'Build custom analytics dashboards and export data in multiple formats.',
            views: 389,
            helpful: 73,
            lastUpdated: '6 days ago',
            readTime: '9 min',
            tags: ['reports', 'analytics', 'export']
        },
        {
            id: '8',
            title: 'Webhook Integration Tutorial',
            category: 'api',
            description: 'Set up real-time webhooks to receive instant notifications about events.',
            views: 312,
            helpful: 69,
            lastUpdated: '1 week ago',
            readTime: '6 min',
            tags: ['webhooks', 'integration', 'api']
        }
    ];

    const filteredArticles = articles.filter(article => {
        const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
        const matchesSearch = searchQuery === '' ||
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const featuredArticles = articles.filter(a => a.featured);

    const getCategoryColor = (categoryId: string) => {
        const category = categories.find(c => c.id === categoryId);
        return category?.color || 'gray';
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                        <BookOpen className="h-7 w-7 text-white" />
                    </div>
                    Knowledge Base
                </h1>
                <p className="text-gray-600">Find answers, tutorials, and documentation</p>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search articles, guides, and documentation..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
                    />
                </div>
            </div>

            {/* Featured Articles */}
            {searchQuery === '' && selectedCategory === 'all' && (
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
                        Featured Articles
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {featuredArticles.map(article => (
                            <div
                                key={article.id}
                                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-6 hover:shadow-lg transition cursor-pointer"
                                onClick={() => setSelectedArticle(article)}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <span className={`px-3 py-1 bg-${getCategoryColor(article.category)}-100 text-${getCategoryColor(article.category)}-700 rounded-full text-xs font-bold`}>
                                        {categories.find(c => c.id === article.category)?.name}
                                    </span>
                                    <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2 text-lg">{article.title}</h3>
                                <p className="text-gray-600 text-sm mb-4">{article.description}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Eye className="h-3 w-3" />
                                        {article.views}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {article.readTime}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Categories Sidebar */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm h-fit">
                    <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
                    <div className="space-y-2">
                        {categories.map(category => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`w-full px-4 py-3 rounded-lg transition flex items-center justify-between ${selectedCategory === category.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <span className="flex items-center gap-3">
                                    <category.icon className="h-5 w-5" />
                                    <span className="font-medium">{category.name}</span>
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${selectedCategory === category.id
                                        ? 'bg-white/20 text-white'
                                        : 'bg-gray-200 text-gray-700'
                                    }`}>
                                    {category.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Articles List */}
                <div className="lg:col-span-3 space-y-4">
                    {filteredArticles.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No articles found</h3>
                            <p className="text-gray-600">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        filteredArticles.map(article => (
                            <div
                                key={article.id}
                                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition cursor-pointer"
                                onClick={() => setSelectedArticle(article)}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-3 py-1 bg-${getCategoryColor(article.category)}-100 text-${getCategoryColor(article.category)}-700 rounded-full text-xs font-bold`}>
                                                {categories.find(c => c.id === article.category)?.name}
                                            </span>
                                            {article.featured && (
                                                <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                                            )}
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-lg mb-2">{article.title}</h3>
                                        <p className="text-gray-600 mb-3">{article.description}</p>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {article.tags.map(tag => (
                                                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-4" />
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Eye className="h-4 w-4" />
                                            {article.views} views
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <ThumbsUp className="h-4 w-4" />
                                            {article.helpful}% helpful
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            {article.readTime} read
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-500">Updated {article.lastUpdated}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Article Modal */}
            {selectedArticle && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedArticle(null)}>
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-8">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex-1">
                                    <span className={`px-3 py-1 bg-${getCategoryColor(selectedArticle.category)}-100 text-${getCategoryColor(selectedArticle.category)}-700 rounded-full text-sm font-bold`}>
                                        {categories.find(c => c.id === selectedArticle.category)?.name}
                                    </span>
                                    <h2 className="text-3xl font-bold text-gray-900 mt-4 mb-3">{selectedArticle.title}</h2>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            {selectedArticle.readTime} read
                                        </span>
                                        <span>•</span>
                                        <span>Updated {selectedArticle.lastUpdated}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedArticle(null)}
                                    className="text-gray-400 hover:text-gray-600 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="prose max-w-none mb-8">
                                <p className="text-gray-700 text-lg mb-6">{selectedArticle.description}</p>
                                <p className="text-gray-600">
                                    This is a placeholder for the full article content. In a real implementation,
                                    this would contain the complete documentation, step-by-step guides, code examples,
                                    screenshots, and detailed explanations.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
                                <button className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition">
                                    <ThumbsUp className="h-4 w-4" />
                                    Helpful
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                                    <ThumbsDown className="h-4 w-4" />
                                    Not Helpful
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition ml-auto">
                                    <Bookmark className="h-4 w-4" />
                                    Save
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                                    <Share2 className="h-4 w-4" />
                                    Share
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
