import { useState, useEffect } from 'react';
import * as aiRecService from '../services/aiRecommendations.service';
import { AIRecommendation } from '../services/aiRecommendations.service';

export const useAIRecommendations = () => {
    const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRecommendations = async () => {
        setLoading(true);
        try {
            const data = await aiRecService.getRecommendations();
            setRecommendations(data);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const createRecommendation = async (rec: Partial<AIRecommendation>) => {
        setLoading(true);
        try {
            const newRec = await aiRecService.createRecommendation(rec);
            setRecommendations(prev => [...prev, newRec]);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const deleteRecommendation = async (id: string) => {
        setLoading(true);
        try {
            await aiRecService.deleteRecommendation(id);
            setRecommendations(prev => prev.filter(r => r.id !== id));
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommendations();
    }, []);

    return { recommendations, loading, error, fetchRecommendations, createRecommendation, deleteRecommendation };
};
