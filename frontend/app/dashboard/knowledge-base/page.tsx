'use client';

import { useState, useEffect } from 'react';
import { knowledgeBaseService, Article, SearchResult } from '@/services/knowledge_base.service';
import {
    BookOpen, Search, FileText, RefreshCw, Plus, Sparkles,
    X, ChevronRight, Calendar
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function KnowledgeBasePage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAskAI, setShowAskAI] = useState(false);

    // Create Article Form State
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newCategory, setNewCategory] = useState('General');
    const [newTags, setNewTags] = useState('');

    // Ask AI State
    const [aiQuestion, setAiQuestion] = useState('');
    const [aiAnswer, setAiAnswer] = useState('');
    const [askingAI, setAskingAI] = useState(false);

    useEffect(() => {
        loadArticles();
    }, []);

    const loadArticles = async () => {
        setLoading(true);
        try {
            const data = await knowledgeBaseService.getArticles();
            setArticles(data);
        } catch (error) {
            console.error('Failed to load articles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            // Use AI semantic search
            const results = await knowledgeBaseService.searchArticles(searchQuery);
            setSearchResults(results);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleCreateArticle = async () => {
        try {
            await knowledgeBaseService.createArticle({
                title: newTitle,
                content: newContent,
                category: newCategory,
                tags: newTags.split(',').map(t => t.trim()).filter(t => t)
            });
            setShowCreateModal(false);
            setNewTitle('');
            setNewContent('');
            setNewTags('');
            loadArticles();
        } catch (error) {
            console.error('Failed to create article:', error);
        }
    };

    const handleAskAI = async () => {
        if (!aiQuestion.trim()) return;

        setAskingAI(true);
        try {
            const result = await knowledgeBaseService.askAI(
                aiQuestion,
                selectedArticle?.id // Pass context if viewing an article
            );
            setAiAnswer(result.answer);
        } catch (error) {
            console.error('AI request failed:', error);
            setAiAnswer("Sorry, I couldn't process your request.");
        } finally {
            setAskingAI(false);
        }
    };

    // Filter articles for display when not using AI search results
    const displayArticles = searchQuery && searchResults.length > 0
        ? searchResults.map(r => r.article)
        : articles.filter(a =>
            a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.category.toLowerCase().includes(searchQuery.toLowerCase())
        );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <BookOpen className="h-8 w-8 text-indigo-600" />
                        Knowledge Base
                    </h1>
                    <p className="text-gray-500 mt-1">AI-powered documentation and guides</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowAskAI(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition font-medium"
                    >
                        <Sparkles className="h-4 w-4" />
                        Ask AI
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        New Article
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search for guides, troubleshooting, or policies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg transition-all"
                />
                <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                >
                    {isSearching ? 'Searching...' : 'Search'}
                </button>
            </div>

            {/* Content Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <RefreshCw className="h-10 w-10 text-gray-300 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayArticles.map((article) => (
                        <div
                            key={article.id}
                            onClick={() => setSelectedArticle(article)}
                            className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer flex flex-col h-full"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition">
                                    <FileText className="h-6 w-6 text-indigo-600" />
                                </div>
                                <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                    {article.category}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition">
                                {article.title}
                            </h3>

                            <p className="text-gray-500 text-sm mb-4 line-clamp-3 flex-grow">
                                {article.content.substring(0, 150)}...
                            </p>

                            <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                        {article.views} views
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> {new Date(article.updated_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-indigo-500 transition" />
                            </div>
                        </div>
                    ))}

                    {displayArticles.length === 0 && !loading && (
                        <div className="col-span-full text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
                            <div className="mx-auto h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Search className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No articles found</h3>
                            <p className="text-gray-500 mt-1">Try adjusting your search or create a new article.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Article Modal */}
            {selectedArticle && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                                        {selectedArticle.category}
                                    </span>
                                    {selectedArticle.tags.map((tag, i) => (
                                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full flex items-center gap-1">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">{selectedArticle.title}</h2>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setAiQuestion(`Summarize this article: ${selectedArticle.title}`);
                                        setShowAskAI(true);
                                    }}
                                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                                    title="Ask AI about this"
                                >
                                    <Sparkles className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => setSelectedArticle(null)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 prose prose-indigo max-w-none">
                            <ReactMarkdown>{selectedArticle.content}</ReactMarkdown>
                        </div>

                        <div className="p-4 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex justify-between">
                            <span>Last updated: {new Date(selectedArticle.updated_at).toLocaleString()}</span>
                            <span>Views: {selectedArticle.views}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Create New Article</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Article Title"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option>General</option>
                                        <option>Troubleshooting</option>
                                        <option>Policy</option>
                                        <option>Guide</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                                    <input
                                        type="text"
                                        value={newTags}
                                        onChange={(e) => setNewTags(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="tag1, tag2"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Content (Markdown supported)</label>
                                <textarea
                                    value={newContent}
                                    onChange={(e) => setNewContent(e.target.value)}
                                    rows={10}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                                    placeholder="# Heading\n\nContent..."
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateArticle}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                            >
                                Create Article
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Ask AI Modal */}
            {showAskAI && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Sparkles className="h-5 w-5" />
                                Ask AI Assistant
                            </h2>
                            <button onClick={() => setShowAskAI(false)} className="text-white/80 hover:text-white">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            {aiAnswer ? (
                                <div className="mb-6">
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-bold text-gray-600">You</span>
                                        </div>
                                        <p className="text-gray-800 bg-gray-50 p-3 rounded-lg rounded-tl-none">{aiQuestion}</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                            <Sparkles className="h-4 w-4 text-purple-600" />
                                        </div>
                                        <div className="prose prose-sm prose-purple bg-purple-50 p-4 rounded-lg rounded-tl-none w-full">
                                            <ReactMarkdown>{aiAnswer}</ReactMarkdown>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex justify-end">
                                        <button
                                            onClick={() => {
                                                setAiAnswer('');
                                                setAiQuestion('');
                                            }}
                                            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                                        >
                                            Ask another question
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-gray-600 mb-4 text-sm">
                                        Ask any question about the knowledge base or get help with specific topics.
                                        {selectedArticle && <span className="block mt-1 font-medium text-indigo-600">Context: {selectedArticle.title}</span>}
                                    </p>
                                    <textarea
                                        value={aiQuestion}
                                        onChange={(e) => setAiQuestion(e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none mb-4 resize-none"
                                        placeholder="How do I reset my password?"
                                    />
                                    <button
                                        onClick={handleAskAI}
                                        disabled={askingAI || !aiQuestion.trim()}
                                        className="w-full py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {askingAI ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                                Thinking...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="h-4 w-4" />
                                                Get Answer
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
