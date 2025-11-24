import { useState, useEffect } from 'react';
import * as kbService from '../services/knowledgeBase.service';
import { KnowledgeArticle } from '../services/knowledgeBase.service';

export const useKnowledgeBase = () => {
    const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const data = await kbService.getArticles();
            setArticles(data);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const createArticle = async (article: Partial<KnowledgeArticle>) => {
        setLoading(true);
        try {
            const newArticle = await kbService.createArticle(article);
            setArticles(prev => [...prev, newArticle]);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const deleteArticle = async (id: string) => {
        setLoading(true);
        try {
            await kbService.deleteArticle(id);
            setArticles(prev => prev.filter(a => a.id !== id));
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    return { articles, loading, error, fetchArticles, createArticle, deleteArticle };
};
