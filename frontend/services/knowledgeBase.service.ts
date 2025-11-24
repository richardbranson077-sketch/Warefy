import apiClient from '../lib/api';

export interface KnowledgeArticle {
    id: string;
    title: string;
    content: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

export const getArticles = async (): Promise<KnowledgeArticle[]> => {
    const response = await apiClient.get<KnowledgeArticle[]>('/api/v1/knowledge/articles');
    return response.data;
};

export const createArticle = async (article: Partial<KnowledgeArticle>): Promise<KnowledgeArticle> => {
    const response = await apiClient.post<KnowledgeArticle>('/api/v1/knowledge/articles', article);
    return response.data;
};

export const deleteArticle = async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/knowledge/articles/${id}`);
};
