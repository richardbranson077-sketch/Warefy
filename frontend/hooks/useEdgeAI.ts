import { useState, useEffect } from 'react';
import * as edgeAIService from '../services/edgeAI.service';
import { EdgeAIModel } from '../services/edgeAI.service';

export const useEdgeAI = () => {
    const [models, setModels] = useState<EdgeAIModel[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchModels = async () => {
        setLoading(true);
        try {
            const data = await edgeAIService.getModels();
            setModels(data);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const deployModel = async (model: Partial<EdgeAIModel>) => {
        setLoading(true);
        try {
            const newModel = await edgeAIService.deployModel(model);
            setModels(prev => [...prev, newModel]);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const deleteModel = async (id: string) => {
        setLoading(true);
        try {
            await edgeAIService.deleteModel(id);
            setModels(prev => prev.filter(m => m.id !== id));
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchModels();
    }, []);

    return { models, loading, error, fetchModels, deployModel, deleteModel };
};
