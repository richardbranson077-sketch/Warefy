import { useState, useEffect } from 'react';
import * as visionService from '../services/computerVision.service';
import { VisionResult } from '../services/computerVision.service';

export const useComputerVision = () => {
    const [results, setResults] = useState<VisionResult[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchResults = async () => {
        setLoading(true);
        try {
            const data = await visionService.getResults();
            setResults(data);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const analyze = async (imageUrl: string) => {
        setLoading(true);
        try {
            const result = await visionService.analyzeImage(imageUrl);
            setResults(prev => [...prev, result]);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const deleteResult = async (id: string) => {
        setLoading(true);
        try {
            await visionService.deleteResult(id);
            setResults(prev => prev.filter(r => r.id !== id));
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();
    }, []);

    return { results, loading, error, fetchResults, analyze, deleteResult };
};
