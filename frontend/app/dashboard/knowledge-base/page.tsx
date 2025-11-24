'use client';

import { useState } from 'react';
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase';
import { LoadingSpinner } from '@/components/LoadingStates';
import { ErrorAlert } from '@/components/ErrorStates';
import { BookOpen, Search, FileText, RefreshCw } from 'lucide-react';

export default function KnowledgeBasePage() {
    const { data: articles, loading, error, refetch } = useKnowledgeBase();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredArticles = (articles || []).filter(article =>
        article.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            {loading && <LoadingSpinner />}
            {error && <ErrorAlert message={error} />}
            {!loading && !error && (
                <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <BookOpen className="h-8 w-8 text-indigo-400" />
                                Knowledge Base
                            </h1>
                            <p className="text-gray-400 mt-1">Documentation and guides</p>
                        </div>
                        <button onClick={() => refetch()} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition">
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredArticles.length === 0 ? (
                            <div className="col-span-3 bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
                                <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400">No articles found</p>
                            </div>
                        ) : (
                            filteredArticles.map((article) => (
                                <div key={article.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-indigo-500 transition cursor-pointer">
                                    <FileText className="h-8 w-8 text-indigo-400 mb-3" />
                                    <h3 className="font-bold text-lg mb-2">{article.title}</h3>
                                    <p className="text-sm text-gray-400">{article.summary}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
