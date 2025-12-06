import apiClient from '@/lib/api';

export interface Article {
    id: number;
    title: string;
    content: string;
    category: string;
    tags: string[];
    author_id: number;
    views: number;
    created_at: string;
    updated_at: string;
}

export interface CreateArticleData {
    title: string;
    content: string;
    category: string;
    tags: string[];
}

export interface UpdateArticleData {
    title?: string;
    content?: string;
    category?: string;
    tags?: string[];
}

export interface SearchResult {
    article: Article;
    relevance: string;
    reason: string;
}

export const knowledgeBaseService = {
    async getArticles(category?: string, search?: string): Promise<Article[]> {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (search) params.append('search', search);
        const response = await apiClient.get(`/api/v1/knowledge-base/articles?${params.toString()}`);
        return response.data;
    },

    async getArticle(id: number): Promise<Article> {
        const response = await apiClient.get(`/api/v1/knowledge-base/articles/${id}`);
        return response.data;
    },

    async createArticle(data: CreateArticleData): Promise<Article> {
        const response = await apiClient.post('/api/v1/knowledge-base/articles', data);
        return response.data;
    },

    async updateArticle(id: number, data: UpdateArticleData): Promise<Article> {
        const response = await apiClient.put(`/api/v1/knowledge-base/articles/${id}`, data);
        return response.data;
    },

    async deleteArticle(id: number): Promise<void> {
        await apiClient.delete(`/api/v1/knowledge-base/articles/${id}`);
    },

    async searchArticles(query: string): Promise<SearchResult[]> {
        const response = await apiClient.post('/api/v1/knowledge-base/search', { query });
        return response.data;
    },

    async askAI(question: string, contextArticleId?: number): Promise<{ answer: string }> {
        const response = await apiClient.post('/api/v1/knowledge-base/ask', {
            question,
            context_article_id: contextArticleId
        });
        return response.data;
    }
};
